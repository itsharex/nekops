import DottedMap from "dotted-map/without-countries";
import { memo, useEffect, useState } from "react";
import { useMantineTheme } from "@mantine/core";

import { mapJsonString } from "./mapJson.ts";

interface WorldMapProps {
  dots: {
    latitude: number;
    longitude: number;
    // color: string;
  }[];
}
const WorldMap = ({ dots }: WorldMapProps) => {
  const [svgMap, setSvgMap] = useState("");

  const theme = useMantineTheme();

  const map = new DottedMap({ map: JSON.parse(mapJsonString) });

  useEffect(() => {
    for (const dot of dots) {
      map.addPin({
        lat: dot.latitude,
        lng: dot.longitude,
        svgOptions: { color: "#62b6e7", radius: 0.4 },
      });
    }

    setSvgMap(
      map.getSVG({
        radius: 0.22,
        color: theme.colors.gray[6],
        shape: "circle",
      }),
    );
  }, [dots]);

  return (
    <div
      style={{
        aspectRatio: 2,
      }}
    >
      <img
        src={`data:image/svg+xml;utf8,${encodeURIComponent(svgMap)}`}
        alt="World Map"
        style={{
          height: "100%",
          width: "100%",
        }}
      />
    </div>
  );
};

export default memo(WorldMap);
