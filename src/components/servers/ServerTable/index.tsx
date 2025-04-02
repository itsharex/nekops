import { Table } from "@mantine/core";

import type { Server } from "@/types/server.ts";
import { DragDropContext, Droppable } from "@hello-pangea/dnd";
import { memo } from "react";

import ServerTableHead from "./Head.tsx";
import ServerTableRow from "./Row.tsx";

interface ServerTableProps {
  servers: Server[];
  show: (server: Server) => void;
  edit: (server: Server) => void;
  del: (server: Server) => void;
  reorder: (sourceServerID: string, destinationServerID: string) => void;
  isSearching: boolean;
}
const ServerTable = ({
  servers,
  show,
  edit,
  del,
  reorder,
  isSearching,
}: ServerTableProps) => (
  <DragDropContext
    onDragEnd={({ destination, source }) => {
      reorder(servers[source.index].id, servers[destination?.index || 0].id);
    }}
  >
    <Table stickyHeader stickyHeaderOffset={0} highlightOnHover>
      <Table.Thead
        style={{
          zIndex: 1,
        }}
      >
        <ServerTableHead />
      </Table.Thead>
      <Droppable droppableId="servers-list" direction="vertical">
        {(provided) => (
          <Table.Tbody ref={provided.innerRef} {...provided.droppableProps}>
            {servers.map((server, index) => (
              <ServerTableRow
                key={server.id}
                index={index}
                server={server}
                show={() => show(server)}
                edit={() => edit(server)}
                del={() => del(server)}
              />
            ))}
            {provided.placeholder}
          </Table.Tbody>
        )}
      </Droppable>
      <Table.Caption>
        {servers.length > 0
          ? `Total ${servers.length} servers.`
          : isSearching
            ? "No matching results."
            : "Let's add first server!"}
      </Table.Caption>
    </Table>
  </DragDropContext>
);

export default memo(ServerTable);
