import { Table } from "@mantine/core";
import { memo } from "react";
import { useTranslation } from "react-i18next";

const SnippetsTableHead = () => {
  const { t } = useTranslation("main", { keyPrefix: "multirun" });

  return (
    <Table.Tr>
      <Table.Th>{t("snippetName")}</Table.Th>
      <Table.Th>{t("tags")}</Table.Th>
    </Table.Tr>
  );
};

export default memo(SnippetsTableHead);
