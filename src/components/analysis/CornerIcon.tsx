import type { ReactNode } from "react";
import { Box, rem } from "@mantine/core";

interface CornerIconProps {
  icon: (props: any) => ReactNode;
}
const CornerIcon = ({ icon: Icon }: CornerIconProps) => (
  <>
    <Box
      bg="#62b6e7"
      style={{
        height: rem(16 * 16),
        width: rem(16 * 16),
        borderRadius: rem(16 * 16),
        justifyContent: "center",
        position: "absolute",
        right: rem(-6.5 * 16),
        top: rem(-6.5 * 16),
      }}
    />
    <Icon
      color="white"
      opacity="30%"
      style={{
        width: rem(6 * 16),
        height: rem(6 * 16),
        position: "absolute",
        top: rem(0.5 * 16),
        right: rem(0.5 * 16),
      }}
    />
  </>
);

export default CornerIcon;
