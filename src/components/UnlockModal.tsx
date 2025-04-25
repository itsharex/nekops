import { useDispatch } from "react-redux";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { Button, Center, Modal, PasswordInput } from "@mantine/core";
import { IconLock } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";

import type { AppDispatch } from "@/store.ts";
import { unlock } from "@/slices/encryptionSlice.ts";

interface UnlockModalProps {
  isOpen: boolean;
  close: () => void;
  successMessage: string;
}
const UnlockModal = ({ isOpen, close, successMessage }: UnlockModalProps) => {
  const { t } = useTranslation("main", { keyPrefix: "unlockModal" });

  const dispatch = useDispatch<AppDispatch>();

  interface UnlockForm {
    password: string;
  }

  const form = useForm<UnlockForm>({
    mode: "uncontrolled",
    initialValues: {
      password: "",
    },
  });

  const unlockFromSubmit = async (values: UnlockForm) => {
    try {
      await dispatch(unlock(values.password)).unwrap();
      notifications.show({
        color: "green",
        title: t("successTitle"),
        message: successMessage,
      });
      close();
    } catch (e) {
      notifications.show({
        color: "red",
        title: t("failTitle"),
        message: t("failMessage"),
      });
    }
  };

  return (
    <Modal
      opened={isOpen}
      onClose={close}
      title={t("title")}
      size="lg"
      radius="md"
      centered
    >
      <form onSubmit={form.onSubmit(unlockFromSubmit)}>
        <PasswordInput
          label={t("password")}
          data-autofocus
          {...form.getInputProps("password")}
        />

        <Center mt="lg">
          <Button type="submit" leftSection={<IconLock />}>
            {t("title")}
          </Button>
        </Center>
      </form>
    </Modal>
  );
};

export default UnlockModal;
