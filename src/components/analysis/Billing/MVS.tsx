import type { Server } from "@/types/server.ts";
import { useTranslation } from "react-i18next";
import { useEffect, useMemo, useState } from "react";
import {
  Badge,
  Button,
  Card,
  Checkbox,
  Divider,
  Flex,
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

  const [isShowingVPS, setIsShowingVPS] = useState(true);
  const [isShowingDS, setIsShowingDS] = useState(true);

  const [isExpand, setIsExpand] = useState(false);

  const serverSortByPrice = useMemo(
    () => servers.toSorted((a, b) => b.provider.price - a.provider.price),
    [servers],
  );

  useEffect(() => {
    if (serverSortByPrice.length > 0) {
      let sum = 0;
      const filteredServer = serverSortByPrice.filter(
        (s) =>
          (isShowingVPS && s.provider.type === "VPS") ||
          (isShowingDS && s.provider.type === "DS"),
      );
      const mvs = isExpand ? filteredServer : filteredServer.slice(0, limit);
      for (const valuableServer of mvs) {
        sum += valuableServer.provider.price;
      }
      setMVS(mvs);
      setMVSPriceSum(sum);
    }
  }, [serverSortByPrice, isExpand, isShowingVPS, isShowingDS]);

  return (
    <Card withBorder p="md" radius="md">
      <Flex direction="row" justify="space-between">
        <Title c="dimmed" order={3} size="h5" fw={700}>
          {isExpand || servers.length <= limit
            ? t("billingMVSAll")
            : t("billingMVSTop", {
                limit,
              })}
          <Badge ml="sm" color="violet">
            $ {MVSPriceSum.toFixed(2)}
          </Badge>
        </Title>

        <Flex direction="row" gap="xs">
          <Checkbox
            label={t("billingVPS")}
            checked={isShowingVPS}
            onChange={(ev) => {
              setIsShowingVPS(ev.target.checked);
              if (!ev.target.checked && !isShowingDS) {
                setIsShowingDS(true);
              }
            }}
          />
          <Checkbox
            label={t("billingDS")}
            checked={isShowingDS}
            onChange={(ev) => {
              setIsShowingDS(ev.target.checked);
              if (!ev.target.checked && !isShowingVPS) {
                setIsShowingVPS(true);
              }
            }}
          />
        </Flex>
      </Flex>

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
              <Table.Td>
                {server.provider.type === "DS"
                  ? t("billingDS")
                  : t("billingVPS")}
              </Table.Td>
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
                  {t("buttonExpand")}
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
