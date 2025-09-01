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
import { DatePickerInput, DatesProvider } from "@mantine/dates";
import { useSelector } from "react-redux";
import { useMemo, useState } from "react";

import "dayjs/locale/en.js";
import "dayjs/locale/zh-cn.js";

import type { InputFormProps } from "../inputFormProps.ts";
import { StartSinceValueFormat } from "../constants.tsx";

import type { RootState } from "@/store.ts";

interface ProductFormProps extends InputFormProps {}
const ProductForm = ({ form }: ProductFormProps) => {
  const { t, i18n } = useTranslation("main", { keyPrefix: "editServerModal" });

  const servers = useSelector((state: RootState) => state.servers);

  const knownProviders = useMemo(
    () => [...new Set(servers.map((s) => s.provider.name).filter(Boolean))],
    [servers],
  );
  const knownRegions = useMemo(
    () => [...new Set(servers.map((s) => s.location.region).filter(Boolean))],
    [servers],
  );

  const [knownDatacenters, setKnownDatacenters] = useState<string[]>([]);
  const updateKnownDatacenters = () => {
    if (form.values.provider.name && form.values.location.region) {
      setKnownDatacenters([
        ...new Set(
          servers
            .filter(
              (s) =>
                s.provider.name === form.values.provider.name &&
                s.location.region === form.values.location.region,
            )
            .map((s) => s.location.datacenter),
        ),
      ]);
    } else {
      setKnownDatacenters([]); // Clear
    }
  };

  const checkExistingGeolocation = () => {
    // Check status
    if (
      form.values.provider.name &&
      form.values.location.region &&
      form.values.location.datacenter &&
      !form.values.location.latitude &&
      !form.values.location.longitude
    ) {
      const matchGeolocation = servers.find(
        (s) =>
          s.provider.name === form.values.provider.name &&
          s.location.region === form.values.location.region &&
          s.location.datacenter === form.values.location.datacenter &&
          s.location.latitude &&
          s.location.longitude,
      );
      if (matchGeolocation) {
        form.setFieldValue(
          "location.latitude",
          matchGeolocation.location.latitude,
        );
        form.setFieldValue(
          "location.longitude",
          matchGeolocation.location.longitude,
        );
      }
    }
  };

  return (
    <>
      <Fieldset legend={t("productProvider")}>
        <Grid>
          <Grid.Col span={8}>
            <Autocomplete
              label={t("productProviderLabel")}
              placeholder={t("productProviderPlaceholder")}
              data={knownProviders}
              {...form.getInputProps("provider.name")}
            />
          </Grid.Col>
          <Grid.Col span={4}>
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
              <DatesProvider
                settings={{
                  locale: i18n.language === "zh-CN" ? "zh-cn" : "en",
                }}
              >
                <DatePickerInput
                  label={t("productStartSinceLabel")}
                  valueFormat={StartSinceValueFormat}
                  {...form.getInputProps("provider.start_since")}
                  style={{
                    flexGrow: 1,
                  }}
                />
              </DatesProvider>
            </Flex>
          </Grid.Col>
        </Grid>
        <Grid>
          <Grid.Col span={8}>
            <TextInput
              label={t("productProductLabel")}
              style={{
                flexGrow: 1,
              }}
              {...form.getInputProps("provider.product")}
            />
          </Grid.Col>
          <Grid.Col span={4}>
            <Flex gap="md">
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
              <Flex direction="column" justify="end">
                <Text size="sm" fw={500} mb={1}>
                  {t("productPaidAnnuallyLabel")}
                </Text>
                <Checkbox
                  size="xl"
                  {...form.getInputProps("provider.paid_annually", {
                    type: "checkbox",
                  })}
                />
              </Flex>
            </Flex>
          </Grid.Col>
        </Grid>
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
            <Autocomplete
              label={t("productLocationDatacenterLabel")}
              placeholder={t("productLocationDatacenterPlaceholder")}
              data={knownDatacenters}
              {...form.getInputProps("location.datacenter")}
              onFocus={updateKnownDatacenters}
              onBlur={checkExistingGeolocation}
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <TextInput
              label={t("productLocationHostSystemLabel")}
              {...form.getInputProps("location.host_system")}
            />
          </Grid.Col>
        </Grid>
        <Grid>
          <Grid.Col span={3}>
            <NumberInput
              label={t("productLocationLatitudeLabel")}
              min={-90}
              max={90}
              {...form.getInputProps("location.latitude")}
            />
          </Grid.Col>
          <Grid.Col span={3}>
            <NumberInput
              label={t("productLocationLongitudeLabel")}
              min={-180}
              max={180}
              {...form.getInputProps("location.longitude")}
            />
          </Grid.Col>
        </Grid>
      </Fieldset>
    </>
  );
};

export default ProductForm;
