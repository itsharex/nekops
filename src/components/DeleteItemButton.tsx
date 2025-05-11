import { IconTrash } from "@tabler/icons-react";
import type { ActionIconVariant, MantineSize } from "@mantine/core";
import {
  ActionIcon,
  Button,
  Center,
  Group,
  Modal,
  Text,
  Title,
  Tooltip,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { CSSProperties } from "react";
import { useTranslation } from "react-i18next";

interface ConfirmDeleteModalProps {
  open: boolean;
  onClose: () => void;
  itemName: string;
  confirm: () => void;
}
const ConfirmDeleteModal = ({
  open,
  onClose,
  itemName,
  confirm,
}: ConfirmDeleteModalProps) => {
  const { t } = useTranslation("main", { keyPrefix: "deleteButton" });

  return (
    <Modal
      title={t("deleteConfirmation")}
      opened={open}
      onClose={onClose}
      centered
    >
      <Text>{t("messageBefore")}</Text>
      <Title order={3} my="md" c="red">
        {itemName}
      </Title>
      <Text>{t("messageAfter")}</Text>
      <Center mt="lg">
        <Group gap="sm">
          <Button variant="default" color="gray" onClick={onClose}>
            {t("cancel")}
          </Button>
          <Button color="red" onClick={confirm}>
            {t("confirm")}
          </Button>
        </Group>
      </Center>
    </Modal>
  );
};

interface DeleteItemButtonProps {
  itemName: string;
  size?: number | MantineSize | string | undefined;
  variant?: string | ActionIconVariant | undefined;
  iconStyle?: CSSProperties;
  onClick: () => void;
  disabled?: boolean;
}
const DeleteItemButton = ({
  itemName,
  size,
  variant,
  iconStyle,
  onClick,
  disabled,
}: DeleteItemButtonProps) => {
  const { t } = useTranslation("main", { keyPrefix: "deleteButton" });

  const [
    isConfirmModalOpen,
    { open: openConfirmModal, close: closeConfirmModal },
  ] = useDisclosure(false);

  return (
    <>
      <Tooltip label={t("action_delete")} openDelay={500}>
        <ActionIcon
          size={size}
          variant={variant}
          color="red"
          onClick={openConfirmModal}
          disabled={disabled}
        >
          <IconTrash style={iconStyle} />
        </ActionIcon>
      </Tooltip>
      <ConfirmDeleteModal
        open={isConfirmModalOpen}
        onClose={closeConfirmModal}
        itemName={itemName}
        confirm={() => {
          closeConfirmModal();
          onClick();
        }}
      />
    </>
  );
};

export default DeleteItemButton;
