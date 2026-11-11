import { describe, expect, it } from "vitest";
import {
  normalizeDigits,
  PAYMENT_METHODS,
  SUBSCRIPTION_PRICE_EGP,
  validateSenderPhone,
} from "@/components/student/subscription/payment-methods";

describe("Subscription Payment Confirmation Helpers & Validation", () => {
  it("preserves exact real subscription price and approved transfer numbers", () => {
    expect(SUBSCRIPTION_PRICE_EGP).toBe(200);
    expect(PAYMENT_METHODS).toHaveLength(2);

    const instapay = PAYMENT_METHODS.find((m) => m.id === "instapay");
    const vodafone = PAYMENT_METHODS.find((m) => m.id === "vodafone_cash");

    expect(instapay?.accounts.map((a) => a.number)).toEqual(["01025131212"]);
    expect(vodafone?.accounts.map((a) => a.number)).toEqual([
      "01025131212",
      "01066711545",
    ]);
  });

  it("normalizes Arabic-Indic digits and spaces cleanly", () => {
    expect(normalizeDigits("٠١٠-٢٥١٣-١٢١٢")).toBe("01025131212");
    expect(normalizeDigits("  011 555 666 77 ")).toBe("01155566677");
  });

  it("validates mandatory Egyptian sender phone numbers with specific Arabic errors", () => {
    expect(validateSenderPhone("")).toContain("يرجى إدخال رقم الموبايل");
    expect(validateSenderPhone("12345")).toContain("11 رقماً");
    expect(validateSenderPhone("02012345678")).toContain("010 أو 011 أو 012 أو 015");
    expect(validateSenderPhone("01025131212")).toBeNull();
    expect(validateSenderPhone("٠١٠٢٥١٣١٢١٢")).toBeNull();
    expect(validateSenderPhone("01512345678")).toBeNull();
  });
});

