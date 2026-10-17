type UpiPaymentDetailsInput = {
  orderNumber: string;
  customerName: string;
  paymentPlan: "FULL" | "PARTIAL" | null;
  totalAmount: number;
  amountPaid: number;
  amountDue: number;
  fallbackOption?: string;
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);
}

export function getUpiPaymentConfirmation({
  orderNumber,
  customerName,
  paymentPlan,
  totalAmount,
  amountPaid,
  amountDue,
  fallbackOption,
}: UpiPaymentDetailsInput) {
  const isPartialPayment =
    paymentPlan === "PARTIAL" ||
    (paymentPlan === null && fallbackOption === "upi_partial");
  const isPartialAdvance = isPartialPayment && Number(amountPaid) <= 0;

  // Keep the existing checkout advance until an advance amount is persisted.
  const configuredPartialAdvance = Math.min(149, Number(totalAmount) || 0);
  const paymentAmount =
    isPartialAdvance
      ? configuredPartialAdvance
      : Number(amountDue) > 0
        ? Number(amountDue)
        : Number(totalAmount);
  const remainingBalance = Math.max(Number(amountDue) - paymentAmount, 0);

  const message = [
    "Hello Vaishnavi Collections,",
    "",
    "I have completed a UPI payment and would like it verified.",
    "",
    `Order number: ${orderNumber}`,
    `Customer: ${customerName}`,
    `Order total: ${formatCurrency(totalAmount)}`,
    `Payment option: ${
      isPartialAdvance
        ? "Partial UPI Advance"
        : isPartialPayment
          ? "Partial UPI Balance Payment"
          : "Full UPI Payment"
    }`,
    `Amount to pay now: ${formatCurrency(paymentAmount)}`,
    ...(remainingBalance > 0
      ? [`Remaining balance after this payment: ${formatCurrency(remainingBalance)}`]
      : []),
    "Please verify the transaction and confirm my order.",
  ].join("\n");

  return {
    isPartialPayment,
    isPartialAdvance,
    paymentAmount,
    remainingBalance,
    message,
  };
}
