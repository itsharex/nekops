import type { Disk, Server } from "@/types/server.ts";
import { defaultDisk, defaultServer } from "@/types/server.ts";
import i18next from "@/i18n/loaders/main.ts";

export const i18nDefaultServer = (): Server => {
  const base = structuredClone(defaultServer);
  base.hardware.cpu.model = i18next.t(
    "editServerModal.hardwareCPUModelDefault",
  );
  return base;
};

export const i18nDefaultDisk = (): Disk => {
  const base = structuredClone(defaultDisk);
  base.model = i18next.t("editServerModal.hardwareDiskModelDefault");
  return base;
};
