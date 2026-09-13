import { cn } from "@/lib/utils";

interface BrandSpinnerProps {
  className?: string;
}

export function BrandSpinner({ className }: BrandSpinnerProps) {
  return (
    <div
      role="status"
      aria-label="Chargement"
      className={cn(
        "h-8 w-8 animate-spin rounded-full border-4 border-gold border-t-transparent",
        className
      )}
    />
  );
}