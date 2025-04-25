import type { Snippet } from "@/types/snippet.ts";
import { Draggable } from "@hello-pangea/dnd";
import { ActionIcon, Flex, Group, rem, Table, Tooltip } from "@mantine/core";
import { IconGripVertical, IconPencil } from "@tabler/icons-react";
import { actionIconStyle, actionRowStyle } from "@/common/actionStyles.ts";
import CopyButton from "@/components/CopyButton.tsx";
import DeleteItemButton from "@/components/DeleteItemButton.tsx";
import { useTranslation } from "react-i18next";

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
}: SnippetTableRowProps) => {
  const { t } = useTranslation("main", { keyPrefix: "library" });

  return (
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
              <CopyButton value={snippet.code} small={true} />

              {/*Edit*/}
              <Tooltip label={t("action_edit")} openDelay={500}>
                <ActionIcon onClick={edit}>
                  <IconPencil style={actionIconStyle} />
                </ActionIcon>
              </Tooltip>

              {/*Delete*/}
              <DeleteItemButton
                itemName={`${t("snippet")} ${snippet.name}`}
                iconStyle={actionIconStyle}
                onClick={del}
              />
            </Group>
          </Table.Td>
        </Table.Tr>
      )}
    </Draggable>
  );
};

export default SnippetTableRow;
