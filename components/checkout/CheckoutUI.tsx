"use client";

import React from "react";
import {
  Check,
  ShieldCheck,
} from "lucide-react";

/* -------------------------------------------------------------------------- */
/* Section Icon                                                               */
/* -------------------------------------------------------------------------- */

export function SectionIcon({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0f1f3d] text-[#d4af37]">
      {children}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Recipient Option                                                           */
/* -------------------------------------------------------------------------- */

type RecipientOptionProps = {
  selected: boolean;
  title: string;
  description: string;
  onClick: () => void;
};

export function RecipientOption({
  selected,
  title,
  description,
  onClick,
}: RecipientOptionProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "w-full rounded-2xl border p-4 text-left transition",
        selected
          ? "border-[#b89445] bg-[#fffaf0] ring-2 ring-[#b89445]/10"
          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50",
      ].join(" ")}
    >
      <div className="flex items-start gap-3">
        <div
          className={[
            "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border",
            selected
              ? "border-[#b89445] bg-[#b89445] text-white"
              : "border-slate-300 bg-white",
          ].join(" ")}
        >
          {selected && <Check className="h-3 w-3" />}
        </div>

        <div>
          <p className="text-sm font-semibold text-slate-900">
            {title}
          </p>

          <p className="mt-1 text-xs leading-5 text-slate-500">
            {description}
          </p>
        </div>
      </div>
    </button>
  );
}

/* -------------------------------------------------------------------------- */
/* Progress Step                                                              */
/* -------------------------------------------------------------------------- */

type ProgressStepProps = {
  step: number;
  label: string;
  active: boolean;
  completed: boolean;
};

export function ProgressStep({
  step,
  label,
  active,
  completed,
}: ProgressStepProps) {
  return (
    <div className="flex min-w-0 flex-1 items-center">
      <div className="flex min-w-0 items-center gap-2">
        <div
          className={[
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold transition",
            completed
              ? "bg-[#d4af37] text-white"
              : active
                ? "bg-[#0f1f3d] text-white"
                : "bg-slate-100 text-slate-400",
          ].join(" ")}
        >
          {completed ? (
            <Check className="h-4 w-4" />
          ) : (
            step
          )}
        </div>

        <span
          className={[
            "hidden text-xs font-semibold sm:block",
            active || completed
              ? "text-white"
              : "text-slate-400",
          ].join(" ")}
        >
          {label}
        </span>
      </div>

      {step < 3 && (
        <div
          className={[
            "mx-2 h-px flex-1",
            completed
              ? "bg-[#d4af37]"
              : "bg-slate-200",
          ].join(" ")}
        />
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Trust Item                                                                 */
/* -------------------------------------------------------------------------- */

type TrustItemProps = {
  icon?: React.ReactNode;
  title: string;
  description?: string;
};

export function TrustItem({
  icon,
  title,
  description,
}: TrustItemProps) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#fffaf0] text-[#b89445]">
        {icon ?? <ShieldCheck className="h-4 w-4" />}
      </div>

      <div>
        <p className="text-xs font-semibold text-slate-800">
          {title}
        </p>

          {description ? (
            <p className="mt-0.5 text-xs leading-5 text-slate-500">
              {description}
            </p>
          ) : null}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Field                                                                      */
/* -------------------------------------------------------------------------- */

type FieldProps = {
  label: string;
  value: string;
  placeholder?: string;
  required?: boolean;
  type?: React.HTMLInputTypeAttribute;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  maxLength?: number;
  onChange: (value: string) => void;
};

export function Field({
  label,
  value,
  placeholder,
  required = false,
  type = "text",
  inputMode,
  maxLength,
  onChange,
}: FieldProps) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold text-slate-700">
        {label}

        {required && (
          <span className="ml-1 text-[#b89445]">
            *
          </span>
        )}
      </span>

      <input
        type={type}
        value={value}
        placeholder={placeholder}
        inputMode={inputMode}
        maxLength={maxLength}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#b89445] focus:bg-white focus:ring-2 focus:ring-[#b89445]/10"
      />
    </label>
  );
}

/* -------------------------------------------------------------------------- */
/* Textarea Field                                                             */
/* -------------------------------------------------------------------------- */

type TextareaFieldProps = {
  label: string;
  value: string;
  placeholder?: string;
  required?: boolean;
  rows?: number;
  onChange: (value: string) => void;
};

export function TextareaField({
  label,
  value,
  placeholder,
  required = false,
  rows = 4,
  onChange,
}: TextareaFieldProps) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold text-slate-700">
        {label}

        {required && (
          <span className="ml-1 text-[#b89445]">
            *
          </span>
        )}
      </span>

      <textarea
        value={value}
        placeholder={placeholder}
        rows={rows}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#b89445] focus:bg-white focus:ring-2 focus:ring-[#b89445]/10"
      />
    </label>
  );
}

/* -------------------------------------------------------------------------- */
/* Step Error                                                                 */
/* -------------------------------------------------------------------------- */

export function StepError({
  message,
}: {
  message?: string | null;
}) {
  if (!message) {
    return null;
  }

  return (
    <div
      role="alert"
      className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600"
    >
      {message}
    </div>
  );
}
