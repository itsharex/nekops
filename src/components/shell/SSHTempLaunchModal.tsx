import { useTranslation } from "react-i18next";
import { useForm } from "@mantine/form";
import {
  Autocomplete,
  Button,
  Grid,
  Modal,
  NumberInput,
  TextInput,
  useMantineTheme,
} from "@mantine/core";

import type { Server } from "@/types/server.ts";
import { defaultServer } from "@/types/server.ts";
import { useSelector } from "react-redux";
import type { RootState } from "@/store.ts";
import { useEffect } from "react";

type TempLaunchForm = {
  address: string;
  port: number;
  user?: string;
};

interface SSHTempLaunchModalProps {
  isOpen: boolean;
  close: () => void;
  launch: (server: Server) => void;
}
const SSHTempLaunchModal = ({
  isOpen,
  close,
  launch,
}: SSHTempLaunchModalProps) => {
  const { t } = useTranslation("main", { keyPrefix: "ssh" });

  const servers = useSelector((state: RootState) => state.servers);

  const theme = useMantineTheme();

  const form = useForm<TempLaunchForm>({
    mode: "uncontrolled",
    initialValues: {
      address: "",
      port: 22, // Default SSH port
      user: "",
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
        regular: {
          address: values.address,
          port: values.port,
          user: values.user || "root",
          is_jump_server: false,
        },
        emergency: defaultServer.access.emergency,
      },
    });
    close();
  };

  return (
    <Modal
      opened={isOpen}
      onClose={close}
      title={<>{t("tempLaunch")}</>}
      size="lg"
      centered
    >
      <form onSubmit={form.onSubmit(launchSubmit)}>
        <Grid>
          <Grid.Col span={9}>
            <TextInput
              label={t("tempLaunchAddressLabel")}
              required
              withAsterisk={false}
              {...form.getInputProps("address")}
            />
          </Grid.Col>
          <Grid.Col span={3}>
            <NumberInput
              label={t("tempLaunchPortLabel")}
              allowNegative={false}
              allowDecimal={false}
              allowLeadingZeros={false}
              min={1}
              max={65535}
              required
              withAsterisk={false}
              {...form.getInputProps("port")}
            />
          </Grid.Col>
        </Grid>

        <Autocomplete
          label={t("tempLaunchUserLabel")}
          placeholder="root"
          data={[
            ...new Set(servers.map((server) => server.access.regular.user)),
          ].filter((u) => Boolean(u))}
          style={{
            flexGrow: 1,
          }}
          {...form.getInputProps("user")}
        />

        <Button mt="lg" type="submit" fullWidth>
          {t("tempLaunchButton")}
        </Button>
      </form>
    </Modal>
  );
};

export default SSHTempLaunchModal;
