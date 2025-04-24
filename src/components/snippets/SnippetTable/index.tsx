import { Table } from "@mantine/core";
import { DragDropContext, Droppable } from "@hello-pangea/dnd";
import { useTranslation } from "react-i18next";

import type { Snippet } from "@/types/snippet.ts";

import SnippetTableHead from "./Head.tsx";
import SnippetTableRow from "./Row.tsx";

interface SnippetTableProps {
  snippets: Snippet[];
  edit: (snippet: Snippet) => void;
  del: (snippet: Snippet) => void;
  reorder: (sourceSnippetName: string, destinationSnippetName: string) => void;
  isSearching: boolean;
}
const SnippetTable = ({
  snippets,
  edit,
  del,
  reorder,
  isSearching,
}: SnippetTableProps) => {
  const { t } = useTranslation("main", { keyPrefix: "library" });

  return (
    <DragDropContext
      onDragEnd={({ destination, source }) => {
        reorder(
          snippets[source.index].name,
          snippets[destination?.index || 0].name,
        );
      }}
    >
      <Table stickyHeader stickyHeaderOffset={0} highlightOnHover>
        <Table.Thead
          style={{
            zIndex: 1,
          }}
        >
          <SnippetTableHead />
        </Table.Thead>
        <Droppable droppableId="snippets-list" direction="vertical">
          {(provided) => (
            <Table.Tbody ref={provided.innerRef} {...provided.droppableProps}>
              {snippets.map((snippet, index) => (
                <SnippetTableRow
                  key={snippet.name}
                  index={index}
                  snippet={snippet}
                  edit={() => edit(snippet)}
                  del={() => del(snippet)}
                />
              ))}
              {provided.placeholder}
            </Table.Tbody>
          )}
        </Droppable>
        <Table.Caption>
          {snippets.length > 0
            ? t("snippetTableCount", {
                count: snippets.length,
              })
            : isSearching
              ? t("snippetTableEmptySearch")
              : t("snippetTableEmpty")}
        </Table.Caption>
      </Table>
    </DragDropContext>
  );
};

export default SnippetTable;
