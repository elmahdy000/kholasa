"use client";

import { useEffect, useRef, type ReactNode, type KeyboardEvent, type MouseEvent } from "react";
import { createPortal } from "react-dom";

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

let scrollLocks = 0;
let previousOverflow = "";

function lockScroll() {
  if (scrollLocks === 0) {
    previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
  }
  scrollLocks += 1;
}

function unlockScroll() {
  scrollLocks = Math.max(0, scrollLocks - 1);
  if (scrollLocks === 0) document.body.style.overflow = previousOverflow;
}

export interface DialogProps {
  open: boolean;
  onClose: () => void;
  /** id of the element that titles the dialog */
  labelledBy?: string;
  /** fallback accessible name when there is no visible title */
  ariaLabel?: string;
  describedBy?: string;
  children: ReactNode;
  /** classes for the full-screen backdrop (positioning, blur, padding) */
  overlayClassName?: string;
  /** classes for the dialog panel */
  className?: string;
  /** close when the backdrop is clicked (default true) */
  closeOnOverlayClick?: boolean;
  /** close on Escape (default true) */
  closeOnEscape?: boolean;
  /** element to focus first; defaults to first focusable, then the panel */
  initialFocusRef?: React.RefObject<HTMLElement | null>;
}

/**
 * Accessible modal dialog: role="dialog", aria-modal, focus trap, Escape to close,
 * focus restoration and body scroll lock. Rendered into document.body.
 */
export function Dialog({
  open,
  onClose,
  labelledBy,
  ariaLabel,
  describedBy,
  children,
  overlayClassName = "fixed inset-0 z-50 bg-black/60  flex items-center justify-center p-4",
  className,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  initialFocusRef,
}: DialogProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) return;
    const opener = document.activeElement as HTMLElement | null;
    lockScroll();

    const frame = requestAnimationFrame(() => {
      const panel = panelRef.current;
      if (!panel || panel.contains(document.activeElement)) return;
      const target =
        initialFocusRef?.current ?? panel.querySelector<HTMLElement>(FOCUSABLE) ?? panel;
      target.focus();
    });

    return () => {
      cancelAnimationFrame(frame);
      unlockScroll();
      if (opener && document.contains(opener)) opener.focus();
    };
    // initialFocusRef is a stable ref object
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open || typeof document === "undefined") return null;

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape" && closeOnEscape) {
      e.stopPropagation();
      e.preventDefault();
      onCloseRef.current();
      return;
    }
    if (e.key !== "Tab") return;
    const panel = panelRef.current;
    if (!panel) return;
    const items = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
      (el) => el.offsetParent !== null || el === document.activeElement
    );
    if (items.length === 0) {
      e.preventDefault();
      panel.focus();
      return;
    }
    const first = items[0];
    const last = items[items.length - 1];
    const active = document.activeElement;
    if (e.shiftKey && (active === first || active === panel)) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && active === last) {
      e.preventDefault();
      first.focus();
    }
  };

  const handleOverlayClick = (e: MouseEvent<HTMLDivElement>) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) onCloseRef.current();
  };

  return createPortal(
    // The backdrop only handles pointer dismissal; keyboard dismissal is Escape on the panel.
    <div className={overlayClassName} onMouseDown={handleOverlayClick} dir="rtl">
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        aria-label={labelledBy ? undefined : ariaLabel}
        aria-describedby={describedBy}
        tabIndex={-1}
        onKeyDown={handleKeyDown}
        className={className}
      >
        {children}
      </div>
    </div>,
    document.body
  );
}
