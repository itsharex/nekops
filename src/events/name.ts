// Create a new SSH session
export const EventNewSSHName = "newSSH";

// Check if SSH window is ready
export const EventRequestSSHWindowReadyName = "requestSSHWindowReady";
export const EventResponseSSHWindowReadyName = "responseSSHWindowReady";

// Select active session tab by nonce
export const EventSetActiveTabByNonceName = "setActiveTabByNonce";

// Send code to specific sessions
export const EventSendCommandByNonceName = "sendCommandByNonce";

// Request for current tabs
export const EventRequestTabsListName = "requestTabsList";
export const EventResponseTabsListName = "responseTabsList";

// Send special command to shell by nonce
export const EventShellSelectAllByNonceName = "shellSelectAllByNonce";
export const EventShellSTTYFitByNonceName = "shellSTTYFitByNonce";

// Main window pre-close event
export const EventMainWindowPreCloseName = "mainWindowPreClose";
export const EventShellWindowPreCloseName = "shellWindowPreClose";
