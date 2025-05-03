import type { NotificationData } from "@mantine/notifications";
import { IconCheck, IconX } from "@tabler/icons-react";
import { rem } from "@mantine/core";

import i18next from "@/i18n/loaders/main.ts";

export const LoadingNotification: NotificationData = {
  color: "blue",
  loading: true,
  message: i18next.t("update.notificationLoadingMessage"),
  autoClose: false,
  withCloseButton: false,
};

export const CheckFailedNotification: NotificationData = {
  color: "red",
  title: i18next.t("update.notificationCheckFailedTitle"),
  message: i18next.t("update.notificationCheckFailedMessage"),
  icon: <IconX style={{ width: rem(18), height: rem(18) }} />,
  loading: false,
  autoClose: 4_000,
};

export const LatestVersionNotification: NotificationData = {
  color: "green",
  message: i18next.t("update.notificationLatestMessage"),
  icon: <IconCheck style={{ width: rem(18), height: rem(18) }} />,
  loading: false,
  autoClose: 4_000,
};

export const DownloadFailedNotification: NotificationData = {
  color: "red",
  title: i18next.t("update.notificationDownloadFailedTitle"),
  message: i18next.t("update.notificationDownloadFailedMessage"),
  icon: <IconX style={{ width: rem(18), height: rem(18) }} />,
  autoClose: 4_000,
};

export const DownloadFinishNotification: NotificationData = {
  color: "green",
  title: i18next.t("update.notificationDownloadFinishTitle"),
  message: i18next.t("update.notificationDownloadFinishMessage"),
  icon: <IconCheck style={{ width: rem(18), height: rem(18) }} />,
};
