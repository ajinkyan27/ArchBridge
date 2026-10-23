import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost";
type Size = "md" | "lg";

const base =
  "group inline-flex items-center justify-center gap-2 rounded-md font-medium whitespace-nowrap transition-[background-color,border-color,color,box-shadow] duration-200 ease-out-quart disabled:cursor-not-allowed disabled:opacity-60";

const variants: Record<Variant, string> = {
  primary:
    "bg-accent-600 text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.18)] hover:bg-accent-500 active:bg-accent-700",
  secondary: "border border-line-strong bg-ink-900/60 text-fg hover:border-accent-500/70 hover:bg-ink-800",
  ghost: "text-fg-muted hover:text-fg",
};

const sizes: Record<Size, string> = {
  md: "min-h-11 px-4 text-sm",
  lg: "min-h-12 px-5 text-[0.95rem]",
};

export function buttonClasses({
  variant = "primary",
  size = "md",
  className,
}: { variant?: Variant; size?: Size; className?: string } = {}) {
  return cn(base, variants[variant], sizes[size], className);
}

type ButtonLinkProps = Omit<ComponentProps<typeof Link>, "className"> & {
  variant?: Variant;
  size?: Size;
  className?: string;
  arrow?: boolean;
  children: ReactNode;
};

export function ButtonLink({ variant, size, className, arrow, children, ...props }: ButtonLinkProps) {
  return (
    <Link className={buttonClasses({ variant, size, className })} {...props}>
      {children}
      {arrow && (
        <ArrowRight
          aria-hidden
          className="size-4 transition-transform duration-200 ease-out-quart group-hover:translate-x-0.5"
        />
      )}
    </Link>
  );
}

type ButtonProps = ComponentProps<"button"> & { variant?: Variant; size?: Size };

export function Button({ variant, size, className, type = "button", ...props }: ButtonProps) {
  return <button type={type} className={buttonClasses({ variant, size, className })} {...props} />;
}

/** Inline text link with an arrow, for "Read more" style actions. */
export function ArrowLink({ className, children, ...props }: Omit<ComponentProps<typeof Link>, "children"> & { children: ReactNode }) {
  return (
    <Link
      className={cn(
        "group inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-accent-400 transition-colors hover:text-accent-300",
        className,
      )}
      {...props}
    >
      {children}
      <ArrowRight aria-hidden className="size-4 transition-transform duration-200 ease-out-quart group-hover:translate-x-0.5" />
    </Link>
  );
}
