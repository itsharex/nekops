import { Flex, ScrollArea } from "@mantine/core";
import SnippetsTable from "./SnippetsTable";
import CodeHighlightEditor from "@/components/CodeHighlightEditor";
import { getHotkeyHandler } from "@mantine/hooks";
import ActionsBar from "./ActionsBar";
import { memo, useState } from "react";
import { SpecialCharsMapping } from "./specialCharsMapping.ts";

interface CommandCenterProps {
  isSendDisabled: boolean;
  sendCommand: (command: string) => void;
}
const CommandCenter = ({ isSendDisabled, sendCommand }: CommandCenterProps) => {
  const [command, setCommand] = useState("");

  const appendCode = (input: string) => {
    setCommand(command + input);
  };

  const send = () => {
    if (!isSendDisabled && command) {
      let rawCommand = command;
      // Replace commands
      for (const m of SpecialCharsMapping) {
        rawCommand = rawCommand.replaceAll(m.key, m.value);
      }
      // Add additional enter key
      if (isAddAdditionalEnterEnabled && !rawCommand.endsWith("\r")) {
        rawCommand += "\r";
      }
      sendCommand(rawCommand);
      if (isClearCommandInputEnabled) {
        setCommand("");
      }
    }
  };

  const [isAddAdditionalEnterEnabled, setIsAddAdditionalEnterEnabled] =
    useState<boolean>(true);
  const [isClearCommandInputEnabled, setIsClearCommandInputEnabled] =
    useState<boolean>(false);

  return (
    <Flex direction="column" h="100%" gap="md">
      {/*Snippets List*/}
      <ScrollArea
        h={0}
        style={{
          flexGrow: 1,
        }}
      >
        <SnippetsTable setCommand={setCommand} />
      </ScrollArea>

      {/*Code Input*/}
      <CodeHighlightEditor
        label="Command"
        value={command}
        onChange={setCommand}
        placeholder={"echo 'Hello Nekops!'"}
        onKeyDown={getHotkeyHandler([["mod+Enter", send]])}
      />

      <ActionsBar
        appendCode={appendCode}
        isAddAdditionalEnterEnabled={isAddAdditionalEnterEnabled}
        setIsAddAdditionalEnterEnabled={setIsAddAdditionalEnterEnabled}
        isClearCommandInputEnabled={isClearCommandInputEnabled}
        setIsClearCommandInputEnabled={setIsClearCommandInputEnabled}
        sendCommand={send}
        isSendDisabled={isSendDisabled}
      />
    </Flex>
  );
};

export default memo(CommandCenter);
