// Window pre-close event
export const EventNameWindowCloseMain = "windowCloseMain";
export const EventNameWindowCloseShell = "windowCloseShell";
export const EventNameWindowCloseRescue = "windowCloseRescue";

// Window resize (also for grid-system's split event)
export const EventNameWindowResizeShell = "windowResizeShell";

// Create a new shell session
export const EventNameShellNew = "shellNew";

// Check if shell is ready
export const EventNameShellReadyRequest = "shellReadyRequest";
export const EventNameShellReadyResponse = "shellReadyResponse";

// Select active session tab by nonce
export const EventNameShellSetActiveTabByNonce = "shellSetActiveTabByNonce";

// Send code to specific sessions
export const EventNameShellSendCommandByNonce = "shellSendCommandByNonce";

// Request for current tabs
export const EventNameShellTabsListRequest = "shellTabsListRequest";
export const EventNameShellTabsListResponse = "shellTabsListResponse";

// Send special command to shell by nonce
export const EventNameShellSelectAllByNonce = "shellSelectAllByNonce";

// Shell grid system
export const EventNameShellGridModify = "shellGridModify"; // Add 1 row

// Create a new rescue session
export const EventNameRescueNew = "rescueNew";

// Check if rescue is ready
export const EventNameRescueReadyRequest = "rescueReadyRequest";
export const EventNameRescueReadyResponse = "rescueReadyResponse";

// Send special command to rescue by nonce
export const EventNameRescuePowerCycleByNonce = "rescuePowerCycleByNonce";
export const EventNameRescueSendCtrlAltDelByNonce =
  "rescueSendCtrlAltDelByNonce";
