import { useRef, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { IconKeyboard } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import { ActionIcon, Tooltip } from "@mantine/core";

interface KeyboardProps {
  text: string;
}
const Keyboard = ({ text }: KeyboardProps) => {
  const { t } = useTranslation("main", { keyPrefix: "rescue" });

  const [inputCountdown, setInputCountdown] = useState(0);

  const increaseIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null,
  );
  const releaseIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null,
  );

  const increase = () => {
    setInputCountdown(3); // Set minimal count
    if (releaseIntervalRef.current !== null) {
      clearInterval(releaseIntervalRef.current);
    }
    increaseIntervalRef.current = setInterval(() => {
      setInputCountdown((currentCount) => currentCount + 1);
    }, 1000);
  };

  const finishCountDown = () => {
    // Stop current interval
    if (releaseIntervalRef.current !== null) {
      clearInterval(releaseIntervalRef.current);
      releaseIntervalRef.current = null;
    }
    // Trigger keyboard event
    invoke("keyboard_text", {
      text,
    });
  };

  const release = () => {
    if (increaseIntervalRef.current !== null) {
      clearInterval(increaseIntervalRef.current);
    }
    releaseIntervalRef.current = setInterval(() => {
      setInputCountdown((currentCount) => {
        if (currentCount > 0) {
          return currentCount - 1;
        } else {
          finishCountDown();
          return 0;
        }
      });
    }, 1000);
  };

  return (
    <Tooltip label={t("actionKeyboardText")} openDelay={500}>
      <ActionIcon
        size="lg"
        color="yellow"
        style={{
          alignSelf: "end",
        }}
        onMouseDown={increase}
        onMouseUp={release}
      >
        {inputCountdown || <IconKeyboard />}
      </ActionIcon>
    </Tooltip>
  );
};

export default Keyboard;
