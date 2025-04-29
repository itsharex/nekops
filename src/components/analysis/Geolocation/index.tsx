import type { Server } from "@/types/server.ts";
import { Flex } from "@mantine/core";

import RegionCard from "./RegionCard.tsx";

interface GeneralStaticsProps {
  servers: Server[];
}
const Geolocation = ({ servers }: GeneralStaticsProps) => (
  <Flex direction="column" gap="md">
    <RegionCard servers={servers} />
  </Flex>
);

export default Geolocation;
