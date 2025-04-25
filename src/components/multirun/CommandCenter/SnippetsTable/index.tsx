import { Table } from "@mantine/core";
import { memo } from "react";

import SnippetsTableHead from "./Head.tsx";
import SnippetsTableRow from "./Row.tsx";
import { useSelector } from "react-redux";
import type { RootState } from "@/store.ts";
import { useTranslation } from "react-i18next";

interface SnippetsTableProps {
  setCommand: (code: string) => void;
}
const SnippetsTable = ({ setCommand }: SnippetsTableProps) => {
  const { t } = useTranslation("main", { keyPrefix: "multirun" });

  const snippets = useSelector((state: RootState) => state.snippets);

  return (
    <Table
      stickyHeader
      stickyHeaderOffset={-1}
      highlightOnHover
      withTableBorder
    >
      <Table.Thead
        style={{
          zIndex: 1,
        }}
      >
        <SnippetsTableHead />
      </Table.Thead>
      <Table.Tbody>
        {snippets.map((snippet) => (
          <SnippetsTableRow
            key={snippet.name}
            snippet={snippet}
            show={() => setCommand(snippet.code)}
          />
        ))}
      </Table.Tbody>
      <Table.Caption>
        {snippets.length > 0
          ? t("snippetTableCount", {
              count: snippets.length,
            })
          : t("snippetTableEmpty")}
      </Table.Caption>
    </Table>
  );
};

export default memo(SnippetsTable);
