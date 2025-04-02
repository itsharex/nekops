import type { Terminal } from "@xterm/xterm";
import { readText, writeText } from "@tauri-apps/plugin-clipboard-manager";
import { notifications } from "@mantine/notifications";
import { IconCheck } from "@tabler/icons-react";
import { Code, rem, Text } from "@mantine/core";
import { modals } from "@mantine/modals";

export const copyOrPaste = async (instance: Terminal) => {
  if (instance.hasSelection()) {
    // Selected, set to clipboard
    await writeText(instance.getSelection());
    // Clear selection
    instance.clearSelection();
    // Send notification
    notifications.show({
      title: "Copied!",
      message: "Text copied to clipboard. Feel free to paste it anywhere.",
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
          title: "Paste confirmation",
          children: (
            <>
              <Text size="sm" mb="sm">
                Clipboard has multiple lines. Sure to paste them all?
              </Text>
              <Code block>{clipboardText}</Code>
            </>
          ),
          labels: { confirm: "Confirm", cancel: "Cancel" },
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
