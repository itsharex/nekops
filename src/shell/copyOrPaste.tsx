import type { Terminal } from "xterm";
import { readText, writeText } from "@tauri-apps/plugin-clipboard-manager";
import { notifications } from "@mantine/notifications";
import { IconCheck } from "@tabler/icons-react";
import { Code, rem, Text } from "@mantine/core";
import { modals } from "@mantine/modals";

import i18next from "@/i18n/loaders/shell.ts";

export const copyOrPaste = async (instance: Terminal) => {
  if (instance.hasSelection()) {
    // Selected, set to clipboard
    await writeText(instance.getSelection());
    // Clear selection
    instance.clearSelection();
    // Send notification
    notifications.show({
      title: i18next.t("copyOrPaste.copySuccessTitle"),
      message: i18next.t("copyOrPaste.copySuccessMessage"),
      color: "green",
      icon: <IconCheck style={{ width: rem(18), height: rem(18) }} />,
      autoClose: 2_000,
    });
  } else {
    const clipboardText = await readText();
    if (!!clipboardText) {
      // Has content
      if (clipboardText.includes("\n")) {
        // Multiline
        modals.openConfirmModal({
          title: i18next.t("copyOrPaste.pasteConfirmTitle"),
          children: (
            <>
              <Text size="sm" mb="sm">
                {i18next.t("copyOrPaste.pasteConfirmMessage")}
              </Text>
              <Code block>{clipboardText}</Code>
            </>
          ),
          labels: {
            confirm: i18next.t("copyOrPaste.actionConfirm"),
            cancel: i18next.t("copyOrPaste.actionCancel"),
          },
          centered: true,
          onConfirm: () => {
            instance.paste(clipboardText);
          },
        });
      } else {
        instance.paste(clipboardText);
      }
    }
  }
};
