import { Card, rem } from "@mantine/core";
import { useHover } from "@mantine/hooks";

import type { ServerCardProps } from "@/components/ServerCard/props.ts";

import Inner from "./inner.tsx";
import { memo } from "react";

const Wrapper = ({ server, onClick, onContextMenu }: ServerCardProps) => {
  const { hovered, ref } = useHover();
  return (
    <Card
      shadow={Boolean(onClick) && hovered ? "lg" : "sm"}
      radius="md"
      withBorder
      style={{
        cursor: Boolean(onClick) ? "pointer" : undefined,
        transition: "all .2s",
        minHeight: rem(12 * 16),
        borderColor:
          Boolean(onClick) && hovered
            ? "var(--mantine-color-blue-outline)"
            : undefined,
      }}
      onClick={onClick}
      onContextMenu={
        onContextMenu
          ? (ev) => {
              ev.preventDefault(); // Prevent default context menu
              onContextMenu(ev);
            }
          : undefined
      }
      ref={ref}
    >
      <Inner server={server} />
    </Card>
  );
};

export default memo(Wrapper);
