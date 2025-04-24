import { Table } from "@mantine/core";
import { memo } from "react";
import { useTranslation } from "react-i18next";

import { SpecialCharsMapping } from "../specialCharsMapping.ts";

interface SpecialCharsTableProps {
  append: (data: string) => void;
}
const SpecialCharsTable = ({ append }: SpecialCharsTableProps) => {
  const { t } = useTranslation("main", { keyPrefix: "multirun" });

  return (
    <Table highlightOnHover>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>{t("specialCharName")}</Table.Th>
          <Table.Th>{t("specialCharDescription")}</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {SpecialCharsMapping.map((char) => (
          <Table.Tr
            key={char.key}
            onClick={() => append(char.key)}
            style={{
              cursor: "pointer",
            }}
          >
            <Table.Td>{char.key}</Table.Td>
            <Table.Td>{t(char.description)}</Table.Td>
          </Table.Tr>
        ))}
      </Table.Tbody>
    </Table>
  );
};

export default memo(SpecialCharsTable);
