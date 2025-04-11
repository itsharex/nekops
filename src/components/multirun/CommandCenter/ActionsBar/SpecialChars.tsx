import { HoverCard, ThemeIcon } from "@mantine/core";
import { IconWand } from "@tabler/icons-react";
import { memo } from "react";

import { actionIconStyle } from "@/common/actionStyles.ts";

import SpecialCharsTable from "./SpecialCharsTable.tsx";

interface SpecialCharsProps {
  appendCode: (input: string) => void;
}
const SpecialChars = ({ appendCode }: SpecialCharsProps) => (
  <HoverCard position="left-end" withArrow arrowPosition="center">
    <HoverCard.Target>
      <ThemeIcon>
        <IconWand style={actionIconStyle} />
      </ThemeIcon>
    </HoverCard.Target>
    <HoverCard.Dropdown>
      <SpecialCharsTable append={appendCode} />
    </HoverCard.Dropdown>
  </HoverCard>
);

export default memo(SpecialChars);
