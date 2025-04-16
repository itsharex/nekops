import type { Snippet } from "@/types/snippet.ts";
import { Table } from "@mantine/core";
import { memo } from "react";

interface SnippetsTableRowProps {
  snippet: Snippet;
  show: () => void;
}
const SnippetsTableRow = ({ snippet, show }: SnippetsTableRowProps) => (
  <Table.Tr
    onClick={show}
    style={{
      cursor: "pointer",
    }}
  >
    <Table.Td>{snippet.name}</Table.Td>
    <Table.Td>{snippet.tags.join(", ")}</Table.Td>
  </Table.Tr>
);

export default memo(SnippetsTableRow);
