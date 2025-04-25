import { modals } from "@mantine/modals";
import {
  Box,
  Code,
  Flex,
  Text,
  TextInput,
  Title,
  Tooltip,
} from "@mantine/core";
import {
  IconAlertCircle,
  IconCertificate,
  IconKey,
  IconRosetteDiscountCheck,
} from "@tabler/icons-react";

import i18next from "@/i18n/loaders/shell.ts";

type HostKeyEventPayload = {
  // h: string; // Host
  fp: string; // Fingerprint
  s?: string[]; // HostWithSameKey
  o?: string; // OldFingerprint
};

interface FingerprintProps {
  label: string;
  fingerprint: string;
  error?: string;
}
const Fingerprint = ({ label, fingerprint, error }: FingerprintProps) => (
  <TextInput
    leftSection={
      <Tooltip label={label}>
        <IconKey size={16} />
      </Tooltip>
    }
    value={fingerprint.replace("SHA256:", "")}
    error={error}
    readOnly
  />
);

export const hostKeyEventHandler = (
  serverName: string,
  themeColor: string,
  payload: HostKeyEventPayload,
  acceptAction: () => void,
  rejectAction: () => void,
) => {
  if (payload.s?.length) {
    // Same host with new name
    modals.openConfirmModal({
      title: i18next.t("serverKeyEvents.aliasTitle"),
      children: (
        <>
          <Flex direction="column" align="center">
            <Box c="blue">
              <IconRosetteDiscountCheck size={48} />
            </Box>
            <Title order={2} mb="sm" c={themeColor}>
              {serverName}
            </Title>
          </Flex>
          <Fingerprint
            label={i18next.t("serverKeyEvents.fingerprintLabel")}
            fingerprint={payload.fp}
          />
          <Text>{i18next.t("serverKeyEvents.aliasMessage")}</Text>
          <Code block>{payload.s.join("\n")}</Code>
          <Text>{i18next.t("serverKeyEvents.aliasProceedMessage")}</Text>
        </>
      ),
      labels: {
        confirm: i18next.t("serverKeyEvents.actionConfirm"),
        cancel: i18next.t("serverKeyEvents.actionCancel"),
      },
      confirmProps: { color: "blue" },
      centered: true,
      onConfirm: acceptAction,
      onCancel: rejectAction,
      withCloseButton: false,
      closeOnClickOutside: false,
    });
  } else if (payload.o) {
    // Host changes its key
    modals.openConfirmModal({
      title: i18next.t("serverKeyEvents.changeTitle"),
      children: (
        <>
          <Flex direction="column" align="center">
            <Box c="red">
              <IconAlertCircle size={48} />
            </Box>
            <Title order={2} mb="sm" c={themeColor}>
              {serverName}
            </Title>
          </Flex>
          <Fingerprint
            label={i18next.t("serverKeyEvents.fingerprintLabel")}
            fingerprint={payload.fp}
            error={i18next.t("serverKeyEvents.changeFingerprintError")}
          />
          <Fingerprint
            label={i18next.t("serverKeyEvents.changeOldFingerprintLabel")}
            fingerprint={payload.o}
          />
          <Text c="red" fw={"bold"}>
            {i18next.t("serverKeyEvents.changeMessage_1")}
          </Text>
          <Text c="red">{i18next.t("serverKeyEvents.changeMessage_2")}</Text>
          <Text c="gray">{i18next.t("serverKeyEvents.changeMessage_3")}</Text>
          <Text>{i18next.t("serverKeyEvents.changeProceedMessage")}</Text>
        </>
      ),
      labels: {
        confirm: i18next.t("serverKeyEvents.actionConfirm"),
        cancel: i18next.t("serverKeyEvents.actionCancel"),
      },
      confirmProps: { color: "red" },
      centered: true,
      onConfirm: acceptAction,
      onCancel: rejectAction,
      withCloseButton: false,
      closeOnClickOutside: false,
    });
  } else {
    // Brand-new host
    modals.openConfirmModal({
      title: i18next.t("serverKeyEvents.newTitle"),
      children: (
        <>
          <Flex direction="column" align="center">
            <Box c="green">
              <IconCertificate size={48} />
            </Box>
            <Title order={2} mb="sm" c={themeColor}>
              {serverName}
            </Title>
          </Flex>
          <Fingerprint
            label={i18next.t("serverKeyEvents.fingerprintLabel")}
            fingerprint={payload.fp}
          />
        </>
      ),
      labels: {
        confirm: i18next.t("serverKeyEvents.actionConfirm"),
        cancel: i18next.t("serverKeyEvents.actionCancel"),
      },
      confirmProps: { color: "green" },
      centered: true,
      onConfirm: acceptAction,
      onCancel: rejectAction,
      withCloseButton: false,
      closeOnClickOutside: false,
    });
  }
};
