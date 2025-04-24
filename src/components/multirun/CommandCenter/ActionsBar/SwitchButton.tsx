import { ActionIcon, Box, MantineColor, Text, Tooltip } from "@mantine/core";
import { memo, ReactNode } from "react";
import { useTranslation } from "react-i18next";

import { actionIconStyle } from "@/common/actionStyles.ts";

interface SwitchButtonProps {
  isEnabled: boolean;
  setIsEnabled: (isEnabled: boolean) => void;
  description: ReactNode;
  color: MantineColor;
  icon: (props: any) => ReactNode;
}
const SwitchButton = ({
  isEnabled,
  setIsEnabled,
  description,
  color,
  icon: Icon,
}: SwitchButtonProps) => {
  const { t } = useTranslation("main", { keyPrefix: "common" });

  return (
    <Tooltip
      label={
        <Box
          style={{
            textAlign: "center",
          }}
        >
          <Text size="sm">{description}</Text>
          <Text fw={700} fs="italic">
            ({isEnabled ? t("enabled") : t("disabled")})
          </Text>
        </Box>
      }
    >
      <ActionIcon
        color={color}
        variant={isEnabled ? "filled" : "light"}
        onClick={() => setIsEnabled(!isEnabled)}
      >
        <Icon style={actionIconStyle} />
      </ActionIcon>
    </Tooltip>
  );
};

export default memo(SwitchButton);
