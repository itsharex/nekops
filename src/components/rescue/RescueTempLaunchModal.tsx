import { useTranslation } from "react-i18next";
import { useForm } from "@mantine/form";
import {
  Button,
  Code,
  Modal,
  PasswordInput,
  TextInput,
  useMantineTheme,
} from "@mantine/core";
import { useEffect } from "react";

import type { Server } from "@/types/server.ts";
import { defaultServer } from "@/types/server.ts";

type TempLaunchForm = {
  address: string;
  username: string;
  password: string;
};

interface RescueTempLaunchModalProps {
  isOpen: boolean;
  close: () => void;
  launch: (server: Server) => void;
}
const RescueTempLaunchModal = ({
  isOpen,
  close,
  launch,
}: RescueTempLaunchModalProps) => {
  const { t } = useTranslation("main", { keyPrefix: "rescue" });

  const theme = useMantineTheme();

  const form = useForm<TempLaunchForm>({
    mode: "uncontrolled",
    initialValues: {
      address: "",
      username: "",
      password: "",
    },
  });

  useEffect(() => {
    if (isOpen) {
      form.reset();
    }
  }, [isOpen]);

  const launchSubmit = (values: TempLaunchForm) => {
    launch({
      ...defaultServer,
      name: t("tempLaunch"),
      color: theme.colors.orange[3],
      access: {
        regular: defaultServer.access.regular,
        emergency: {
          method: "VNC", // Only support this for now
          address: values.address,
          username: values.username,
          password: values.password,
          root_password: "",
          comment: "",
        },
      },
    });
    close();
  };

  return (
    <Modal
      opened={isOpen}
      onClose={close}
      title={
        <>
          {t("tempLaunch")} <Code>{t("accessType_VNC")}</Code>
        </>
      }
      size="lg"
      centered
    >
      <form onSubmit={form.onSubmit(launchSubmit)}>
        <TextInput
          label={t("tempLaunchAddressLabel")}
          required
          withAsterisk={false}
          {...form.getInputProps("address")}
        />

        <TextInput
          label={t("tempLaunchUsernameLabel")}
          {...form.getInputProps("username")}
        />

        <PasswordInput
          label={t("tempLaunchPasswordLabel")}
          {...form.getInputProps("password")}
        />

        <Button mt="lg" type="submit" fullWidth>
          {t("tempLaunchButton")}
        </Button>
      </form>
    </Modal>
  );
};

export default RescueTempLaunchModal;
