import { Dashboard } from "@/components/admin/dashboard/dashboard";
import { getDashboardData } from "@/lib/dashboard/queries";

type AdminPageProps = {
  searchParams: Promise<{
    range?: string;
    start?: string;
    end?: string;
  }>;
};

type FilterRange = {
  startDate: string;
  endDate: string;
  previousStartDate?: string;
  previousEndDate?: string;
};

function formatDate(
  date: Date
): string {
  return date.toISOString().slice(0, 10);
}

function getDateRange(
  range: string,
  customStart?: string,
  customEnd?: string
): FilterRange {
  const today = new Date();

  const todayString =
    formatDate(today);

  // Today
  if (range === "today") {
    return {
      startDate: todayString,
      endDate: todayString,
      previousStartDate:
        formatDate(
          new Date(
            today.getTime() -
              24 * 60 * 60 * 1000
          )
        ),
      previousEndDate:
        formatDate(
          new Date(
            today.getTime() -
              24 * 60 * 60 * 1000
          )
        ),
    };
  }

  // This Week
  if (range === "this-week") {
    const day =
      today.getDay();

    const daysSinceMonday =
      day === 0 ? 6 : day - 1;

    const start =
      new Date(today);

    start.setDate(
      today.getDate() -
        daysSinceMonday
    );

    const end =
      new Date(today);

    const previousEnd =
      new Date(start);

    previousEnd.setDate(
      start.getDate() - 1
    );

    const previousStart =
      new Date(previousEnd);

    previousStart.setDate(
      previousEnd.getDate() - 6
    );

    return {
      startDate:
        formatDate(start),
      endDate:
        formatDate(end),
      previousStartDate:
        formatDate(previousStart),
      previousEndDate:
        formatDate(previousEnd),
    };
  }

  // This Month
  if (range === "this-month") {
    const start =
      new Date(
        today.getFullYear(),
        today.getMonth(),
        1
      );

    const end =
      new Date(today);

    const previousEnd =
      new Date(
        today.getFullYear(),
        today.getMonth(),
        0
      );

    const previousStart =
      new Date(
        previousEnd.getFullYear(),
        previousEnd.getMonth(),
        1
      );

    return {
      startDate:
        formatDate(start),
      endDate:
        formatDate(end),
      previousStartDate:
        formatDate(previousStart),
      previousEndDate:
        formatDate(previousEnd),
    };
  }

  // This Year
  if (range === "this-year") {
    const start =
      new Date(
        today.getFullYear(),
        0,
        1
      );

    const end =
      new Date(today);

    const previousStart =
      new Date(
        today.getFullYear() - 1,
        0,
        1
      );

    const previousEnd =
      new Date(
        today.getFullYear() - 1,
        today.getMonth(),
        today.getDate()
      );

    return {
      startDate:
        formatDate(start),
      endDate:
        formatDate(end),
      previousStartDate:
        formatDate(previousStart),
      previousEndDate:
        formatDate(previousEnd),
    };
  }

  // Custom Range
  if (
    range === "custom" &&
    customStart &&
    customEnd
  ) {
    const start =
      new Date(customStart);

    const end =
      new Date(customEnd);

    const difference =
      end.getTime() -
      start.getTime();

    const previousEnd =
      new Date(
        start.getTime() -
          24 * 60 * 60 * 1000
      );

    const previousStart =
      new Date(
        previousEnd.getTime() -
          difference
      );

    return {
      startDate: customStart,
      endDate: customEnd,
      previousStartDate:
        formatDate(previousStart),
      previousEndDate:
        formatDate(previousEnd),
    };
  }

  // All Time
  return {
    startDate: "2000-01-01",
    endDate: todayString,
  };
}

export default async function AdminPage({
  searchParams,
}: AdminPageProps) {
  const params =
    await searchParams;

  const range =
    params.range ?? "all-time";

  const dateRange =
    getDateRange(
      range,
      params.start,
      params.end
    );

  const data =
    await getDashboardData(
      dateRange
    );

  return (
    <Dashboard data={data} />
  );
}
