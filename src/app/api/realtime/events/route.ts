import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import {
  shouldDeliverRealtimeEvent,
  subscribeRealtimeEvents,
  type RealtimeViewer,
} from "@/lib/realtime";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const HEARTBEAT_INTERVAL_MS = 20_000;

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { error: "غير مصرح" },
      { status: 401, headers: { "Cache-Control": "no-store" } }
    );
  }

  const viewer: RealtimeViewer = {
    id: user.id,
    role: user.role,
    gradeId: user.gradeId,
    schoolCategory: user.schoolCategory,
  };

  const encoder = new TextEncoder();
  let cleanup = () => {};

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      let closed = false;

      const safeEnqueue = (chunk: string) => {
        if (closed) return;
        try {
          controller.enqueue(encoder.encode(chunk));
        } catch {
          cleanup();
        }
      };

      const unsubscribe = subscribeRealtimeEvents((event) => {
        if (!shouldDeliverRealtimeEvent(event, viewer)) {
          return;
        }
        safeEnqueue(`id: ${event.id}\ndata: ${JSON.stringify(event)}\n\n`);
      });

      const heartbeat = setInterval(() => {
        safeEnqueue(`: keepalive ${Date.now()}\n\n`);
      }, HEARTBEAT_INTERVAL_MS);

      const onAbort = () => {
        cleanup();
      };

      cleanup = () => {
        if (closed) return;
        closed = true;
        clearInterval(heartbeat);
        unsubscribe();
        req.signal.removeEventListener("abort", onAbort);
        try {
          controller.close();
        } catch {
          // Stream may already be closed
        }
      };

      req.signal.addEventListener("abort", onAbort);

      // Initial handshake + retry interval directive for EventSource
      safeEnqueue(
        `retry: 3000\ndata: ${JSON.stringify({
          type: "connected",
          userId: viewer.id,
          role: viewer.role,
          timestamp: Date.now(),
        })}\n\n`
      );
    },
    cancel() {
      cleanup();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-store, no-transform, must-revalidate",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}

