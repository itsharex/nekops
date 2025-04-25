import { Card } from "@mantine/core";

import type { ServerCardProps } from "@/components/ServerCard/props.ts";

import Inner from "./Inner.tsx";
import { memo } from "react";

import classes from "./styles.module.css";

const Wrapper = ({ server, onClick, onContextMenu }: ServerCardProps) => (
  <Card
    radius="md"
    withBorder
    className={`${classes.wrapper} ${Boolean(onClick) ? classes.clickable : ""}`}
    onClick={onClick}
    onContextMenu={
      onContextMenu
        ? (ev) => {
            ev.preventDefault(); // Prevent default context menu
            onContextMenu(ev);
          }
        : undefined
    }
  >
    <Inner server={server} />
  </Card>
);

export default memo(Wrapper);
