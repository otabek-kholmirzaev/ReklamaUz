import { cn } from "@/lib/utils";

const styles: Record<string, string> = {
  Pending: "bg-warning/15 text-warning-foreground border-warning/30",
  Confirmed: "bg-primary/10 text-accent-foreground border-primary/25",
  "Content Review": "bg-muted text-muted-foreground border-border",
  Scheduled: "bg-chart-2/15 text-accent-foreground border-chart-2/30",
  Published: "bg-success/15 text-success border-success/30",
  Completed: "bg-success/15 text-success border-success/30",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        styles[status] ?? "bg-muted text-muted-foreground border-border",
      )}
    >
      {status}
    </span>
  );
}
