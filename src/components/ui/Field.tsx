import type { ComponentProps, ReactNode } from "react";
import { AlertCircle, CheckCircle2, Info } from "lucide-react";
import { cn } from "@/lib/cn";

const control =
  "block w-full rounded-md border bg-ink-950 px-3.5 py-3 text-base text-fg placeholder:text-fg-subtle transition-colors duration-150 hover:border-line-strong focus:border-accent-500 focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent-400 disabled:opacity-60";

type FieldShellProps = {
  id: string;
  label: string;
  required?: boolean;
  hint?: ReactNode;
  error?: string;
  children: ReactNode;
  className?: string;
};

/** Label + hint + error wrapper. Errors carry an icon and text, not just colour. */
export function FieldShell({ id, label, required, hint, error, children, className }: FieldShellProps) {
  return (
    <div className={className}>
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-sm font-medium text-fg">
          {label}
          {required && (
            <span aria-hidden className="ml-1 text-accent-400">
              *
            </span>
          )}
        </label>
        {!required && (
          <span aria-hidden className="text-xs text-fg-subtle">
            Optional
          </span>
        )}
      </div>
      {hint && (
        <p id={`${id}-hint`} className="mt-1 text-sm text-fg-subtle">
          {hint}
        </p>
      )}
      <div className="mt-2">{children}</div>
      {error && (
        <p id={`${id}-error`} className="mt-2 flex items-start gap-1.5 text-sm text-danger">
          <AlertCircle aria-hidden className="mt-0.5 size-4 shrink-0" />
          <span>
            <span className="sr-only">Error: </span>
            {error}
          </span>
        </p>
      )}
    </div>
  );
}

export function describedBy(id: string, { hint, error }: { hint?: unknown; error?: unknown }) {
  return [hint ? `${id}-hint` : null, error ? `${id}-error` : null].filter(Boolean).join(" ") || undefined;
}

export function Input({ className, invalid, ...props }: ComponentProps<"input"> & { invalid?: boolean }) {
  return <input className={cn(control, invalid ? "border-danger" : "border-line", className)} aria-invalid={invalid || undefined} {...props} />;
}

export function Textarea({ className, invalid, ...props }: ComponentProps<"textarea"> & { invalid?: boolean }) {
  return (
    <textarea className={cn(control, "min-h-40 resize-y", invalid ? "border-danger" : "border-line", className)} aria-invalid={invalid || undefined} {...props} />
  );
}

export function Select({ className, invalid, children, ...props }: ComponentProps<"select"> & { invalid?: boolean }) {
  return (
    <div className="relative">
      <select
        className={cn(control, "appearance-none pr-10", invalid ? "border-danger" : "border-line", className)}
        aria-invalid={invalid || undefined}
        {...props}
      >
        {children}
      </select>
      <svg aria-hidden viewBox="0 0 16 16" className="pointer-events-none absolute top-1/2 right-3.5 size-4 -translate-y-1/2 text-fg-subtle">
        <path d="M4 6l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

type Tone = "info" | "success" | "error" | "warning";

const toneStyles: Record<Tone, { box: string; icon: typeof Info }> = {
  info: { box: "border-accent-500/40 bg-accent-500/5", icon: Info },
  success: { box: "border-success/40 bg-success/5", icon: CheckCircle2 },
  error: { box: "border-danger/50 bg-danger/5", icon: AlertCircle },
  warning: { box: "border-warning/40 bg-warning/5", icon: AlertCircle },
};

const toneText: Record<Tone, string> = {
  info: "text-accent-400",
  success: "text-success",
  error: "text-danger",
  warning: "text-warning",
};

/** Feedback/status panel. Pass role="alert" or role="status" as appropriate. */
export function StatusMessage({
  tone,
  title,
  children,
  className,
  ...props
}: { tone: Tone; title: string; children?: ReactNode } & Omit<ComponentProps<"div">, "title">) {
  const { box, icon: Icon } = toneStyles[tone];
  return (
    <div className={cn("flex gap-3 rounded-md border p-4", box, className)} {...props}>
      <Icon aria-hidden className={cn("mt-0.5 size-5 shrink-0", toneText[tone])} />
      <div className="text-sm leading-relaxed text-fg-muted">
        <p className="font-semibold text-fg">{title}</p>
        {children && <div className="mt-1">{children}</div>}
      </div>
    </div>
  );
}
