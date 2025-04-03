import { ActionIconGroup } from "@mantine/core";
import { memo } from "react";
import { IconInputCheck, IconTrash } from "@tabler/icons-react";
import SwitchButton from "./SwitchButton.tsx";

interface AdditionalOptionsProps {
  isAddAdditionalEnterEnabled: boolean;
  setIsAddAdditionalEnterEnabled: (state: boolean) => void;
  isClearCommandInputEnabled: boolean;
  setIsClearCommandInputEnabled: (state: boolean) => void;
}
const AdditionalOptions = ({
  isAddAdditionalEnterEnabled,
  setIsAddAdditionalEnterEnabled,
  isClearCommandInputEnabled,
  setIsClearCommandInputEnabled,
}: AdditionalOptionsProps) => (
  <ActionIconGroup>
    {/*Add additional enter*/}
    <SwitchButton
      isEnabled={isAddAdditionalEnterEnabled}
      setIsEnabled={setIsAddAdditionalEnterEnabled}
      description={
        <>
          Add additional enter to <br />
          the end of command (if not present)
        </>
      }
      color={"yellow"}
      icon={IconInputCheck}
    />

    {/*Clear command input after send*/}
    <SwitchButton
      isEnabled={isClearCommandInputEnabled}
      setIsEnabled={setIsClearCommandInputEnabled}
      description={<>Clear command input after send</>}
      color={"red"}
      icon={IconTrash}
    />
  </ActionIconGroup>
);

export default memo(AdditionalOptions);
