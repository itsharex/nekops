import {
  Accordion,
  Autocomplete,
  Button,
  Center,
  Checkbox,
  Fieldset,
  Flex,
  Grid,
  Group,
  NumberInput,
  SegmentedControl,
  Text,
  TextInput,
} from "@mantine/core";
import { IconPlus, IconX } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";

import type { InputFormProps } from "../inputFormProps.ts";
import { Disk } from "@/types/server.ts";
import HDDIcon from "@/assets/icons/hdd.svg";
import SSDIcon from "@/assets/icons/ssd.svg";
import DeleteItemButton from "@/components/DeleteItemButton.tsx";
import { i18nDefaultDisk } from "@/components/servers/EditServerModal/helpers.ts";

interface DiskItemProps extends InputFormProps {
  disk: Disk;
  index: number;
}
const DiskItem = ({ disk, index, form }: DiskItemProps) => {
  const { t } = useTranslation("main", { keyPrefix: "editServerModal" });

  const itemName =
    `${t("hardwareDisk")} ${index + 1}: ` +
    (disk.count > 1 ? `${disk.count} × ` : "") +
    `${disk.size} ${disk.size_unit} ${disk.type} (${disk.interface})`;
  return (
    <Accordion.Item value={`disk_${index}`}>
      <Center>
        <Accordion.Control
          icon={
            <img
              src={
                disk.type === "HDD"
                  ? HDDIcon
                  : disk.type === "SSD"
                    ? SSDIcon
                    : undefined
              }
              alt={disk.type}
              height={16}
              width={16}
            />
          }
        >
          {itemName}
        </Accordion.Control>
        <DeleteItemButton
          size={"lg"}
          variant={"subtle"}
          itemName={itemName}
          onClick={() => form.removeListItem("hardware.disk", index)}
        />
      </Center>
      <Accordion.Panel>
        <Grid grow>
          <Grid.Col span={2}>
            <NumberInput
              label={t("hardwareDiskCountLabel")}
              allowNegative={false}
              allowDecimal={false}
              allowLeadingZeros={false}
              rightSection={<IconX size={16} />}
              min={1}
              {...form.getInputProps(`hardware.disk.${index}.count`)}
            />
          </Grid.Col>
          <Grid.Col span={7}>
            <Group grow gap="md">
              <Flex direction="column">
                <Text size="sm" fw={500} mb={2}>
                  {t("hardwareDiskTypeLabel")}
                </Text>
                <SegmentedControl
                  data={["HDD", "SSD"]}
                  {...form.getInputProps(`hardware.disk.${index}.type`)}
                />
              </Flex>
              <Flex direction="column">
                <Text size="sm" fw={500} mb={2}>
                  {t("hardwareDiskInterfaceLabel")}
                </Text>
                <SegmentedControl
                  data={["SATA", "SAS", "NVMe"]}
                  {...form.getInputProps(`hardware.disk.${index}.interface`)}
                />
              </Flex>
            </Group>
          </Grid.Col>
          <Grid.Col span={3}>
            <Flex gap="sm">
              <NumberInput
                label={t("hardwareDiskSizeLabel")}
                allowNegative={false}
                decimalScale={2}
                allowLeadingZeros={false}
                {...form.getInputProps(`hardware.disk.${index}.size`)}
              />
              <Flex direction="column">
                <Text size="sm" fw={500} mb={2}>
                  {t("hardwareDiskSizeUnitLabel")}
                </Text>
                <SegmentedControl
                  data={["GB", "TB"]}
                  {...form.getInputProps(`hardware.disk.${index}.size_unit`)}
                />
              </Flex>
            </Flex>
          </Grid.Col>
        </Grid>
        <TextInput
          mt="md"
          label={t("hardwareDiskModelLabel")}
          {...form.getInputProps(`hardware.disk.${index}.model`)}
        />
      </Accordion.Panel>
    </Accordion.Item>
  );
};

