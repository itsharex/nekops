import { rem, Table } from "@mantine/core";
import { actionRowStyle } from "@/common/actionStyles.ts";

const SnippetTableHead = () => (
  <Table.Tr>
    <Table.Th style={{ width: rem(40) }} />
    <Table.Th>Snippet Name</Table.Th>
    <Table.Th>Tags</Table.Th>
    <Table.Th style={actionRowStyle()}>Actions</Table.Th>
  </Table.Tr>
);

export default SnippetTableHead;
