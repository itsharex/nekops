import {
  Badge,
  Blockquote,
  Button,
  Flex,
  Modal,
  Progress,
} from "@mantine/core";
import { useTranslation } from "react-i18next";
import type { Update } from "@tauri-apps/plugin-updater";
import { useState } from "react";
import { relaunch } from "@tauri-apps/plugin-process";
import { notifications } from "@mantine/notifications";

import {
  DownloadFailedNotification,
  DownloadFinishNotification,
} from "@/notifications/update.tsx";
import { IconInfoCircle } from "@tabler/icons-react";

interface UpdateModalProps {
  isOpen: boolean;
  close: () => void;
  update: Update | null;
}
const UpdateModal = ({ isOpen, close, update }: UpdateModalProps) => {
  const { t } = useTranslation("main", { keyPrefix: "update" });

  const [isDownloading, setIsDownloading] = useState(false);
  const [bytesDownloaded, setBytesDownloaded] = useState(0);
  const [bytesTotal, setBytesTotal] = useState(0);

  const startUpdate = async () => {
    if (!update) {
      // You must be kidding
      return;
    }

    setBytesTotal(0);
    setIsDownloading(true);

    try {
      await update.downloadAndInstall((ev) => {
        switch (ev.event) {
          case "Started":
            setBytesTotal(ev.data.contentLength || 0);
            break;
          case "Progress":
            setBytesDownloaded((prev) => prev + ev.data.chunkLength);
            break;
          case "Finished":
            notifications.show(DownloadFinishNotification);
            break;
        }
      });

      // Update installed
      await relaunch();
    } catch (e) {
      console.warn(e);
      notifications.show(DownloadFailedNotification);
      setIsDownloading(false);
    }
  };

  return (
    <Modal
      opened={isOpen}
      onClose={close}
      title={
        <>
          {t("newVersionFound")}
          <Badge ml="xs">{update?.version}</Badge>
        </>
      }
      centered
      withCloseButton={!isDownloading}
      closeOnClickOutside={!isDownloading}
      closeOnEscape={!isDownloading}
    >
      <Flex py="sm" direction="column" gap="sm">
        <Blockquote
          color="blue"
          cite={
            update?.date
              ? new Date(update.date).toISOString().split("T")[0]
              : undefined
          }
          icon={<IconInfoCircle />}
          style={{
            whiteSpace: "pre-wrap",
          }}
        >
          {update?.body}
        </Blockquote>
        <Progress
          value={bytesTotal ? (bytesDownloaded / bytesTotal) * 100 : 100}
          animated={isDownloading}
        />
        <Button
          variant="filled"
          fullWidth
          onClick={startUpdate}
          loading={isDownloading}
        >
          {t("startDownload")}
        </Button>
      </Flex>
    </Modal>
  );
};

export default UpdateModal;
