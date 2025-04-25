import type { NotificationData } from "@mantine/notifications";
import { IconCheck } from "@tabler/icons-react";
import { rem } from "@mantine/core";

export const LoadingNotification = (
  t: (key: string) => string,
): NotificationData => ({
  color: "blue",
  loading: true,
  title: t("notificationLoadingTitle"),
  message: t("notificationLoadingMessage"),
  autoClose: false,
  withCloseButton: false,
});

export const SuccessNotification = (
  t: (key: string) => string,
): NotificationData => ({
  color: "teal",
  title: t("notificationSuccessTitle"),
  message: t("notificationSuccessMessage"),
  icon: <IconCheck style={{ width: rem(18), height: rem(18) }} />,
  loading: false,
  autoClose: 4_000,
});

export const FailNotification = (
  t: (key: string) => string,
): NotificationData => ({
  color: "red",
  message: t("notificationFailMessage"),
});
