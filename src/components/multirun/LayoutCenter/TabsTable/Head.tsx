import { Checkbox, rem, Table } from "@mantine/core";
import { actionRowStyle } from "@/common/actionStyles.ts";
import { memo } from "react";
import { useTranslation } from "react-i18next";

interface TabsTableHeadProps {
  selectedState: "all" | "partial" | "none";
  selectAll: (state: boolean) => void;
  isShowingGrid: boolean;
}
const TabsTableHead = ({
  selectedState,
  selectAll,
  isShowingGrid,
}: TabsTableHeadProps) => {
  const { t } = useTranslation("main", { keyPrefix: "multirun" });

  return (
    <Table.Tr>
      <Table.Th style={{ width: rem(40) }}>
        <Checkbox
          checked={selectedState === "all"}
          indeterminate={selectedState === "partial"}
          onChange={(ev) => selectAll(ev.currentTarget.checked)}
        />
      </Table.Th>
      <Table.Th>{t("serverName")}</Table.Th>
      <Table.Th>{isShowingGrid ? t("gridLocation") : t("order")}</Table.Th>
      <Table.Th style={actionRowStyle(1)}>{t("state")}</Table.Th>
    </Table.Tr>
  );
};

export default memo(TabsTableHead);
