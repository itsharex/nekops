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

type HostKeyEventPayload = {
  // h: string; // Host
  fp: string; // Fingerprint
  s?: string[]; // HostWithSameKey
  o?: string; // OldFingerprint
};

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
      title: "Server has a new name",
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
          <TextInput
            leftSection={
              <Tooltip label="Key fingerprint (SHA256)">
                <IconKey size={16} />
              </Tooltip>
            }
            value={payload.fp.replace("SHA256:", "")}
            contentEditable={false}
          />
          <Text>Shares the same key with these servers:</Text>
          <Code block>{payload.s.join("\n")}</Code>
          <Text>OK to proceed?</Text>
        </>
      ),
      labels: { confirm: "Accept", cancel: "Reject" },
      confirmProps: { color: "blue" },
      centered: true,
      onConfirm: acceptAction,
      onCancel: rejectAction,
    });
  } else if (payload.o) {
    // Host changes its key
    modals.openConfirmModal({
      title: "Server changes its key",
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
          <TextInput
            label="Key fingerprint (SHA256)"
            leftSection={<IconKey size={16} />}
            value={payload.fp.replace("SHA256:", "")}
            contentEditable={false}
            error="Key changed"
          />
          <TextInput
            label="Old key fingerprint (SHA256)"
            leftSection={<IconKey size={16} />}
            value={payload.o.replace("SHA256:", "")}
            contentEditable={false}
          />
          <Text c="red">
            IT IS POSSIBLE THAT SOMEONE IS DOING SOMETHING NASTY! <br />
            Someone could be eavesdropping on you right now (man-in-the-middle
            attack)! <br />
            It is also possible that a host key has just been changed.
          </Text>
          <Text>Accept the risk and proceed?</Text>
        </>
      ),
      labels: { confirm: "Accept", cancel: "Reject" },
      confirmProps: { color: "red" },
      centered: true,
      onConfirm: acceptAction,
      onCancel: rejectAction,
    });
  } else {
    // Brand-new host
    modals.openConfirmModal({
      title: "Brand-new Server",
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
          <TextInput
            leftSection={
              <Tooltip label="Key fingerprint (SHA256)">
                <IconKey size={16} />
              </Tooltip>
            }
            value={payload.fp.replace("SHA256:", "")}
            contentEditable={false}
          />
        </>
      ),
      labels: { confirm: "Accept", cancel: "Reject" },
      confirmProps: { color: "green" },
      centered: true,
      onConfirm: acceptAction,
      onCancel: rejectAction,
    });
  }
};
