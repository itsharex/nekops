import { ActionIconGroup } from "@mantine/core";
import { memo } from "react";
import { IconInputCheck, IconTrash } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";

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
}: AdditionalOptionsProps) => {
  const { t } = useTranslation("main", { keyPrefix: "multirun" });

  return (
    <ActionIconGroup>
      {/*Add additional enter*/}
      <SwitchButton
        isEnabled={isAddAdditionalEnterEnabled}
        setIsEnabled={setIsAddAdditionalEnterEnabled}
        description={t("additionalOption_addEnter")}
        color={"yellow"}
        icon={IconInputCheck}
      />

      {/*Clear command input after send*/}
      <SwitchButton
        isEnabled={isClearCommandInputEnabled}
        setIsEnabled={setIsClearCommandInputEnabled}
        description={t("additionalOption_clearCommand")}
        color={"red"}
        icon={IconTrash}
      />
    </ActionIconGroup>
  );
};

export default memo(AdditionalOptions);
