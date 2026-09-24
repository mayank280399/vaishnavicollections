import type { LucideIcon } from "lucide-react";

type Props = {
  title: string;
  value: string;
  description?: string;
  icon: LucideIcon;
};

export function LoyaltyStatCard({
  title,
  value,
  description,
  icon: Icon,
}: Props) {
  return (
    <div className="rounded-2xl border bg-card p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </div>

        <div className="min-w-0">
          <p className="text-xs font-medium text-muted-foreground">
            {title}
          </p>

          <p className="mt-1 text-xl font-bold tracking-tight">
            {value}
          </p>

          {description && (
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              {description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}