"use client";

import { useState } from "react";
import { ChevronDown, SlidersHorizontal, X } from "lucide-react";

export function FilterDisclosure({
  children,
  active = false,
  onReset,
  onApply,
  onCancel,
  onOpen,
}: {
  children: React.ReactNode;
  active?: boolean;
  onReset?: () => void;
  onApply?: () => void;
  onCancel?: () => void;
  onOpen?: () => void;
}) {
  const [open, setOpen] = useState(false);

  const openSheet = () => {
    onOpen?.();
    setOpen(true);
  };

  const closeSheet = (cancel: boolean) => {
    if (cancel) onCancel?.();
    setOpen(false);
  };

  const applyFilters = () => {
    onApply?.();
    setOpen(false);
  };

  return (
    <div className="admin-filter-disclosure">
      <div className="admin-filter-disclosure__mobile-header">
        <button
          type="button"
          className="admin-filter-disclosure__trigger"
          aria-expanded={open}
          onClick={() => (open ? closeSheet(true) : openSheet())}
        >
          <span className="admin-filter-disclosure__icon">
            <SlidersHorizontal className="size-4" />
          </span>
          <span className="min-w-0 flex-1 text-left">
            <span className="block text-sm font-semibold">Filters</span>
            <span className="block text-xs font-normal text-slate-500">
              {active ? "Filters are applied" : "Search and refine results"}
            </span>
          </span>
          {active && <span className="admin-filter-disclosure__badge">Active</span>}
          <ChevronDown className={`size-4 text-slate-500 transition-transform ${open ? "rotate-180" : ""}`} />
        </button>
      </div>
      {open && <button type="button" aria-label="Close filters" className="admin-filter-disclosure__backdrop" onClick={() => closeSheet(true)} />}
      <div className={`admin-filter-disclosure__body ${open ? "is-open" : ""}`}>
        <div className="admin-filter-disclosure__sheet-header">
          <div>
            <h2 className="text-base font-semibold">Filters</h2>
            <p className="mt-0.5 text-xs text-slate-500">Adjust results, then apply your changes.</p>
          </div>
          <button type="button" aria-label="Close filters" className="admin-filter-disclosure__close" onClick={() => closeSheet(true)}>
            <X className="size-4" />
          </button>
        </div>
        {children}
        <div className="admin-filter-disclosure__footer">
          <button type="button" className="admin-filter-disclosure__reset" onClick={onReset}>Reset</button>
          <button type="button" className="admin-filter-disclosure__cancel" onClick={() => closeSheet(true)}>Cancel</button>
          <button type="button" className="admin-filter-disclosure__apply" onClick={applyFilters}>Apply</button>
        </div>
      </div>
    </div>
  );
}
