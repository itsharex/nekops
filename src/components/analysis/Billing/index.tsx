import { Flex } from "@mantine/core";

import type { Server } from "@/types/server.ts";

import BillingCard from "./BillingCard.tsx";
import MostValuableServers from "./MVS.tsx";
import MostSpentServers from "./MSS.tsx";

interface BillingProps {
  servers: Server[];
}
const Billing = ({ servers }: BillingProps) => (
  <Flex direction="column" gap="md">
    <BillingCard servers={servers} />
    <MostValuableServers servers={servers} limit={5} />
    <MostSpentServers servers={servers} limit={5} />
  </Flex>
);

export default Billing;
