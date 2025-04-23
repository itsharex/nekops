import type { ShellClientType, ShellSettings } from "./shell.ts";

export type WorkSpace = {
  id: string;
  name: string;
  data_dir: string;
};

type SettingsCommon = {
  workspaces: WorkSpace[];
  default_ssh_action: "copy" | "start";
  default_ssh_client: ShellClientType;
  customize: {
    font_family: {
      common: string;
      monospace: string;
      headings: string;
    };
    shell: ShellSettings;
  };
};

export type SettingsSave = {
  current_workspace_id: string;
} & SettingsCommon;

export type SettingsState = {
  current_workspace: WorkSpace;
} & SettingsCommon;

export const defaultWorkspace: WorkSpace = {
  id: "default",
  name: "Default",
  data_dir: "nekops_data",
};

export const defaultSettings: SettingsState = {
  workspaces: [defaultWorkspace],
  current_workspace: defaultWorkspace,
  default_ssh_action: "copy",
  default_ssh_client: "embedded",
  customize: {
    font_family: {
      common: "",
      monospace: "",
      headings: "",
    },
    shell: {
      background_color: "#000000E6",
      background_image: "",
      foreground_color: "#ffffff",
      font_family: "",
      font_size: 15,
    },
  },
};
