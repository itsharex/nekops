import type { Server } from "@/types/server.ts";
import { useTranslation } from "react-i18next";
import {
  Box,
  Card,
  Flex,
  Group,
  rem,
  Text,
  Title,
  useMantineTheme,
} from "@mantine/core";
import { useEffect, useState } from "react";
import { IconBusinessplan, IconCurrencyDollar } from "@tabler/icons-react";

import type { SectionData } from "../PercentSection.tsx";
import PercentSection from "../PercentSection.tsx";
import CornerIcon from "@/components/analysis/CornerIcon.tsx";

interface BillingCardProps {
  servers: Server[];
}
const BillingCard = ({ servers }: BillingCardProps) => {
  const { t } = useTranslation("main", { keyPrefix: "analysis" });

  const theme = useMantineTheme();
  const [billingSum, setBillingSum] = useState(0);
  const [billingCountByType, setBillingCountByType] = useState<SectionData[]>([
    {
      label: t("billingDS"),
      text: "0",
      part: 50,
      color: theme.colors.indigo[6], // indigo
    },
    {
      label: t("billingVPS"),
      text: "0",
      part: 50,
      color: theme.colors.lime[6], // lime
    },
  ]);
  const [billingCountByProvider, setBillingCountByProvider] = useState<
    SectionData[]
  >([]);

  const providersColors = [
    theme.colors.green[6],
    theme.colors.cyan[6],
    theme.colors.violet[6],
    theme.colors.pink[6],
  ];

  useEffect(() => {
    if (servers.length > 0) {
      // Count by type
      let sumDS = 0;
      let sumVPS = 0;

      // Count by provider
      const sumProviderMap = new Map<string, number>();

      for (const server of servers) {
        // Count by type
        if (server.provider.type === "DS") {
          sumDS += server.provider.price;
        } else if (server.provider.type === "VPS") {
          sumVPS += server.provider.price;
        }
        // Count by provider
        sumProviderMap.set(
          server.provider.name,
          (sumProviderMap.get(server.provider.name) || 0) +
            server.provider.price,
        );
      }
      const sum = sumDS + sumVPS;
      setBillingSum(sum);
      // Count by type
      setBillingCountByType([
        {
          label: t("billingDS"),
          text: "$" + sumDS.toFixed(2),
          part: (sumDS / sum) * 100,
          color: "#3b5bdb", // indigo
        },
        {
          label: t("billingVPS"),
          text: "$" + sumVPS.toFixed(2),
          part: (sumVPS / sum) * 100,
          color: "#66a811", // lime
        },
      ]);

      // Count by provider
      const sumProviderArray = Array.from(sumProviderMap.entries())
        .map(([provider, priceSum]) => ({
          provider,
          priceSum,
        }))
        .sort((a, b) => b.priceSum - a.priceSum);

      let i = 0;
      const countByProviderPending: SectionData[] = [];
      for (
        ;
        i < providersColors.length - 1 && i < sumProviderArray.length;
        i++
      ) {
        countByProviderPending.push({
          label: sumProviderArray[i].provider,
          text: "$" + sumProviderArray[i].priceSum.toFixed(2),
          part: (sumProviderArray[i].priceSum / sum) * 100,
          color: providersColors[i],
        });
      }
      // Merge all remains into one "Others"
      if (i < sumProviderArray.length) {
        let othersSum = 0;
        for (let j = i; j < sumProviderArray.length; j++) {
          othersSum += sumProviderArray[i].priceSum;
        }
        countByProviderPending.push({
          label: t("others"),
          text: "$" + othersSum.toFixed(2),
          part: (othersSum / sum) * 100,
          color: providersColors[i],
        });
      }
      setBillingCountByProvider(countByProviderPending);
    }
  }, [servers]);

  return (
    <Card withBorder p="md" radius="md">
      <CornerIcon icon={IconBusinessplan} />
      <Flex direction="column" gap="xl">
        <Group justify="space-between">
          <Box>
            <Title c="dimmed" order={3} size="h5" fw={700}>
              {t("billingMonthlyBill")}
            </Title>

            <Group>
              <IconCurrencyDollar size={36} color={theme.colors.teal[6]} />
              <Text
                fw={700}
                style={{
                  fontSize: rem(36),
                }}
              >
                {billingSum.toFixed(2)}
              </Text>
            </Group>
          </Box>
        </Group>

        <PercentSection
          title={t("billingByServerTypes")}
          data={billingCountByType}
        />
        <PercentSection
          title={t("billingByServerProviders")}
          data={billingCountByProvider}
        />
      </Flex>
    </Card>
  );
};

export default BillingCard;
