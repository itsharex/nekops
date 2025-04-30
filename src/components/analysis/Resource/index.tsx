import { Flex } from "@mantine/core";

import type { Server } from "@/types/server.ts";

import HardwareCard from "./HardwareCard.tsx";

interface ResourcesProps {
  servers: Server[];
}
const Resource = ({ servers }: ResourcesProps) => (
  <Flex direction="column" gap="md">
    <HardwareCard servers={servers} />
  </Flex>
);

export default Resource;
