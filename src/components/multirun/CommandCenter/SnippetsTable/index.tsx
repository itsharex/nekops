import { Table } from "@mantine/core";
import { memo } from "react";

import SnippetsTableHead from "./Head.tsx";
import SnippetsTableRow from "./Row.tsx";
import { useSelector } from "react-redux";
import type { RootState } from "@/store.ts";

interface SnippetsTableProps {
  setCommand: (code: string) => void;
}
const SnippetsTable = ({ setCommand }: SnippetsTableProps) => {
  const snippets = useSelector((state: RootState) => state.snippets);

  return (
    <Table
      stickyHeader
      stickyHeaderOffset={-1}
      highlightOnHover
      withTableBorder
    >
      <Table.Thead
        style={{
          zIndex: 1,
        }}
      >
        <SnippetsTableHead />
      </Table.Thead>
      <Table.Tbody>
        {snippets.map((snippet) => (
          <SnippetsTableRow
            key={snippet.name}
            snippet={snippet}
            show={() => setCommand(snippet.code)}
          />
        ))}
      </Table.Tbody>
      <Table.Caption>
        {snippets.length > 0
          ? `Total ${snippets.length} snippets.`
          : "Let's create a new snippet!"}
      </Table.Caption>
    </Table>
  );
};

export default memo(SnippetsTable);
