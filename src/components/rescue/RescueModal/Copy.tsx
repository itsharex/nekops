import { Flex } from "@mantine/core";

import CopyButton from "@/components/CopyButton.tsx";

interface CopyProps {
  value?: string;
}
const Copy = ({ value }: CopyProps) => (
  <Flex
    style={{
      alignSelf: "end",
    }}
  >
    <CopyButton value={value || ""} />
  </Flex>
);

export default Copy;
