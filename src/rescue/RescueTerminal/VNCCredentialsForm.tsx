import type { NoVncCredentials } from "@novnc/novnc/lib/rfb";
import { useForm } from "@mantine/form";
import { Button, PasswordInput, TextInput } from "@mantine/core";

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
  const form = useForm<Partial<NoVncCredentials>>({
    mode: "uncontrolled",
    initialValues,
  });

  return (
    <form onSubmit={form.onSubmit(submitAction)}>
      {requiredProps.includes("username") && (
        <TextInput
          name="username"
          label="Username"
          {...form.getInputProps("username")}
        />
      )}
      {requiredProps.includes("password") && (
        <PasswordInput
          name="password"
          label="Password"
          {...form.getInputProps("password")}
        />
      )}
      {requiredProps.includes("target") && (
        <TextInput
          name="target"
          label="Target"
          {...form.getInputProps("target")}
        />
      )}
      <Button fullWidth type="submit">
        Submit
      </Button>
    </form>
  );
};

export default VNCCredentialsForm;
