import {
  ActionIcon,
  ActionIconGroup,
  Badge,
  Center,
  Divider,
  Flex,
  Image,
  Modal,
  rem,
  Text,
  Title,
  Tooltip,
} from "@mantine/core";
import { getVersion } from "@tauri-apps/api/app";
import { useEffect, useState } from "react";
import {
  IconCode,
  IconHeartFilled,
  IconHome,
  IconNotebook,
  IconShare,
} from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import { open } from "@tauri-apps/plugin-shell";

import { actionIconStyle } from "@/common/actionStyles.ts";

interface AboutModalProps {
  isOpen: boolean;
  close: () => void;
  checkUpdate: () => void;
}
const AboutModal = ({ isOpen, close, checkUpdate }: AboutModalProps) => {
  const { t } = useTranslation("main", { keyPrefix: "aboutModal" });

  const [version, setVersion] = useState("...");

  useEffect(() => {
    (async () => {
      setVersion(await getVersion());
    })();
  }, []);

  return (
    <Modal opened={isOpen} onClose={close} title={t("aboutNekops")} centered>
      <Flex py="sm" direction="column">
        <Flex direction="row" justify="space-around" align="center">
          <Image
            src="/icon.png"
            alt="Nekops"
            w={rem(128)}
            h={rem(128)}
            radius={rem(128)}
            style={{
              outline: "2px solid #62b6e7",
              outlineOffset: "4px",
            }}
          />
          <Flex direction="column" align="center">
            <Title order={1}>Nekops</Title>
            <Text>Ops' now nyaing</Text>
            <Tooltip label={t("checkUpdate")} openDelay={500}>
              <Badge
                mt={rem(4)}
                style={{
                  cursor: "pointer",
                }}
                onClick={() => checkUpdate()}
              >
                {version}
              </Badge>
            </Tooltip>
            <ActionIconGroup mt="sm">
              <Tooltip label={t("linkHomepage")} openDelay={500}>
                <ActionIcon
                  variant="filled"
                  size="sm"
                  color="cyan"
                  onClick={() => open("https://nekops.app")}
                >
                  <IconHome style={actionIconStyle} />
                </ActionIcon>
              </Tooltip>
              <Tooltip label={t("linkSourceCode")} openDelay={500}>
                <ActionIcon
                  variant="filled"
                  size="sm"
                  color="lime"
                  onClick={() => open("https://github.com/Candinya/nekops")}
                >
                  <IconCode style={actionIconStyle} />
                </ActionIcon>
              </Tooltip>
              <Tooltip label={t("linkDocuments")} openDelay={500}>
                <ActionIcon
                  variant="filled"
                  size="sm"
                  color="yellow"
                  onClick={() => open("https://docs.nekops.app")}
                >
                  <IconNotebook style={actionIconStyle} />
                </ActionIcon>
              </Tooltip>
              <Tooltip label={t("linkCommunity")} openDelay={500}>
                <ActionIcon
                  variant="filled"
                  size="sm"
                  color="orange"
                  onClick={() => open("https://community.nekops.app")}
                >
                  <IconShare style={actionIconStyle} />
                </ActionIcon>
              </Tooltip>
            </ActionIconGroup>
          </Flex>
        </Flex>
        <Divider my="lg" variant="dotted" label={t("about")} />
        <Center>
          <Flex gap={rem(4)}>
            <Text>{t("author_before")}</Text>
            <IconHeartFilled
              style={{
                color: "red",
              }}
            />
            <Text>{t("author_after")}</Text>
          </Flex>
        </Center>
      </Flex>
    </Modal>
  );
};

export default AboutModal;
