import type { Server } from "@/types/server.ts";
import { Card } from "@mantine/core";
import WorldMap from "@/components/analysis/Geolocation/WorldMap.tsx";

interface MapCardProps {
  servers: Server[];
}
const MapCard = ({ servers }: MapCardProps) => (
  <Card withBorder p="md" radius="md">
    <WorldMap
      dots={servers
        .filter((s) => s.location.latitude && s.location.longitude)
        .map((s) => ({
          latitude: s.location.latitude!,
          longitude: s.location.longitude!,
          // color: s.color,
        }))}
    />
  </Card>
);

export default MapCard;
