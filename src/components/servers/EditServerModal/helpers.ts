import type { Disk, Server } from "@/types/server.ts";
import { defaultDisk, defaultServer } from "@/types/server.ts";

export const i18nDefaultServer = (t: (key: string) => string): Server => {
  const base = structuredClone(defaultServer);
  base.hardware.cpu.model = t("hardwareCPUModelDefault");
  return base;
};

export const i18nDefaultDisk = (t: (key: string) => string): Disk => {
  const base = structuredClone(defaultDisk);
  base.model = t("hardwareDiskModelDefault");
  return base;
};
