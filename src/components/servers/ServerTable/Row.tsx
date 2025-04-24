import { Draggable } from "@hello-pangea/dnd";
import { ActionIcon, Flex, Group, rem, Table, Tooltip } from "@mantine/core";
import { IconGripVertical, IconId, IconPencil } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";

import type { Server } from "@/types/server.ts";
import { actionIconStyle, actionRowStyle } from "@/common/actionStyles.ts";
import DeleteItemButton from "@/components/DeleteItemButton.tsx";

interface ServerTableRowProps {
  index: number;
  server: Server;
  show: () => void;
  edit: () => void;
  del: () => void;
}
const ServerTableRow = ({
  index,
  server,
  show,
  edit,
  del,
}: ServerTableRowProps) => {
  const { t } = useTranslation("main", { keyPrefix: "library" });

  return (
    <Draggable draggableId={server.id} index={index}>
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
          <Table.Td>{server.name}</Table.Td>
          <Table.Td hidden={snapshot.isDragging}>{server.id}</Table.Td>
          <Table.Td hidden={snapshot.isDragging}>
            {server.tags.join(", ")}
          </Table.Td>
          <Table.Td style={actionRowStyle()} hidden={snapshot.isDragging}>
            <Group gap="xs">
              {/*Show Card*/}
              <Tooltip label={t("action_show")} openDelay={500}>
                <ActionIcon color={server.color} onClick={show}>
                  <IconId style={actionIconStyle} />
                </ActionIcon>
              </Tooltip>

              {/*Edit*/}
              <Tooltip label={t("action_edit")} openDelay={500}>
                <ActionIcon onClick={edit}>
                  <IconPencil style={actionIconStyle} />
                </ActionIcon>
              </Tooltip>

              {/*Delete*/}
              <DeleteItemButton
                itemName={`${t("server")} ${server.name}`}
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

export default ServerTableRow;
