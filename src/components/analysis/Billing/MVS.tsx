import type { Server } from "@/types/server.ts";
import { useTranslation } from "react-i18next";
import { useEffect, useMemo, useState } from "react";
import {
  Button,
  Card,
  Divider,
  Pill,
  Progress,
  Table,
  Title,
} from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";

interface MostValuableServersProps {
  servers: Server[];
  limit: number;
}
const MostValuableServers = ({ servers, limit }: MostValuableServersProps) => {
  const { t } = useTranslation("main", { keyPrefix: "analysis" });

  const [MVS, setMVS] = useState<Server[]>([]);
  const [MVSPriceSum, setMVSPriceSum] = useState(0);

  const [isExpand, setIsExpand] = useState(false);

  const serverSortByPrice = useMemo(
    () => servers.toSorted((a, b) => b.provider.price - a.provider.price),
    [servers],
  );

  useEffect(() => {
    if (serverSortByPrice.length > 0) {
      let sum = 0;
      const mvs = isExpand
        ? serverSortByPrice
        : serverSortByPrice.slice(0, limit);
      for (const valuableServer of mvs) {
        sum += valuableServer.provider.price;
      }
      setMVS(mvs);
      setMVSPriceSum(sum);
    }
  }, [serverSortByPrice, isExpand]);

  return (
    <Card withBorder p="md" radius="md">
      <Title c="dimmed" order={3} size="h5" fw={700}>
        {isExpand || servers.length <= limit
          ? t("billingMVSAll")
          : t("billingMVSTop", {
              limit,
            })}
        <Pill ml="sm" c="violet">
          $ {MVSPriceSum.toFixed(2)}
        </Pill>
      </Title>

      <Table mt="md">
        <Table.Thead>
          <Table.Tr>
            <Table.Th>{t("billingMVSServerName")}</Table.Th>
            <Table.Th>{t("billingMVSProvider")}</Table.Th>
            <Table.Th>{t("billingMVSType")}</Table.Th>
            <Table.Th>{t("billingMVSPrice")}</Table.Th>
            <Table.Th />
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {MVS.map((server) => (
            <Table.Tr key={server.id}>
              <Table.Td>{server.name}</Table.Td>
              <Table.Td>{server.provider.name}</Table.Td>
              <Table.Td>{server.provider.type}</Table.Td>
              <Table.Td>${server.provider.price.toFixed(2)}</Table.Td>
              <Table.Td width="20%">
                <Progress.Root>
                  <Progress.Section
                    value={
                      (server.provider.price / MVS[0].provider.price) * 100
                    }
                    color={server.color}
                  />
                </Progress.Root>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
        {!isExpand && servers.length > limit && (
          <Table.Caption>
            <Divider
              variant="dotted"
              label={
                <Button
                  variant="outline"
                  size="xs"
                  onClick={() => setIsExpand(true)}
                  leftSection={<IconPlus size={15} />}
                >
                  {t("billingButtonExpand")}
                </Button>
              }
            />
          </Table.Caption>
        )}
      </Table>
    </Card>
  );
};

export default MostValuableServers;
