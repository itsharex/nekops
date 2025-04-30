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
import { IconBuilding, IconMapPin } from "@tabler/icons-react";

import type { Server } from "@/types/server.ts";
import CornerIcon from "@/components/analysis/CornerIcon.tsx";
import PercentSection, {
  SectionData,
} from "@/components/analysis/PercentSection.tsx";

interface CountByRegionProps {
  servers: Server[];
}
const RegionCard = ({ servers }: CountByRegionProps) => {
  const { t } = useTranslation("main", { keyPrefix: "analysis" });

  const theme = useMantineTheme();

  const predefinedColors = [
    theme.colors.red[6],
    theme.colors.grape[6],
    theme.colors.indigo[6],
    theme.colors.cyan[6],
    theme.colors.green[6],
    theme.colors.yellow[6],

    theme.colors.pink[6],
    theme.colors.violet[6],
    theme.colors.blue[6],
    theme.colors.teal[6],
    theme.colors.lime[6],
    theme.colors.orange[6],
  ];

  const [totalDatacenters, setTotalDatacenters] = useState(0);
  const [locationCount, setLocationCount] = useState<SectionData[]>([]);

  useEffect(() => {
    const locntsMap = new Map<string, number>();
    for (const server of servers) {
      const locationKey = server.location.region || t("geolocationWorld");
      locntsMap.set(locationKey, (locntsMap.get(locationKey) || 0) + 1);
    }
    const locntsArray = Array.from(locntsMap.entries())
      .map(([loc, cnt]) => ({
        region: loc,
        count: cnt,
      }))
      .sort((a, b) => b.count - a.count);
    setTotalDatacenters(locntsArray.length);

    let i = 0;
    const locationPending: SectionData[] = [];
    for (; i < predefinedColors.length - 1 && i < locntsArray.length; i++) {
      locationPending.push({
        label: locntsArray[i].region,
        text: locntsArray[i].count.toString(),
        part: (locntsArray[i].count / servers.length) * 100,
        color: predefinedColors[i],
      });
    }
    if (i < locntsArray.length) {
      let otherSum = 0;
      for (let j = i; j < locntsArray.length; j++) {
        otherSum += locntsArray[i].count;
      }
      locationPending.push({
        label: t("others"),
        text: otherSum.toString(),
        part: (otherSum / servers.length) * 100,
        color: predefinedColors[i],
      });
    }

    setLocationCount(locationPending);
  }, [servers]);

  return (
    <Card withBorder p="md" radius="md">
      <CornerIcon icon={IconMapPin} />

      <Flex direction="column" gap="xl">
        <Group justify="space-between">
          <Box>
            <Title c="dimmed" order={3} size="h5" fw={700}>
              {t("geolocationDataCenterRegions")}
            </Title>

            <Group>
              <IconBuilding size={36} color={theme.colors.teal[6]} />
              <Text
                fw={700}
                style={{
                  fontSize: rem(36),
                }}
              >
                {totalDatacenters}
              </Text>
            </Group>
          </Box>
        </Group>

        <PercentSection
          title={t("geolocationServerCountByRegion")}
          data={locationCount}
        />
      </Flex>
    </Card>
  );
};

export default RegionCard;
