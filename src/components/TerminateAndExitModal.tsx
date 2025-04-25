import { Button, Center, Group, Modal, Text } from "@mantine/core";
import { useTranslation } from "react-i18next";

interface TerminateAndExitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}
const TerminateAndExitModal = ({
  isOpen,
  onClose,
  onConfirm,
}: TerminateAndExitModalProps) => {
  const { t } = useTranslation("main", { keyPrefix: "terminateAndExitModal" });

  return (
    <Modal opened={isOpen} onClose={onClose} title={t("title")} centered>
      <Text>{t("message_1")}</Text>
      <Text>{t("message_2")}</Text>
      <Center mt="lg">
        <Group gap="sm">
          <Button variant="default" color="gray" onClick={onClose}>
            {t("cancel")}
          </Button>
          <Button color="red" onClick={onConfirm}>
            {t("confirm")}
          </Button>
        </Group>
      </Center>
    </Modal>
  );
};

export default TerminateAndExitModal;
