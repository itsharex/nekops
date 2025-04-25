import { rem, Table } from "@mantine/core";
import { useTranslation } from "react-i18next";

import { actionRowStyle } from "@/common/actionStyles.ts";

const ServerTableHead = () => {
  const { t } = useTranslation("main", { keyPrefix: "library" });

  return (
    <Table.Tr>
      <Table.Th style={{ width: rem(40) }} />
      <Table.Th>{t("serverName")}</Table.Th>
      <Table.Th>{t("serverID")}</Table.Th>
      <Table.Th>{t("tags")}</Table.Th>
      <Table.Th style={actionRowStyle()}>{t("actions")}</Table.Th>
    </Table.Tr>
  );
};

export default ServerTableHead;
