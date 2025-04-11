import type { AccessEmergency, AccessRegular } from "@/types/server.ts";
import type { TabState } from "@/types/tabState.ts";
import {
  ShellClientType,
  ShellGridLocation,
  ShellGridPos,
} from "@/types/shell.ts";

export interface ServerBase {
  nonce: string;
  name: string;
  color: string;
}

export interface ShellSingleServer extends ServerBase {
  access: AccessRegular;
  jumpServer?: AccessRegular;
  clientOptions: ShellClientOptions;
}

export interface ShellClientOptions {
  type: ShellClientType;
  workspaceKnownHostsFile?: string;
}

export interface EventPayloadShellNew {
  server: ShellSingleServer[];
}

export interface EventPayloadShellSendCommandByNonce {
  nonce: string[];
  command: string;
}

export interface EventPayloadTabsListResponseSingleTab {
  server: ServerBase;
  state: TabState;
  isNewMessage: boolean;
  gridLocation: ShellGridLocation;
  isActive: boolean;
}

export interface EventPayloadTabsListResponse {
  grid: ShellGridPos;
  tabs: EventPayloadTabsListResponseSingleTab[];
}

export interface RescueSingleServer extends ServerBase {
  access: AccessEmergency;
}

export interface EventPayloadRescueNew {
  server: RescueSingleServer[];
}

export interface EventPayloadRescuePowerCycleByNonce {
  nonce: string;
  action: "shutdown" | "reset" | "reboot";
}
