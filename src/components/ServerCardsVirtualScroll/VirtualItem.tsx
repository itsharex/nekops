import ServerCard from "@/components/ServerCard";
import { Box } from "@mantine/core";
import type { MouseEvent } from "react";
import { forwardRef, memo } from "react";
import type { Server } from "@/types/server.ts";

interface VirtualItemProps {
  server: Server;
  onClick: (server: Server) => void;
  onContextMenu?: (ev: MouseEvent<HTMLDivElement>, server: Server) => void;
}

const VirtualItem = forwardRef<HTMLDivElement, VirtualItemProps>(
  ({ server, onClick, onContextMenu }, ref) => (
    <Box ref={ref} mx="md" mb="md">
      <ServerCard
        server={server}
        onClick={() => onClick(server)}
        onContextMenu={
          onContextMenu ? (ev) => onContextMenu(ev, server) : undefined
        }
      />
    </Box>
  ),
);

export default memo(VirtualItem);
