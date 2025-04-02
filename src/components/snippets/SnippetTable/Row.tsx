import type { Snippet } from "@/types/snippet.ts";
import { Draggable } from "@hello-pangea/dnd";
import { ActionIcon, Flex, Group, rem, Table, Tooltip } from "@mantine/core";
import {
  IconClipboardCheck,
  IconClipboardCopy,
  IconGripVertical,
  IconPencil,
} from "@tabler/icons-react";
import { actionIconStyle, actionRowStyle } from "@/common/actionStyles.ts";
import CopyButton from "@/components/CopyButton.tsx";
import DeleteItemButton from "@/components/DeleteItemButton.tsx";

interface SnippetTableRowProps {
  index: number;
  snippet: Snippet;
  edit: () => void;
  del: () => void;
}
const SnippetTableRow = ({
  index,
  snippet,
  edit,
  del,
}: SnippetTableRowProps) => (
  <Draggable draggableId={snippet.name} index={index}>
    {(provided, snapshot) => (
      <Table.Tr ref={provided.innerRef} {...provided.draggableProps}>
        <Table.Td>
          <Flex
            style={{
              cursor: "grab",
            }}
            {...provided.dragHandleProps}
          >
            <IconGripVertical
              style={{ width: rem(18), height: rem(18) }}
              stroke={1.5}
            />
          </Flex>
        </Table.Td>
        <Table.Td>{snippet.name}</Table.Td>
        <Table.Td hidden={snapshot.isDragging}>
          {snippet.tags.join(", ")}
        </Table.Td>
        <Table.Td style={actionRowStyle()} hidden={snapshot.isDragging}>
          <Group gap="xs">
            {/*Copy*/}
            <CopyButton value={snippet.code}>
              {({ copied, copy }) => (
                <Tooltip label={copied ? "Copied!" : "Copy"} openDelay={500}>
                  <ActionIcon color={copied ? "cyan" : "green"} onClick={copy}>
                    {copied ? (
                      <IconClipboardCheck style={actionIconStyle} />
                    ) : (
                      <IconClipboardCopy style={actionIconStyle} />
                    )}
                  </ActionIcon>
                </Tooltip>
              )}
            </CopyButton>

            {/*Edit*/}
            <Tooltip label={"Edit"} openDelay={500}>
              <ActionIcon onClick={edit}>
                <IconPencil style={actionIconStyle} />
              </ActionIcon>
            </Tooltip>

            {/*Delete*/}
            <DeleteItemButton
              itemName={`Snippet ${snippet.name}`}
              iconStyle={actionIconStyle}
              onClick={del}
            />
          </Group>
        </Table.Td>
      </Table.Tr>
    )}
  </Draggable>
);

export default SnippetTableRow;
