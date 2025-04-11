import { Table } from "@mantine/core";
import type { Snippet } from "@/types/snippet.ts";
import { memo } from "react";

import SnippetsTableHead from "./Head.tsx";
import SnippetsTableRow from "./Row.tsx";

interface SnippetsTableProps {
  snippets: Snippet[];
  show: (code: string) => void;
}
const SnippetsTable = ({ snippets, show }: SnippetsTableProps) => (
  <Table stickyHeader stickyHeaderOffset={-1} highlightOnHover withTableBorder>
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
          show={() => show(snippet.code)}
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

export default memo(SnippetsTable);
