import type { ReactNode } from "react";
import { Center, rem } from "@mantine/core";

export const transformSegmentedControlOptions = (
  data: {
    icon: (props: any) => ReactNode;
    text: string;
    value: string;
  }[],
) =>
  data.map((item) => ({
    label: (
      <Center style={{ gap: 10 }}>
        <item.icon style={{ width: rem(16), height: rem(16) }} />
        <span>{item.text}</span>
      </Center>
    ),
    value: item.value,
  }));
