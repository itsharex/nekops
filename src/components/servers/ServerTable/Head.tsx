import { rem, Table } from "@mantine/core";
import { actionRowStyle } from "@/common/actionStyles.ts";

const ServerTableHead = () => (
  <Table.Tr>
    <Table.Th style={{ width: rem(40) }} />
    <Table.Th>Server Name</Table.Th>
    <Table.Th>Server ID</Table.Th>
    <Table.Th>Tags</Table.Th>
    <Table.Th style={actionRowStyle()}>Actions</Table.Th>
  </Table.Tr>
);

export default ServerTableHead;
