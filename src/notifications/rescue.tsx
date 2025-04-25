import type { NotificationData } from "@mantine/notifications";
import { IconCheck } from "@tabler/icons-react";
import { rem } from "@mantine/core";

import i18next from "@/i18n/loaders/main.ts";

export const LoadingNotification: NotificationData = {
  color: "blue",
  loading: true,
  title: i18next.t("rescue.notificationLoadingTitle"),
  message: i18next.t("rescue.notificationLoadingMessage"),
  autoClose: false,
  withCloseButton: false,
};

export const SuccessNotification: NotificationData = {
  color: "teal",
  title: i18next.t("rescue.notificationSuccessTitle"),
  message: i18next.t("rescue.notificationSuccessMessage"),
  icon: <IconCheck style={{ width: rem(18), height: rem(18) }} />,
  loading: false,
  autoClose: 4_000,
};

export const FailNotification: NotificationData = {
  color: "red",
  message: i18next.t("rescue.notificationFailMessage"),
};
