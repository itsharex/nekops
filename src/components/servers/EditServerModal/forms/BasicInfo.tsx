import type { InputFormProps } from "../inputFormProps.ts";
import {
  ColorInput,
  Fieldset,
  Grid,
  TagsInput,
  Textarea,
  TextInput,
  useMantineTheme,
} from "@mantine/core";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import type { RootState } from "@/store.ts";
import { useMemo } from "react";

interface BasicInfoFormProps extends InputFormProps {}
const BasicInfoForm = ({ form }: BasicInfoFormProps) => {
  const { t } = useTranslation("main", { keyPrefix: "editServerModal" });

  const servers = useSelector((state: RootState) => state.servers);

  const knownTags = useMemo(
    () => [...new Set(servers.map((s) => s.tags).flat())],
    [servers],
  );

  const theme = useMantineTheme();

  return (
    <Fieldset legend={t("sectionBasicInfo")}>
      <Grid>
        <Grid.Col span={4}>
          <TextInput
            required
            withAsterisk
            label={t("basicIDLabel")}
            placeholder={t("basicIDPlaceholder")}
            data-autofocus
            {...form.getInputProps("id")}
          />
        </Grid.Col>
        <Grid.Col span={8}>
          <TextInput
            label={t("basicNameLabel")}
            placeholder={t("basicNamePlaceholder")}
            {...form.getInputProps("name")}
          />
        </Grid.Col>
      </Grid>
      <Grid mt="md">
        <Grid.Col span={4}>
          <ColorInput
            label={t("basicColorLabel")}
            swatches={[
              theme.colors.dark[6],
              theme.colors.gray[6],
              theme.colors.red[6],
              theme.colors.pink[6],
              theme.colors.grape[6],
              theme.colors.violet[6],
              theme.colors.indigo[6],
              theme.colors.blue[6],
              theme.colors.cyan[6],
              theme.colors.teal[6],
              theme.colors.green[6],
              theme.colors.lime[6],
              theme.colors.yellow[6],
              theme.colors.orange[6],
            ]}
            {...form.getInputProps("color")}
          />
        </Grid.Col>
        <Grid.Col span={8}>
          <TagsInput
            label={t("basicTagsLabel")}
            clearable
            data={knownTags}
            {...form.getInputProps("tags")}
          />
        </Grid.Col>
      </Grid>
      <Textarea
        mt="md"
        label={t("basicCommentLabel")}
        autosize
        minRows={6}
        placeholder={t("basicCommentPlaceholder")}
        {...form.getInputProps("comment")}
      />
    </Fieldset>
  );
};

export default BasicInfoForm;
