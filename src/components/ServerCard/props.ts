import type { Server } from "@/types/server.ts";
import { MouseEvent } from "react";

export interface ServerCardInnerProps {
  server: Server;
}

export interface ServerCardProps extends ServerCardInnerProps {
  onClick?: () => void;
  onContextMenu?: (ev: MouseEvent<HTMLDivElement>) => void;
}
