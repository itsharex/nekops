import { Modal, Paper, ScrollArea, Text } from "@mantine/core";
import { useTranslation } from "react-i18next";

import type { Server } from "@/types/server.ts";
import ServerCard from "@/components/ServerCard";

interface ServerCardModalProps {
  isOpen: boolean;
  close: () => void;
  serverInfo?: Server | null;
}
const ServerCardModal = ({
  isOpen,
  close,
  serverInfo,
}: ServerCardModalProps) => {
  const { t } = useTranslation("main", { keyPrefix: "common" });

  return (
    <Modal
      title={t("serverCard")}
      size="xl"
      radius="md"
      opened={isOpen}
      onClose={close}
      centered
      scrollAreaComponent={ScrollArea.Autosize}
    >
      {serverInfo && <ServerCard server={serverInfo} />}
      {serverInfo?.comment && (
        <Paper mt="md" shadow="xs" p="xl" radius="md" withBorder>
          <Text
            style={{
              whiteSpace: "pre-wrap",
            }}
          >
            {serverInfo.comment}
          </Text>
        </Paper>
      )}
    </Modal>
  );
};

export default ServerCardModal;