const HardwareForm = ({ form }: InputFormProps) => {
  const { t } = useTranslation("main", { keyPrefix: "editServerModal" });
  const defaultDisk = i18nDefaultDisk(t);

  return (
    <>
      <Fieldset legend={t("hardwareCPU")}>
        <Grid grow>
          <Grid.Col span={1}>
            <NumberInput
              label={t("hardwareCPUCountLabel")}
              allowNegative={false}
              allowDecimal={false}
              allowLeadingZeros={false}
              min={1}
              rightSection={<IconX size={16} />}
              {...form.getInputProps("hardware.cpu.count")}
            />
          </Grid.Col>
          <Grid.Col span={2}>
            <Autocomplete
              label={t("hardwareCPUManufacturerLabel")}
              data={["Intel", "AMD"]}
              {...form.getInputProps("hardware.cpu.manufacturer")}
            />
          </Grid.Col>
          <Grid.Col span={9}>
            <TextInput
              label={t("hardwareCPUModelLabel")}
              {...form.getInputProps("hardware.cpu.model")}
            />
          </Grid.Col>
        </Grid>
        <Grid mt="md" grow>
          <Grid.Col span={4}>
            <NumberInput
              label={t("hardwareCPUCoresLabel")}
              allowNegative={false}
              allowDecimal={false}
              allowLeadingZeros={false}
              min={1}
              {...form.getInputProps("hardware.cpu.core_count")}
            />
          </Grid.Col>
          <Grid.Col span={4}>
            <NumberInput
              label={t("hardwareCPUThreadsLabel")}
              allowNegative={false}
              allowDecimal={false}
              allowLeadingZeros={false}
              min={1}
              {...form.getInputProps("hardware.cpu.thread_count")}
            />
          </Grid.Col>
          <Grid.Col span={4}>
            <NumberInput
              label={t("hardwareCPUBaseFrequencyLabel")}
              allowNegative={false}
              decimalScale={1}
              allowLeadingZeros={false}
              suffix="GHz"
              {...form.getInputProps("hardware.cpu.base_frequency")}
            />
          </Grid.Col>
        </Grid>
      </Fieldset>
      <Fieldset mt="md" legend={t("hardwareMemory")}>
        <Grid grow>
          <Grid.Col span={4}>
            <Flex direction="row" gap="xs">
              <NumberInput
                label={t("hardwareMemoryGenerationLabel")}
                allowNegative={false}
                allowDecimal={false}
                allowLeadingZeros={false}
                prefix="DDR"
                style={{
                  flexGrow: 1,
                }}
                {...form.getInputProps("hardware.memory.generation")}
              />
              <Flex direction="column" justify="end">
                <Text size="sm" fw={500} mb={1}>
                  {t("hardwareMemoryECCLabel")}
                </Text>
                <Checkbox
                  size="xl"
                  {...form.getInputProps("hardware.memory.ecc", {
                    type: "checkbox",
                  })}
                />
              </Flex>
            </Flex>
          </Grid.Col>
          <Grid.Col span={4}>
            <NumberInput
              label={t("hardwareMemorySizeLabel")}
              allowNegative={false}
              decimalScale={2}
              allowLeadingZeros={false}
              suffix="GB"
              step={0.5}
              {...form.getInputProps("hardware.memory.size")}
            />
          </Grid.Col>
          <Grid.Col span={4}>
            <NumberInput
              label={t("hardwareMemoryFrequencyLabel")}
              allowNegative={false}
              allowDecimal={false}
              allowLeadingZeros={false}
              suffix="MHz"
              step={100}
              {...form.getInputProps("hardware.memory.frequency")}
            />
          </Grid.Col>
        </Grid>
      </Fieldset>
      <Fieldset mt="md" legend={t("hardwareDisk")}>
        <Accordion>
          {form.values.hardware.disk.map((disk: Disk, index: number) => (
            <DiskItem key={index} disk={disk} index={index} form={form} />
          ))}
        </Accordion>
        <Center mt="md">
          <Button
            leftSection={<IconPlus size={16} />}
            onClick={() => form.insertListItem("hardware.disk", defaultDisk)}
          >
            {t("buttonAdd")}
          </Button>
        </Center>
      </Fieldset>
    </>
  );
};

export default HardwareForm;
