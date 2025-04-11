import { Table } from "@mantine/core";
import { memo } from "react";

const SnippetsTableHead = () => (
  <Table.Tr>
    <Table.Th>Snippet Name</Table.Th>
    <Table.Th>Tags</Table.Th>
  </Table.Tr>
);

export default memo(SnippetsTableHead);
