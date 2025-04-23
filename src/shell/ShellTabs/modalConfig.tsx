import { List, Text, Title } from "@mantine/core";
import type { ShellSingleServer } from "@/events/payload.ts";

export const terminateConfirmModal = (
  serverName: string,
  serverColor: string,
  onConfirm: () => void,
) => ({
  title: "Terminate confirmation",
  children: (
    <>
      <Text>Are you sure to terminate :</Text>
      <Title order={3} my="md" c={serverColor}>
        {serverName}
      </Title>
    </>
  ),
  labels: { confirm: "Terminate", cancel: "Cancel" },
  confirmProps: { color: "red" },
  centered: true,
  onConfirm,
});

export const reconnectConfirmModal = (
  serverName: string,
  serverColor: string,
  onConfirm: () => void,
) => ({
  title: "Reconnect confirmation",
  children: (
    <>
      <Text>Are you sure to reconnect :</Text>
      <Title order={3} my="md" c={serverColor}>
        {serverName}
      </Title>
    </>
  ),
  labels: { confirm: "Reconnect", cancel: "Cancel" },
  confirmProps: { color: "yellow" },
  centered: true,
  onConfirm,
});

export const terminateAllConfirmModal = (
  activeServers: ShellSingleServer[],
  onConfirm: () => void,
) => ({
  title: "Terminate All",
  children: (
    <>
      <Text>These shells are still running...</Text>
      <List my="md" ml="md">
        {activeServers.map((server) => (
          <List.Item key={server.nonce} c={server.color}>
            {server.name}
          </List.Item>
        ))}
      </List>
      <Text>Are you sure to terminate them all?</Text>
    </>
  ),
  labels: { confirm: "Terminate", cancel: "Cancel" },
  confirmProps: { color: "red" },
  centered: true,
  onConfirm,
});
