import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

const source = await readFile(
  new URL("../lib/checkout/upi-payment-confirmation.ts", import.meta.url),
  "utf8",
);
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ES2022, target: ts.ScriptTarget.ES2022 },
}).outputText;
const { getUpiPaymentConfirmation } = await import(
  `data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`
);

const baseOrder = {
  orderNumber: "VC-1001",
  customerName: "Asha",
  totalAmount: 999,
  amountPaid: 0,
  amountDue: 999,
};

test("full payment confirmation reports the persisted full plan and total due", () => {
  const details = getUpiPaymentConfirmation({ ...baseOrder, paymentPlan: "FULL" });

  assert.equal(details.isPartialPayment, false);
  assert.equal(details.paymentAmount, 999);
  assert.equal(details.remainingBalance, 0);
  assert.match(details.message, /Order total: ₹999/);
  assert.match(details.message, /Payment option: Full UPI Payment/);
  assert.match(details.message, /Amount to pay now: ₹999/);
  assert.doesNotMatch(details.message, /Remaining balance/);
});

test("partial payment confirmation includes the configured advance and remaining balance", () => {
  const details = getUpiPaymentConfirmation({ ...baseOrder, paymentPlan: "PARTIAL" });

  assert.equal(details.isPartialPayment, true);
  assert.equal(details.paymentAmount, 149);
  assert.equal(details.remainingBalance, 850);
  assert.match(details.message, /Payment option: Partial UPI Advance/);
  assert.match(details.message, /Amount to pay now: ₹149/);
  assert.match(details.message, /Remaining balance after this payment: ₹850/);
});

test("persisted payment plan takes precedence over editable query parameters", () => {
  const details = getUpiPaymentConfirmation({
    ...baseOrder,
    paymentPlan: "FULL",
    fallbackOption: "upi_partial",
  });

  assert.equal(details.isPartialPayment, false);
});

test("a previously paid partial advance directs the customer to the remaining due", () => {
  const details = getUpiPaymentConfirmation({
    ...baseOrder,
    paymentPlan: "PARTIAL",
    amountPaid: 149,
    amountDue: 850,
  });

  assert.equal(details.isPartialAdvance, false);
  assert.equal(details.paymentAmount, 850);
  assert.match(details.message, /Partial UPI Balance Payment/);
  assert.match(details.message, /Amount to pay now: ₹850/);
});
