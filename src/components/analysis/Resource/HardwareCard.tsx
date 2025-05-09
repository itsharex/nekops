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
import { IconCpu } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";

import type { Server } from "@/types/server.ts";
import CornerIcon from "@/components/analysis/CornerIcon.tsx";
import CPU from "@/icons/CPU.tsx";
import RAM from "@/icons/RAM.tsx";
import SSD from "@/icons/SSD.tsx";
import { useEffect, useState } from "react";
import type { SectionData } from "@/components/analysis/PercentSection.tsx";
import PercentSection from "@/components/analysis/PercentSection.tsx";

interface HardwareCardProps {
  servers: Server[];
}
const HardwareCard = ({ servers }: HardwareCardProps) => {
  const { t } = useTranslation("main", { keyPrefix: "analysis" });

  const theme = useMantineTheme();

  const [totalCPUCount, setTotalCPUCount] = useState(0);
  const [totalCPUCores, setTotalCPUCores] = useState(0);
  const [totalCPUThreads, setTotalCPUThreads] = useState(0);
  const [totalRamGB, setTotalRamGB] = useState(0);
  const [totalDiskTB, setTotalDiskTB] = useState(0);

  const [cpuCountByManufacturer, setCPUCountByManufacturer] = useState<
    SectionData[]
  >([]);
  const [ramSizeByGeneration, setRAMSizeByGeneration] = useState<SectionData[]>(
    [],
  );
  const [diskSizeByType, setDiskSizeByType] = useState<SectionData[]>([]);

  const cpuColors = [
    theme.colors.red[6],
    theme.colors.blue[6],
    theme.colors.green[6],
    theme.colors.violet[6],
  ];

  const ramColors = [
    theme.colors.lime[6],
    theme.colors.yellow[6],
    theme.colors.orange[6],
    theme.colors.red[6],
  ];

  const diskColors = [
    theme.colors.pink[6],
    theme.colors.cyan[6],
    theme.colors.grape[6],
    theme.colors.teal[6],
  ];

  useEffect(() => {
    if (servers.length > 0) {
      let cpuCountSum = 0;
      let cpuCoresSum = 0;
      let cpuThreadsSum = 0;
      let ramGBSum = 0;
      let diskTBSum = 0;
      // Count CPU by manufacturer
      const cpuCountManufacturerMap = new Map<string, number>();
      const ramSizeGenerationMap = new Map<number, number>();
      const diskSizeTypeMap = new Map<string, number>();
      for (const server of servers) {
        // Count by provider
        const cpuKey =
          server.hardware.cpu.manufacturer || t("resourceHardwareUnknown");
        cpuCountManufacturerMap.set(
          cpuKey,
          (cpuCountManufacturerMap.get(cpuKey) || 0) +
            server.hardware.cpu.count,
        );
        const ramKey = server.hardware.memory.generation;
        ramSizeGenerationMap.set(
          ramKey,
          (ramSizeGenerationMap.get(ramKey) || 0) + server.hardware.memory.size,
        );
        for (const disk of server.hardware.disk) {
          const diskKey = `${disk.type} (${disk.interface})`;
          const diskSizeTB =
            disk.count *
            (disk.size_unit === "TB"
              ? disk.size
              : disk.size_unit === "GB"
                ? disk.size / 1000
                : 0);
          diskSizeTypeMap.set(
            diskKey,
            (diskSizeTypeMap.get(diskKey) || 0) + diskSizeTB,
          );

          diskTBSum += diskSizeTB;
        }

        cpuCountSum += server.hardware.cpu.count;
        cpuCoresSum +=
          server.hardware.cpu.count * server.hardware.cpu.core_count;
        cpuThreadsSum +=
          server.hardware.cpu.count * server.hardware.cpu.thread_count;
        ramGBSum += server.hardware.memory.size;
      }
      setTotalCPUCount(cpuCountSum);
      setTotalCPUCores(cpuCoresSum);
      setTotalCPUThreads(cpuThreadsSum);
      setTotalRamGB(ramGBSum);
      setTotalDiskTB(diskTBSum);

      const cpuCountManufacturerArray = Array.from(
        cpuCountManufacturerMap.entries(),
      )
        .map(([provider, count]) => ({
          provider,
          count,
        }))
        .sort((a, b) => b.count - a.count);
      const ramSizeGenerationArray = Array.from(ramSizeGenerationMap.entries())
        .map(([generation, size]) => ({
          generation,
          size,
        }))
        .sort((a, b) => b.generation - a.generation);
      const diskSizeTypeArray = Array.from(diskSizeTypeMap.entries())
        .map(([type, size]) => ({
          type,
          size,
        }))
        .sort((a, b) => a.type.localeCompare(b.type));
      let iCpu = 0;
      const cpuCountManufacturerPending: SectionData[] = [];
      for (
        ;
        iCpu < cpuColors.length - 1 && iCpu < cpuCountManufacturerArray.length;
        iCpu++
      ) {
        cpuCountManufacturerPending.push({
          label: cpuCountManufacturerArray[iCpu].provider,
          text: cpuCountManufacturerArray[iCpu].count.toString(),
          part: (cpuCountManufacturerArray[iCpu].count / cpuCountSum) * 100,
          color: cpuColors[iCpu],
        });
      }
      // Merge all remains into one "Others"
      if (iCpu < cpuCountManufacturerArray.length) {
        let othersSum = 0;
        for (let j = iCpu; j < cpuCountManufacturerArray.length; j++) {
          othersSum += cpuCountManufacturerArray[iCpu].count;
        }
        cpuCountManufacturerPending.push({
          label: t("others"),
          text: othersSum.toString(),
          part: (othersSum / cpuCountSum) * 100,
          color: cpuColors[iCpu],
        });
      }
      setCPUCountByManufacturer(cpuCountManufacturerPending);
      setRAMSizeByGeneration(
        ramSizeGenerationArray.map((v, index) => ({
          label: `DDR${v.generation}`,
          text: `${v.size}GB`,
          part: (v.size / ramGBSum) * 100,
          color: ramColors[index % ramColors.length],
        })),
      );
      setDiskSizeByType(
        diskSizeTypeArray.map((v, index) => ({
          label: v.type,
          text: `${v.size}TB`,
          part: (v.size / diskTBSum) * 100,
          color: diskColors[index % diskColors.length],
        })),
      );
    }
  }, [servers]);

  return (
    <Card withBorder p="md" radius="md">
      <CornerIcon icon={IconCpu} />
      <Flex direction="column" gap="xl">
        <Group justify="space-between">
          <Box>
            <Title c="dimmed" order={3} size="h5" fw={700}>
              {t("resourceHardware")}
            </Title>

            <Flex direction="column">
              <Group>
                <CPU width={30} height={30} />
                <Text
                  fw={700}
                  style={{
                    fontSize: rem(36),
                  }}
                >
                  {totalCPUCount} ({totalCPUCores}
                  {t("resourceHardwareCPUCore")} {totalCPUThreads}
                  {t("resourceHardwareCPUThread")})
                </Text>
              </Group>
              <Flex direction="row" gap="xl">
                <Group>
                  <RAM width={30} height={30} />
                  <Text
                    fw={700}
                    style={{
                      fontSize: rem(36),
                    }}
                  >
                    {totalRamGB}GB
                  </Text>
                </Group>
                <Group>
                  <SSD width={30} height={30} />
                  <Text
                    fw={700}
                    style={{
                      fontSize: rem(36),
                    }}
                  >
                    {totalDiskTB.toFixed(3)}TB
                  </Text>
                </Group>
              </Flex>
            </Flex>
          </Box>
        </Group>

        <PercentSection
          title={t("resourceHardwareCPUCountByManufacturer")}
          data={cpuCountByManufacturer}
        />

        <PercentSection
          title={t("resourceHardwareRAMSizeByGeneration")}
          data={ramSizeByGeneration}
        />

        <PercentSection
          title={t("resourceHardwareDiskSizeByType")}
          data={diskSizeByType}
        />
      </Flex>
    </Card>
  );
};

export default HardwareCard;
