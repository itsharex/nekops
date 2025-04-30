import {
  Box,
  Group,
  Progress,
  rem,
  SimpleGrid,
  Text,
  Title,
  Tooltip,
} from "@mantine/core";

export interface SectionData {
  label: string;
  text: string;
  part: number;
  color: string;
}

interface PercentSectionProps {
  title: string;
  data: SectionData[];
}
const PercentSection = ({ title, data }: PercentSectionProps) => (
  <Box>
    <Title c="dimmed" order={3} size="h6">
      {title}
    </Title>

    <Progress.Root size={34} mt={16}>
      {data.map((segment) => (
        <Tooltip
          key={segment.label}
          label={segment.label}
          withArrow
          arrowSize={6}
        >
          <Progress.Section value={segment.part} color={segment.color} />
        </Tooltip>
      ))}
    </Progress.Root>

    <SimpleGrid
      cols={{
        base: 1,
        xs: data.length > 2 ? 2 : data.length,
        md: data.length > 4 ? 4 : data.length,
        xl: data.length > 6 ? 6 : data.length,
      }}
      mt="md"
    >
      {data.map((segment) => (
        <Box
          key={segment.label}
          pb={rem("5px")}
          style={{
            borderBottom: `${rem("3px")} solid ${segment.color}`,
          }}
        >
          <Text fz="xs" c="dimmed" fw={700}>
            {segment.label}
          </Text>

          <Group justify="space-between" align="flex-end" gap={0}>
            <Text fw={700}>{segment.text}</Text>
            <Text c={segment.color} fw={700} size="sm">
              {segment.part.toFixed(1)}%
            </Text>
          </Group>
        </Box>
      ))}
    </SimpleGrid>
  </Box>
);

export default PercentSection;
