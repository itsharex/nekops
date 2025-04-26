import { WebviewWindow } from "@tauri-apps/api/webviewWindow";
import { SessionShellBackgroundImageKey } from "@/events/storage.ts";

const ShellWindowLabel = "nekopshell"; // Nekops Shell

/**
 * Open (or create if non-current) Shell Window
 */
export const openShellWindow = async (backgroundImage: string) => {
  let shellWindow = await WebviewWindow.getByLabel(ShellWindowLabel);
  if (shellWindow === null) {
    // Open new
    localStorage.setItem(SessionShellBackgroundImageKey, backgroundImage);
    shellWindow = new WebviewWindow(ShellWindowLabel, {
      title: "Nekops Shell",
      url: "shell.html",
      width: 1200,
      height: 800,
    });
  } else {
    // Bring back to focus
    if (await shellWindow.isMinimized()) {
      await shellWindow.unminimize();
    }
    if (!(await shellWindow.isFocused())) {
      await shellWindow.setFocus();
    }
  }
  return shellWindow;
};
