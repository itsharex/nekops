import { useState } from "react";
import { ActionIcon, Tooltip } from "@mantine/core";
import { writeText } from "@tauri-apps/plugin-clipboard-manager";
import { notifications } from "@mantine/notifications";
import { useTranslation } from "react-i18next";
import { IconClipboardCheck, IconClipboardCopy } from "@tabler/icons-react";
import { actionIconStyle } from "@/common/actionStyles.ts";

interface CopyButtonProps {
  value: string;
  timeout?: number;
  small?: boolean;
}

const CopyButton = ({
  value,
  timeout = 1000,
  small = false,
}: CopyButtonProps) => {
  const { t } = useTranslation("main", { keyPrefix: "copyButton" });

  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await writeText(value);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, timeout);
      notifications.show({
        color: "green",
        message: t("messageSuccess"),
      });
    } catch (e) {
      notifications.show({
        color: "red",
        message: t("messageFail"),
      });
    }
  };

  return (
    <Tooltip label={copied ? t("stateCopied") : t("stateCopy")} openDelay={500}>
      <ActionIcon
        size={small ? undefined : "lg"}
        color={copied ? "cyan" : "green"}
        onClick={copy}
      >
        {copied ? (
          <IconClipboardCheck style={small ? actionIconStyle : undefined} />
        ) : (
          <IconClipboardCopy style={small ? actionIconStyle : undefined} />
        )}
      </ActionIcon>
    </Tooltip>
  );
};

export default CopyButton;
