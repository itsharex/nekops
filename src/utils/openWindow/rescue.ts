import { WebviewWindow } from "@tauri-apps/api/webviewWindow";

const RescueWindowLabel = "nekopsrescue"; // Nekops rescue

/**
 * Open (or create if non-current) Rescue Window
 */
export const openRescueWindow = async () => {
  let rescueWindow = await WebviewWindow.getByLabel(RescueWindowLabel);
  if (rescueWindow === null) {
    // Open new
    rescueWindow = new WebviewWindow(RescueWindowLabel, {
      title: "Nekops Rescue",
      url: "rescue.html",
      width: 1200,
      height: 800,
      // contentProtected: true,
    });
  } else {
    // Bring back to focus
    if (await rescueWindow.isMinimized()) {
      await rescueWindow.unminimize();
    }
    if (!(await rescueWindow.isFocused())) {
      await rescueWindow.setFocus();
    }
  }
  return rescueWindow;
};
