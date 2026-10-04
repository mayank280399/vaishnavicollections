export function formatCurrency(value: number) {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2,
    }).format(Number(value) || 0);
}

export function formatDate(value: string) {
    return new Intl.DateTimeFormat("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(new Date(value));
}

export function formatOptionalDate(value: string | null) {
    if (!value) {
        return "Not set";
    }

    return formatDate(value);
}

export function getStatusClass(status: string) {
    switch (status) {
        case "CONFIRMED":
            return "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300";

        case "PROCESSING":
            return "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300";

        case "SHIPPED":
            return "bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300";

        case "OUT_FOR_DELIVERY":
            return "bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300";

        case "DELIVERED":
            return "bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-300";

        case "CANCELLED":
            return "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300";

        default:
            return "bg-muted text-muted-foreground";
    }
}

export function getPaymentStatusClass(status: string) {
    switch (status) {
        case "PAID":
            return "bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-300";

        case "FAILED":
            return "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300";

        case "REFUNDED":
            return "bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300";

        default:
            return "bg-muted text-muted-foreground";
    }
}