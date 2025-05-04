import {
  Flex,
  type MantineColorScheme,
  SegmentedControl,
  Text,
  useMantineColorScheme,
} from "@mantine/core";
import { IconBolt, IconMoon, IconSun } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";

import { transformSegmentedControlOptions } from "@/components/settings/utils.tsx";

const ColorSchemeSelector = () => {
  const { t } = useTranslation("main", { keyPrefix: "settings" });

  const { colorScheme, setColorScheme, clearColorScheme } =
    useMantineColorScheme();

  return (
    <Flex direction="column">
      <Text size="sm" fw={500} mb={2}>
        {t("generalColorScheme")}
      </Text>
      <SegmentedControl
        data={transformSegmentedControlOptions([
          {
            icon: IconSun,
            text: t("generalColorScheme_light"),
            value: "light",
          },
          {
            icon: IconBolt,
            text: t("generalColorScheme_auto"),
            value: "auto",
          },
          {
            icon: IconMoon,
            text: t("generalColorScheme_dark"),
            value: "dark",
          },
        ])}
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
