import { ScrollArea } from "@mantine/core";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";

import type { RootState } from "@/store.ts";

import GroupDivider from "@/components/GroupDivider.tsx";
import GeneralStatics from "@/components/analysis/GeneralStatics.tsx";
import Geolocation from "@/components/analysis/Geolocation";
import Billing from "@/components/analysis/Billing";
import Resource from "@/components/analysis/Resource";

const AnalysisPage = () => {
  const { t } = useTranslation("main", { keyPrefix: "analysis" });

  const servers = useSelector((state: RootState) => state.servers);
  const snippets = useSelector((state: RootState) => state.snippets);
  const encryption = useSelector((state: RootState) => state.encryption);

  return (
    <ScrollArea p="md" h="100%">
      <GeneralStatics
        servers={servers}
        snippets={snippets}
        encryption={encryption}
      />

      <GroupDivider label={t("sectionGeolocation")} />
      <Geolocation servers={servers} />

      <GroupDivider label={t("sectionBilling")} />
      <Billing servers={servers} />

      <GroupDivider label={t("sectionResource")} />
      <Resource servers={servers} />
    </ScrollArea>
  );
};

export default AnalysisPage;
