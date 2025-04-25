import type { NoVncCredentials } from "@novnc/novnc/lib/rfb";
import { useForm } from "@mantine/form";
import { Button, PasswordInput, TextInput } from "@mantine/core";
import { useTranslation } from "react-i18next";

interface VNCCredentialsFormProps {
  requiredProps: (keyof NoVncCredentials)[];
  initialValues: Partial<NoVncCredentials>; // This is a type error, as fields should be optional
  submitAction: (credentials: Partial<NoVncCredentials>) => void;
}
const VNCCredentialsForm = ({
  requiredProps,
  initialValues,
  submitAction,
}: VNCCredentialsFormProps) => {
  const { t } = useTranslation("rescue", { keyPrefix: "vncCredentials" });

  const form = useForm<Partial<NoVncCredentials>>({
    mode: "uncontrolled",
    initialValues,
  });

  return (
    <form onSubmit={form.onSubmit(submitAction)}>
      {requiredProps.includes("username") && (
        <TextInput
          name="username"
          label={t("usernameLabel")}
          {...form.getInputProps("username")}
        />
      )}
      {requiredProps.includes("password") && (
        <PasswordInput
          name="password"
          label={t("passwordLabel")}
          {...form.getInputProps("password")}
        />
      )}
      {requiredProps.includes("target") && (
        <TextInput
          name="target"
          label={t("targetLabel")}
          {...form.getInputProps("target")}
        />
      )}
      <Button fullWidth type="submit">
        {t("submit")}
      </Button>
    </form>
  );
};

export default VNCCredentialsForm;
