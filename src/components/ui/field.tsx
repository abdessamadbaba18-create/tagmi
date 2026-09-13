import * as React from "react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

export interface FieldProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: string;
  required?: boolean;
  error?: string;
  hint?: string;
  htmlFor?: string;
}

const Field = React.forwardRef<HTMLDivElement, FieldProps>(
  ({ label, required, error, hint, htmlFor, className, children, ...props }, ref) => (
    <div ref={ref} className={cn("space-y-1.5", className)} {...props}>
      {label && (
        <Label htmlFor={htmlFor}>
          {label}
          {required && <span className="ml-0.5 text-gold">*</span>}
        </Label>
      )}
      {children}
      {hint && !error && <p className="text-xs text-stone-400">{hint}</p>}
      {error && <p className="text-xs font-medium text-red-600">{error}</p>}
    </div>
  )
);
Field.displayName = "Field";

export { Field };