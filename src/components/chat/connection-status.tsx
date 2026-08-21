import { Wifi, WifiOff } from "lucide-react";
import type { ConnectionState } from "@/hooks/use-chat";

const LABELS: Record<ConnectionState, string> = {
  demo: "Preview mode",
  connecting: "Connecting",
  live: "Live",
  offline: "Offline",
};

export function ConnectionStatus({ status }: { status: ConnectionState }) {
  return (
    <span className="hidden items-center gap-1.5 text-xs text-muted-foreground sm:flex">
      {status === "live" ? (
        <Wifi className="size-3.5 text-primary" />
      ) : status === "offline" ? (
        <WifiOff className="size-3.5" />
      ) : (
        <span className="size-2 rounded-full bg-primary" />
      )}
      {LABELS[status]}
    </span>
  );
}
