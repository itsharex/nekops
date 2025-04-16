import { Button, Flex } from "@mantine/core";
import {
  IconColumnInsertRight,
  IconLayoutGridRemove,
  IconRowInsertBottom,
} from "@tabler/icons-react";
import { emit } from "@tauri-apps/api/event";
import type { EventPayloadShellGridModify } from "@/events/payload.ts";
import { EventNameShellGridModify } from "@/events/name.ts";

interface LayoutControlButtonsProps {
  isAddRowDisabled: boolean;
  isAddColDisabled: boolean;
  isTidyDisabled: boolean;
}
const LayoutControlButtons = ({
  isAddRowDisabled,
  isAddColDisabled,
  isTidyDisabled,
}: LayoutControlButtonsProps) => (
  <Flex direction="row" w="100%" gap="md" justify="center" align="center">
    <Button
      color="green"
      leftSection={<IconRowInsertBottom size={16} />}
      onClick={() =>
        emit<EventPayloadShellGridModify>(EventNameShellGridModify, {
          action: "add",
          grid: {
            row: 1,
            col: 0,
          },
        })
      }
      disabled={isAddRowDisabled}
    >
      Add Row
    </Button>
    <Button
      color="green"
      leftSection={<IconColumnInsertRight size={16} />}
      onClick={() =>
        emit<EventPayloadShellGridModify>(EventNameShellGridModify, {
          action: "add",
          grid: {
            row: 0,
            col: 1,
          },
        })
      }
      disabled={isAddColDisabled}
    >
      Add Col
    </Button>
    <Button
      color="red"
      leftSection={<IconLayoutGridRemove size={16} />}
      onClick={() =>
        emit<EventPayloadShellGridModify>(EventNameShellGridModify, {
          action: "tidy",
        })
      }
      disabled={isTidyDisabled}
    >
      Tidy
    </Button>
  </Flex>
);

export default LayoutControlButtons;
