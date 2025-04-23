import {
  Flex,
  type MantineColorScheme,
  SegmentedControl,
  Text,
  useMantineColorScheme,
} from "@mantine/core";
import { IconBolt, IconMoon, IconSun } from "@tabler/icons-react";
import { transformSegmentedControlOptions } from "@/components/settings/utils.tsx";

const colorSchemeData = [
  {
    icon: IconSun,
    text: "Light",
    value: "light",
  },
  {
    icon: IconBolt,
    text: "Auto",
    value: "auto",
  },
  {
    icon: IconMoon,
    text: "Dark",
    value: "dark",
  },
];

const ColorSchemeSelector = () => {
  const { colorScheme, setColorScheme, clearColorScheme } =
    useMantineColorScheme();

  return (
    <Flex direction="column">
      <Text size="sm" fw={500} mb={2}>
        Color Scheme
      </Text>
      <SegmentedControl
        data={transformSegmentedControlOptions(colorSchemeData)}
        value={colorScheme}
        onChange={(newScheme) => {
          if (["light", "dark", "auto"].includes(newScheme)) {
            setColorScheme(newScheme as MantineColorScheme);
          } else {
            // Unknown value
            clearColorScheme();
          }
        }}
      />
    </Flex>
  );
};

export default ColorSchemeSelector;
