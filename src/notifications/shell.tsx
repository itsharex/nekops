import type { NotificationData } from "@mantine/notifications";
import { IconCheck } from "@tabler/icons-react";
import { rem } from "@mantine/core";

import i18next from "@/i18n/loaders/main.ts";

export const LoadingNotification: NotificationData = {
  color: "blue",
  loading: true,
  title: i18next.t("ssh.notificationLoadingTitle"),
  message: i18next.t("ssh.notificationLoadingMessage"),
  autoClose: false,
  withCloseButton: false,
};

export const SuccessNotification: NotificationData = {
  color: "teal",
  title: i18next.t("ssh.notificationSuccessTitle"),
  message: i18next.t("ssh.notificationSuccessMessage"),
  icon: <IconCheck style={{ width: rem(18), height: rem(18) }} />,
  loading: false,
  autoClose: 4_000,
};

export const FailNotification: NotificationData = {
  color: "red",
  message: i18next.t("ssh.notificationFailMessage"),
};
