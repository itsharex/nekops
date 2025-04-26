import { Flex, Image, rem, Title } from "@mantine/core";
import { convertFileSrc } from "@tauri-apps/api/core";

interface WindowBackgroundProps {
  storageKey?: string;
}
const WindowBackground = ({ storageKey }: WindowBackgroundProps) => {
  const backgroundImage = storageKey ? localStorage.getItem(storageKey) : null;

  return (
    <Flex
      w="100%"
      h="100%"
      pos="fixed"
      justify="center"
      align="center"
      style={{
        zIndex: -1,
        pointerEvents: "none",
        userSelect: "none",
        overflow: "hidden",
      }}
    >
      {backgroundImage ? (
        <Image
          src={convertFileSrc(backgroundImage)}
          pos="absolute"
          top={0}
          left={0}
          w="100%"
          h="100%"
          fit="cover"
        />
      ) : (
        <Flex gap="xl" align="center" opacity="20%">
          <Image
            src="/icon.png"
            alt="Nekops"
            w={rem(256)}
            h={rem(256)}
            radius={rem(256)}
          />
          <Title fz={rem(128)}>Nekops</Title>
        </Flex>
      )}
    </Flex>
  );
};

export default WindowBackground;
