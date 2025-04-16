import type { ShellSingleServer } from "@/events/payload.ts";
import type { TabState } from "@/types/tabState.ts";
import type { MouseEvent } from "react";
import { useEffect } from "react";
import {
  ActionIcon,
  rem,
  Tabs,
  useComputedColorScheme,
  useMantineTheme,
} from "@mantine/core";
import TabStateIcon from "@/components/TabStateIcon.tsx";
import { IconX } from "@tabler/icons-react";
import Twemoji from "@/components/Twemoji";
import { useHover } from "@mantine/hooks";

interface ShellTabProps {
  data: ShellSingleServer;
  state?: TabState;
  isNewMessage?: boolean;
  close: () => void;
  onContextMenu: (ev: MouseEvent<HTMLButtonElement>) => void;
  isActive: boolean;
}
const ShellTab = ({
  data,
  state,
  isNewMessage,
  close,
  onContextMenu,
  isActive,
}: ShellTabProps) => {
  const { hovered, ref: tabElementRef } = useHover();
  useEffect(() => {
    if (isActive) {
      tabElementRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [isActive]);

  const theme = useMantineTheme();
  const colorScheme = useComputedColorScheme();

  return (
    <Tabs.Tab
      ref={tabElementRef}
      value={data.nonce}
      color={data.color}
      style={{
        borderBottomWidth: rem(4),
        borderBottomColor: isActive ? data.color : "transparent",
        borderBottomStyle: "solid",
        backgroundColor: hovered
          ? colorScheme === "light"
            ? theme.colors.gray[0]
            : theme.colors.dark[6]
          : colorScheme === "light"
            ? theme.white
            : theme.colors.dark[7],
      }}
      leftSection={<TabStateIcon state={state} isNewMessage={isNewMessage} />}
      rightSection={
        <ActionIcon
          size="xs"
          variant="subtle"
          color={data.color}
          onClick={(e) => {
            e.stopPropagation();
            close();
          }}
        >
          <IconX />
        </ActionIcon>
      }
      component="div"
      // style={{
      //   backgroundColor: "var(--mantine-color-body)", // Conflict with the hover highlight
      // }}
      onContextMenu={onContextMenu}
    >
      <Twemoji content={data.name} />
    </Tabs.Tab>
  );
};

export default ShellTab;
