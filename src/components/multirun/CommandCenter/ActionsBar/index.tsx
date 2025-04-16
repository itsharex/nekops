import { Button, Flex } from "@mantine/core";
import { memo } from "react";
import { IconSend } from "@tabler/icons-react";
import SpecialChars from "./SpecialChars.tsx";
import AdditionalOptions from "./AdditionalOptions.tsx";

interface ActionBarProps {
  appendCode: (input: string) => void;
  isAddAdditionalEnterEnabled: boolean;
  setIsAddAdditionalEnterEnabled: (state: boolean) => void;
  isClearCommandInputEnabled: boolean;
  setIsClearCommandInputEnabled: (state: boolean) => void;
  sendCommand: () => void;
  isSendDisabled: boolean;
}
const ActionsBar = ({
  appendCode,
  isAddAdditionalEnterEnabled,
  setIsAddAdditionalEnterEnabled,
  isClearCommandInputEnabled,
  setIsClearCommandInputEnabled,
  sendCommand,
  isSendDisabled,
}: ActionBarProps) => (
  <Flex direction="row" w="100%" gap="md" align="center">
    {/*Special chars*/}
    <SpecialChars appendCode={appendCode} />

    {/*Additional options*/}
    <AdditionalOptions
      isAddAdditionalEnterEnabled={isAddAdditionalEnterEnabled}
      setIsAddAdditionalEnterEnabled={setIsAddAdditionalEnterEnabled}
      isClearCommandInputEnabled={isClearCommandInputEnabled}
      setIsClearCommandInputEnabled={setIsClearCommandInputEnabled}
    />

    {/*Send*/}
    <Button
      fullWidth
      leftSection={<IconSend size={16} />}
      onClick={sendCommand}
      disabled={isSendDisabled}
    >
      Send
    </Button>
  </Flex>
);

export default memo(ActionsBar);
