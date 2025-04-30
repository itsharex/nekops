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

interface ServerWithTotalSpent extends Server {
  billingMonths: number;
  totalSpent: number;
}

interface MostSpentServersProps {
  servers: Server[];
  limit: number;
}
const MostSpentServers = ({ servers, limit }: MostSpentServersProps) => {
  const { t } = useTranslation("main", { keyPrefix: "analysis" });

  const [MSS, setMSS] = useState<ServerWithTotalSpent[]>([]);
  const [MSSPriceSum, setMSSPriceSum] = useState(0);

  const [isExpand, setIsExpand] = useState(false);

  const serverSortBySpent = useMemo(() => {
    const now = Date.now();
    return servers
      .map((s): ServerWithTotalSpent => {
        const currentMonths = Math.ceil(
          (now - new Date(s.provider.start_since).getTime()) / 2592000_000, // 2592000 = 30 * 24 * 3600, convert milliseconds to months
        );

        const billingMonths = s.provider.paid_annually
          ? 12 * Math.ceil(currentMonths / 12)
          : currentMonths;

        return {
          ...s,
          billingMonths,
          totalSpent: billingMonths * s.provider.price,
        };
      })
      .toSorted((a, b) => b.totalSpent - a.totalSpent);
  }, [servers]);

  useEffect(() => {
    if (serverSortBySpent.length > 0) {
      let sum = 0;
      const mss = isExpand
        ? serverSortBySpent
        : serverSortBySpent.slice(0, limit);
      for (const valuableServer of mss) {
        sum += valuableServer.totalSpent;
      }
      setMSS(mss);
      setMSSPriceSum(sum);
    }
  }, [serverSortBySpent, isExpand]);

  return (
    <Card withBorder p="md" radius="md">
      <Title c="dimmed" order={3} size="h5" fw={700}>
        {isExpand || servers.length <= limit
          ? t("billingMSSAll")
          : t("billingMSSTop", {
              limit,
            })}
        <Pill ml="sm" c="violet">
          $ {MSSPriceSum.toFixed(2)}
        </Pill>
      </Title>

      <Table mt="md">
        <Table.Thead>
          <Table.Tr>
            <Table.Th>{t("billingMSSServerName")}</Table.Th>
            <Table.Th>{t("billingMSSStartSince")}</Table.Th>
            <Table.Th>{t("billingMSSBillingMonths")}</Table.Th>
            <Table.Th>{t("billingMSSTotalSpent")}</Table.Th>
            <Table.Th />
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {MSS.map((server) => (
            <Table.Tr key={server.id}>
              <Table.Td c={server.color}>{server.name}</Table.Td>
              <Table.Td>{server.provider.start_since}</Table.Td>
              <Table.Td>
                {server.billingMonths}
                {server.provider.paid_annually && (
                  <Pill ml="xs" c="yellow">
                    {t("billingMSSPaidAnnually")}
                  </Pill>
                )}
              </Table.Td>
              <Table.Td>${server.totalSpent.toFixed(2)}</Table.Td>
              <Table.Td width="20%">
                <Progress.Root>
                  <Progress.Section
                    value={(server.totalSpent / MSSPriceSum) * 100}
                    color="teal"
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

export default MostSpentServers;
