import type { InputFormProps } from "../inputFormProps.ts";
import {
  Autocomplete,
  Checkbox,
  Fieldset,
  Flex,
  Grid,
  NumberInput,
  SegmentedControl,
  Text,
  TextInput,
} from "@mantine/core";
import { IconCurrencyDollar } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";

interface ProductFormProps extends InputFormProps {
  knownProviders: string[];
  knownRegions: string[];
}
const ProductForm = ({
  form,
  knownProviders,
  knownRegions,
}: ProductFormProps) => {
  const { t } = useTranslation("main", { keyPrefix: "editServer" });

  return (
    <>
      <Fieldset legend={t("productProvider")}>
        <Grid>
          <Grid.Col span={9}>
            <Autocomplete
              label={t("productProviderLabel")}
              placeholder={t("productProviderPlaceholder")}
              data={knownProviders}
              {...form.getInputProps("provider.name")}
            />
          </Grid.Col>
          <Grid.Col span={3}>
            <Flex gap="md">
              <Flex direction="column">
                <Text size="sm" fw={500} mb={2}>
                  {t("productTypeLabel")}
                </Text>
                <SegmentedControl
                  data={[
                    {
                      label: t("productTypeVPS"),
                      value: "VPS",
                    },
                    {
                      label: t("productTypeDS"),
                      value: "DS",
                    },
                  ]}
                  {...form.getInputProps("provider.type")}
                />
              </Flex>
              <NumberInput
                label={t("productPriceLabel")}
                leftSection={<IconCurrencyDollar />}
                decimalScale={2}
                fixedDecimalScale
                allowNegative={false}
                style={{
                  flexGrow: 1,
                }}
                {...form.getInputProps("provider.price")}
              />
            </Flex>
          </Grid.Col>
        </Grid>
        <TextInput
          mt="md"
          label={t("productProductLabel")}
          {...form.getInputProps("provider.product")}
        />
      </Fieldset>

      <Fieldset mt="lg" legend={t("productTraffic")}>
        <Grid>
          <Grid.Col span={6}>
            <Flex gap="md">
              <NumberInput
                label={t("productTrafficLimitLabel")}
                decimalScale={3}
                allowNegative={false}
                suffix="TB"
                style={{
                  flexGrow: 1,
                }}
                {...form.getInputProps("traffic.limit")}
              />
              <Flex direction="column" justify="end">
                <Text size="sm" fw={500} mb={1}>
                  {t("productTrafficDoubleRateLabel")}
                </Text>
                <Checkbox
                  size="xl"
                  {...form.getInputProps("traffic.double_rate", {
                    type: "checkbox",
                  })}
                />
              </Flex>
            </Flex>
          </Grid.Col>
          <Grid.Col span={6}>
            <NumberInput
              label={t("productTrafficBandwidthLabel")}
              allowDecimal={false}
              allowNegative={false}
              suffix="Mbps"
              style={{
                flexGrow: 1,
              }}
              step={100}
              {...form.getInputProps("traffic.bandwidth")}
            />
          </Grid.Col>
        </Grid>
      </Fieldset>

      <Fieldset mt="lg" legend={t("productLocation")}>
        <Grid>
          <Grid.Col span={2}>
            <Autocomplete
              label={t("productLocationRegionLabel")}
              placeholder={t("productLocationRegionPlaceholder")}
              data={knownRegions}
              {...form.getInputProps("location.region")}
            />
          </Grid.Col>
          <Grid.Col span={4}>
            <TextInput
              label={t("productLocationDatacenterLabel")}
              {...form.getInputProps("location.datacenter")}
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <TextInput
              label={t("productLocationHostSystemLabel")}
              {...form.getInputProps("location.host_system")}
            />
          </Grid.Col>
        </Grid>
      </Fieldset>
    </>
  );
};

export default ProductForm;
