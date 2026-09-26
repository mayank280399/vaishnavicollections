import { Dashboard } from "@/components/admin/dashboard/dashboard";
import {
  getDashboardData,
  type DashboardRange,
} from "@/lib/dashboard/queries";

type AdminPageProps = {
  searchParams: Promise<{
    range?: string;
    start?: string;
    end?: string;
  }>;
};

function normalizeRange(
  range?: string,
): DashboardRange {
  switch (range) {
    case "today":
      return "today";

    case "this-week":
    case "week":
      return "week";

    case "this-month":
    case "month":
      return "month";

    case "this-year":
    case "year":
      return "year";

    case "custom":
      return "custom";

    case "all-time":
    case "all":
    default:
      return "all";
  }
}

export default async function AdminPage({
  searchParams,
}: AdminPageProps) {
  const params = await searchParams;

  const range = normalizeRange(
    params.range,
  );

  const data = await getDashboardData({
    range,
    start:
      range === "custom"
        ? params.start
        : undefined,
    end:
      range === "custom"
        ? params.end
        : undefined,
  });

  return <Dashboard data={data} />;
}