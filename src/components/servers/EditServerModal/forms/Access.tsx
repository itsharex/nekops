import type { InputFormProps } from "../inputFormProps.ts";
import {
  Autocomplete,
  Checkbox,
  Fieldset,
  Flex,
  Group,
  NumberInput,
  PasswordInput,
  SegmentedControl,
  Text,
  Textarea,
} from "@mantine/core";
import { useTranslation } from "react-i18next";

interface AccessFormProps extends InputFormProps {
  knownSSHUsers: string[];
  isCreatingNew: boolean;
}
const AccessForm = ({
  form,
  knownSSHUsers,
  isCreatingNew,
}: AccessFormProps) => {
  const { t } = useTranslation("main", { keyPrefix: "editServerModal" });

  const publicAccessEndpoints = [
    ...new Set(form.values.network.public.map((ip) => ip.alias || ip.address)),
  ];

  const privateAccessEndpoints = [
    ...new Set(form.values.network.private.map((ip) => ip.alias || ip.address)),
  ].filter((endpoint) => !publicAccessEndpoints.includes(endpoint));

  return (
    <>
      <Fieldset legend={t("accessRegular")}>
        <Group>
          <Autocomplete
            label={t("accessAddressLabel")}
            placeholder={t("accessAddressPlaceholder")}
            data={[
              {
                group: t("networkPublic"),
                items: publicAccessEndpoints,
              },
              {
                group: t("networkPrivate"),
                items: privateAccessEndpoints,
              },
            ]}
            style={{
              flexGrow: 1,
            }}
            {...form.getInputProps("access.regular.address")}
          />
          <Flex direction="column" justify="end">
            <Text size="sm" fw={500} mb={1}>
              {t("accessJumpServerLabel")}
            </Text>
            <Checkbox
              size="xl"
              {...form.getInputProps("access.regular.is_jump_server", {
                type: "checkbox",
              })}
            />
          </Flex>
        </Group>
        <Group mt="md">
          <NumberInput
            label={t("accessPortLabel")}
            allowNegative={false}
            allowDecimal={false}
            allowLeadingZeros={false}
            min={1}
            max={65535}
            {...form.getInputProps("access.regular.port")}
          />
          <Autocomplete
            label={t("accessUserLabel")}
            placeholder="root"
            data={knownSSHUsers}
            style={{
              flexGrow: 1,
            }}
            {...form.getInputProps("access.regular.user")}
          />
        </Group>
      </Fieldset>
      <Fieldset mt="md" legend={t("accessEmergency")}>
        <PasswordInput
          label={t("accessRootPasswordLabel")}
          defaultVisible={isCreatingNew}
          {...form.getInputProps("access.emergency.root_password")}
        />
        <Group mt="md">
          <Flex direction="column">
            <Text size="sm" fw={500} mb={2}>
              {t("accessTypeLabel")}
            </Text>
            <SegmentedControl
              data={[
                {
                  label: t("accessType_VNC"),
                  value: "VNC",
                },
                {
                  label: t("accessType_IPMI"),
                  value: "IPMI",
                },
                {
                  label: t("accessType_Other"),
                  value: "Other",
                },
              ]}
              {...form.getInputProps("access.emergency.method")}
            />
          </Flex>
          <PasswordInput
            label={t("accessAddressLabel")}
            style={{
              flexGrow: 1,
            }}
            defaultVisible={isCreatingNew}
            {...form.getInputProps("access.emergency.address")}
          />
        </Group>
        <Group mt="md" grow>
          <PasswordInput
            label={t("accessUsernameLabel")}
            defaultVisible={isCreatingNew}
            {...form.getInputProps("access.emergency.username")}
          />
          <PasswordInput
            label={t("accessPasswordLabel")}
            defaultVisible={isCreatingNew}
            {...form.getInputProps("access.emergency.password")}
          />
        </Group>
        <Textarea
          mt="md"
          label={t("accessCommentLabel")}
          autosize
          minRows={4}
          placeholder={t("accessCommentPlaceholder")}
          {...form.getInputProps("access.emergency.comment")}
        />
      </Fieldset>
    </>
  );
};

export default AccessForm;
