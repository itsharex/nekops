import { List, Text, Title } from "@mantine/core";

import type { ShellSingleServer } from "@/events/payload.ts";

import i18next from "@/i18n/loaders/shell.ts";

export const terminateConfirmModal = (
  serverName: string,
  serverColor: string,
  onConfirm: () => void,
) => ({
  title: i18next.t("modals.terminateConfirmTitle"),
  children: (
    <>
      <Text>{i18next.t("modals.terminateConfirmMessage")}</Text>
      <Title order={3} my="md" c={serverColor}>
        {serverName}
      </Title>
    </>
  ),
  labels: {
    confirm: i18next.t("modals.terminateConfirmActionConfirm"),
    cancel: i18next.t("modals.terminateConfirmActionCancel"),
  },
  confirmProps: { color: "red" },
  centered: true,
  onConfirm,
});

export const reconnectConfirmModal = (
  serverName: string,
  serverColor: string,
  onConfirm: () => void,
) => ({
  title: i18next.t("modals.reconnectConfirmTitle"),
  children: (
    <>
      <Text>{i18next.t("modals.reconnectConfirmMessage")}</Text>
      <Title order={3} my="md" c={serverColor}>
        {serverName}
      </Title>
    </>
  ),
  labels: {
    confirm: i18next.t("modals.reconnectConfirmActionConfirm"),
    cancel: i18next.t("modals.reconnectConfirmActionCancel"),
  },
  confirmProps: { color: "yellow" },
  centered: true,
  onConfirm,
});

export const terminateAllConfirmModal = (
  activeServers: ShellSingleServer[],
  onConfirm: () => void,
) => ({
  title: i18next.t("modals.terminateAllConfirmTitle"),
  children: (
    <>
      <Text>{i18next.t("modals.terminateAllConfirmMessage_before")}</Text>
      <List my="md" ml="md">
        {activeServers.map((server) => (
          <List.Item key={server.nonce} c={server.color}>
            {server.name}
          </List.Item>
        ))}
      </List>
      <Text>{i18next.t("modals.terminateAllConfirmMessage_after")}</Text>
    </>
  ),
  labels: {
    confirm: i18next.t("modals.terminateAllConfirmActionConfirm"),
    cancel: i18next.t("modals.terminateAllConfirmActionCancel"),
  },
  confirmProps: { color: "red" },
  centered: true,
  onConfirm,
});
