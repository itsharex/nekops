import {
  Badge,
  Box,
  Flex,
  Group,
  Pill,
  rem,
  Text,
  Title,
  Tooltip,
} from "@mantine/core";
import { IconCloudComputing, IconServer, IconTag } from "@tabler/icons-react";
import { memo } from "react";

import type { ServerCardInnerProps } from "@/components/ServerCard/props.ts";

import CPU from "@/icons/CPU.tsx";
import RAM from "@/icons/RAM.tsx";
import SSD from "@/icons/SSD.tsx";
import Ethernet from "@/icons/Ethernet.tsx";

const Inner = ({ server }: ServerCardInnerProps) => (
  <>
    <Box
      bg={server.color}
      style={{
        height: rem(24 * 16),
        width: rem(24 * 16),
        borderRadius: rem(24 * 16),
        justifyContent: "center",
        position: "absolute",
        right: rem(-9 * 16),
        bottom: rem(-9 * 16),
      }}
    />
    {server.provider.type === "DS" ? (
      <IconServer
        color="white"
        opacity="30%"
        style={{
          width: rem(10 * 16),
          height: rem(10 * 16),
          position: "absolute",
          bottom: rem(-0.5 * 16),
          right: 0,
        }}
      />
    ) : (
      <IconCloudComputing
        color="white"
        opacity="30%"
        style={{
          width: rem(9 * 16),
          height: rem(9 * 16),
          position: "absolute",
          bottom: 0,
          right: rem(0.5 * 16),
        }}
      />
    )}
    <Flex
      justify="space-between"
      gap="xl"
      direction="column"
      h="100%"
      ml={rem(0.5 * 16)}
      w={`calc(100% - ${rem(16 * 16)})`}
      style={{
        flexGrow: 1,
      }}
    >
      <Flex direction="column" gap="xs">
        <Group>
          <Title order={2} size="h1">
            {server.name}
          </Title>
          <Tooltip label={server.id}>
            <Badge color={server.color}>{server.id.split(".")?.[0]}</Badge>
          </Tooltip>
        </Group>
        <Pill.Group>
          {server.tags.map((tag) => (
            <Pill key={tag}>
              <Flex align="center" gap={6}>
                <IconTag size={12} />
                <span>{tag}</span>
              </Flex>
            </Pill>
          ))}
        </Pill.Group>
      </Flex>
      <Flex direction="column">
        <Flex gap="md" opacity="80%" wrap="wrap">
          <Tooltip
            label={`${
              server.hardware.cpu.count > 1
                ? `${server.hardware.cpu.count} × `
                : ""
            }${server.hardware.cpu.manufacturer} ${server.hardware.cpu.model}`}
          >
            <Flex gap={6}>
              <CPU
                width={24}
                height={24}
                style={{
                  flexShrink: 0,
                }}
              />
              <Text>
                {server.hardware.cpu.count * server.hardware.cpu.core_count}C
                {server.hardware.cpu.core_count !==
                  server.hardware.cpu.thread_count && (
                  <>
                    (
                    {server.hardware.cpu.count *
                      server.hardware.cpu.thread_count}
                    T)
                  </>
                )}
              </Text>
            </Flex>
          </Tooltip>
          <Tooltip
            label={`DDR${server.hardware.memory.generation}${
              server.hardware.memory.ecc ? " ECC" : ""
            } ${server.hardware.memory.frequency}MHz`}
          >
            <Flex gap={6}>
              <RAM
                width={24}
                height={24}
                style={{
                  flexShrink: 0,
                }}
              />
              <Text>{server.hardware.memory.size}GB</Text>
            </Flex>
          </Tooltip>
          <Tooltip
            label={server.hardware.disk
              .map(
                (d) =>
                  `${d.count > 1 ? `${d.count}×` : ""}${d.size}${d.size_unit} ${d.type}`,
              )
              .join(" + ")}
          >
            <Flex gap={6}>
              <SSD
                width={24}
                height={24}
                style={{
                  flexShrink: 0,
                }}
              />
              <Text>
                {server.hardware.disk.reduce(
                  (counter, cur) => counter + cur.count,
                  0,
                )}
                ×
              </Text>
            </Flex>
          </Tooltip>
          <Tooltip
            label={
              server.traffic.limit
                ? `${server.traffic.limit} TB${server.traffic.double_rate ? "*" : ""}`
                : "∞"
            }
          >
            <Flex gap={6}>
              <Ethernet
                width={24}
                height={24}
                style={{
                  flexShrink: 0,
                }}
              />
              <Text>
                {server.traffic.bandwidth >= 1000
                  ? `${(server.traffic.bandwidth / 1000).toFixed(1)} Gbps`
                  : `${server.traffic.bandwidth} Mbps`}
              </Text>
            </Flex>
          </Tooltip>
        </Flex>
      </Flex>
    </Flex>
  </>
);

export default memo(Inner);
