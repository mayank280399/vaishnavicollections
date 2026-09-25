"use client";

import {
  CalendarDays,
  Check,
  ChevronDown,
} from "lucide-react";
import {
  useEffect,
  useRef,
  useState,
} from "react";
import {
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";

type RangeType =
  | "today"
  | "week"
  | "month"
  | "year"
  | "all"
  | "custom";

const RANGE_OPTIONS: {
  value: RangeType;
  label: string;
}[] = [
  { value: "today", label: "Today" },
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" },
  { value: "year", label: "This Year" },
  { value: "all", label: "All Time" },
  { value: "custom", label: "Custom Range" },
];

export function DashboardFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentRange =
    (searchParams.get("range") as RangeType) || "month";

  const [isOpen, setIsOpen] = useState(false);

  const [customStart, setCustomStart] = useState(
    searchParams.get("start") || ""
  );

  const [customEnd, setCustomEnd] = useState(
    searchParams.get("end") || ""
  );

  const [showCustom, setShowCustom] = useState(
    currentRange === "custom"
  );

  const currentLabel =
    RANGE_OPTIONS.find(
      (option) => option.value === currentRange
    )?.label || "This Month";

  /**
   * Close dropdown when clicking outside
   */
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  /**
   * Close dropdown with Escape
   */
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, []);

  /**
   * Update URL for preset filters
   */
  function handleRangeChange(range: RangeType) {
    if (range === "custom") {
      setShowCustom(true);
      return;
    }

    const params = new URLSearchParams(
      searchParams.toString()
    );

    params.set("range", range);

    params.delete("start");
    params.delete("end");

    router.push(`${pathname}?${params.toString()}`);

    setShowCustom(false);
    setIsOpen(false);
  }

  /**
   * Apply custom date range
   */
  function handleCustomApply() {
    if (!customStart || !customEnd) {
      return;
    }

    if (customStart > customEnd) {
      return;
    }

    const params = new URLSearchParams(
      searchParams.toString()
    );

    params.set("range", "custom");
    params.set("start", customStart);
    params.set("end", customEnd);

    router.push(`${pathname}?${params.toString()}`);

    setIsOpen(false);
  }

  return (
    <div
      ref={dropdownRef}
      className="relative w-full sm:w-auto"
    >
      {/* Filter Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="
          flex h-11 w-full items-center justify-between
          gap-3 rounded-xl border border-slate-200
          bg-white px-3.5 text-sm font-medium
          text-slate-700 shadow-sm
          transition-all
          hover:border-slate-300
          hover:bg-slate-50
          focus:outline-none
          focus:ring-2
          focus:ring-[#171B4D]/10
          sm:w-auto sm:min-w-[175px]
        "
        aria-expanded={isOpen}
        aria-haspopup="menu"
      >
        <span className="flex min-w-0 items-center gap-2.5">
          <CalendarDays
            className="h-4 w-4 shrink-0 text-[#171B4D]"
            strokeWidth={2}
          />

          <span className="truncate">
            {currentLabel}
          </span>
        </span>

        <ChevronDown
          className={`
            h-4 w-4 shrink-0 text-slate-400
            transition-transform duration-200
            ${isOpen ? "rotate-180" : ""}
          `}
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          className="
            absolute right-0 z-50 mt-2
            w-full min-w-[220px]
            overflow-hidden rounded-xl
            border border-slate-200
            bg-white
            p-1.5
            shadow-xl shadow-slate-900/10
            sm:w-[230px]
          "
        >
          {!showCustom ? (
            <>
              {/* Dropdown Header */}
              <div className="px-3 pb-2 pt-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Date Range
                </p>
              </div>

              {/* Range Options */}
              <div className="space-y-0.5">
                {RANGE_OPTIONS.map((option) => {
                  const isSelected =
                    currentRange === option.value;

                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() =>
                        handleRangeChange(option.value)
                      }
                      className={`
                        flex w-full items-center
                        justify-between rounded-lg
                        px-3 py-2.5
                        text-sm
                        transition-colors
                        ${
                          isSelected
                            ? "bg-slate-50 font-medium text-[#171B4D]"
                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                        }
                      `}
                    >
                      <span>{option.label}</span>

                      {isSelected && (
                        <Check
                          className="h-4 w-4 text-[#C9952E]"
                          strokeWidth={2.5}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </>
          ) : (
            <>
              {/* Custom Range Header */}
              <div className="flex items-center justify-between px-3 pb-2 pt-2">
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    Custom Date Range
                  </p>

                  <p className="mt-0.5 text-xs text-slate-400">
                    Select start and end dates
                  </p>
                </div>
              </div>

              <div className="space-y-3 px-2 pb-2 pt-1">
                {/* From */}
                <div>
                  <label
                    htmlFor="dashboard-start-date"
                    className="mb-1.5 block text-xs font-medium text-slate-600"
                  >
                    From
                  </label>

                  <input
                    id="dashboard-start-date"
                    type="date"
                    value={customStart}
                    onChange={(event) =>
                      setCustomStart(event.target.value)
                    }
                    className="
                      h-10 w-full rounded-lg
                      border border-slate-200
                      bg-white px-3
                      text-sm text-slate-700
                      outline-none
                      transition
                      focus:border-[#171B4D]
                      focus:ring-2
                      focus:ring-[#171B4D]/10
                    "
                  />
                </div>

                {/* To */}
                <div>
                  <label
                    htmlFor="dashboard-end-date"
                    className="mb-1.5 block text-xs font-medium text-slate-600"
                  >
                    To
                  </label>

                  <input
                    id="dashboard-end-date"
                    type="date"
                    value={customEnd}
                    onChange={(event) =>
                      setCustomEnd(event.target.value)
                    }
                    className="
                      h-10 w-full rounded-lg
                      border border-slate-200
                      bg-white px-3
                      text-sm text-slate-700
                      outline-none
                      transition
                      focus:border-[#171B4D]
                      focus:ring-2
                      focus:ring-[#171B4D]/10
                    "
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowCustom(false)}
                    className="
                      h-9 flex-1 rounded-lg
                      border border-slate-200
                      bg-white px-3
                      text-sm font-medium
                      text-slate-600
                      transition
                      hover:bg-slate-50
                    "
                  >
                    Back
                  </button>

                  <button
                    type="button"
                    onClick={handleCustomApply}
                    disabled={
                      !customStart ||
                      !customEnd ||
                      customStart > customEnd
                    }
                    className="
                      h-9 flex-1 rounded-lg
                      bg-[#171B4D] px-3
                      text-sm font-medium
                      text-white
                      transition
                      hover:bg-[#11143a]
                      disabled:cursor-not-allowed
                      disabled:opacity-40
                    "
                  >
                    Apply
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}