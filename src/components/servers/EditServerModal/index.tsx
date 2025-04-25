import {
  ActionIcon,
  Button,
  Center,
  Code,
  Flex,
  Group,
  Modal,
  Stepper,
  Title,
} from "@mantine/core";
import type { Server } from "@/types/server.ts";
import { useEffect, useState } from "react";
import { useForm } from "@mantine/form";
import {
  IconBuildingStore,
  IconCheck,
  IconChevronLeft,
  IconChevronRight,
  IconCircleCheck,
  IconCpu,
  IconKey,
  IconNetwork,
  IconServerBolt,
} from "@tabler/icons-react";
import { useTranslation } from "react-i18next";

import stepperClasses from "./stepper.module.css";
import BasicInfoForm from "./forms/BasicInfo.tsx";
import ProductForm from "./forms/Product.tsx";
import HardwareForm from "./forms/Hardware.tsx";
import NetworksForm from "./forms/Networks.tsx";
import AccessForm from "./forms/Access.tsx";
import ServerCard from "@/components/ServerCard";
import { i18nDefaultServer } from "@/components/servers/EditServerModal/helpers.ts";

const serverIDRegexp = /^\w+([-.]\w+)*$/;

interface EditServerModalProps {
  isOpen: boolean;
  close: () => void;
  serverInfo?: Server | null;
  save: (info: Server) => boolean;
  knownTags: string[];
  knownProviders: string[];
  knownRegions: string[];
  knownSSHUsers: string[];
}
const EditServerModal = ({
  isOpen,
  close,
  serverInfo,
  save,
  knownTags,
  knownProviders,
  knownRegions,
  knownSSHUsers,
}: EditServerModalProps) => {
  const { t } = useTranslation("main", { keyPrefix: "editServerModal" });

  const StepsCount = 5;

  const [activeStep, setActiveStep] = useState(0);
  const nextStep = () =>
    setActiveStep((current) => (current < StepsCount ? current + 1 : current));
  const prevStep = () =>
    setActiveStep((current) => (current > 0 ? current - 1 : current));

  const defaultServer = i18nDefaultServer();

  const form = useForm<Server>({
    // mode: "uncontrolled",

    initialValues: defaultServer,

    validate: {
      id: (value) => !serverIDRegexp.test(value),
    },

    validateInputOnBlur: true,
  });

  const saveServer = (serverProps: Server) => {
    if (save(serverProps)) {
      close();
    }
  };

  useEffect(() => {
    if (isOpen) {
      if (!serverInfo) {
        form.setInitialValues(defaultServer);
      } else {
        form.setInitialValues(structuredClone(serverInfo));
      }
      form.reset();
      setActiveStep(0);
    }
  }, [isOpen]);

  return (
    <Modal.Root
      opened={isOpen}
      onClose={close}
      fullScreen
      radius={0}
      transitionProps={{ transition: "fade", duration: 200 }}
    >
      {/*<Modal.Overlay />*/}
      <Modal.Content
        w="100%"
        display="flex"
        style={{
          flexDirection: "column",
        }}
      >
        <Modal.Header>
          <Title order={1} size="h3">
            {serverInfo ? (
              <>
                {t("titleEdit")}
                <Code ml="xs">{serverInfo.name}</Code>
              </>
            ) : (
              t("titleCreate")
            )}
          </Title>
          <Modal.CloseButton />
        </Modal.Header>
        <Modal.Body h="100%">
          <form
            style={{
              display: "flex",
              flexDirection: "column",
              height: "100%",
            }}
            onSubmit={form.onSubmit(saveServer)}
          >
            <Stepper
              active={activeStep}
              onStepClick={setActiveStep}
              completedIcon={<IconCircleCheck />}
              style={{
                flexGrow: 1,
                height: 0,
              }}
              classNames={{
                steps: stepperClasses.steps,
                content: stepperClasses.content,
              }}
            >
              <Stepper.Step
                label={t("sectionBasicInfo")}
                icon={<IconServerBolt />}
              >
                <BasicInfoForm form={form} knownTags={knownTags} />
              </Stepper.Step>
              <Stepper.Step
                label={t("sectionProduct")}
                icon={<IconBuildingStore />}
              >
                <ProductForm
                  form={form}
                  knownProviders={knownProviders}
                  knownRegions={knownRegions}
                />
              </Stepper.Step>
              <Stepper.Step label={t("sectionHardware")} icon={<IconCpu />}>
                <HardwareForm form={form} />
              </Stepper.Step>
              <Stepper.Step label={t("sectionNetworks")} icon={<IconNetwork />}>
                <NetworksForm form={form} />
              </Stepper.Step>
              <Stepper.Step label={t("sectionAccess")} icon={<IconKey />}>
                <AccessForm
                  form={form}
                  knownSSHUsers={knownSSHUsers}
                  isCreatingNew={!serverInfo}
                />
              </Stepper.Step>
              <Stepper.Completed>
                <Flex direction="column" gap="md">
                  <ServerCard server={form.values} />
                  <Center>
                    <Button type="submit">{t("buttonSave")}</Button>
                  </Center>
                </Flex>
              </Stepper.Completed>
            </Stepper>

            <Group justify="center" mt="xl" pt="lg">
              <ActionIcon.Group>
                <ActionIcon
                  size="lg"
                  radius="lg"
                  aria-label={t("buttonBack")}
                  onClick={prevStep}
                  disabled={activeStep === 0}
                >
                  <IconChevronLeft />
                </ActionIcon>
                <ActionIcon
                  size="lg"
                  radius="lg"
                  aria-label={t("buttonNext")}
                  onClick={nextStep}
                  disabled={activeStep >= StepsCount}
                >
                  <IconChevronRight />
                </ActionIcon>
              </ActionIcon.Group>
              <ActionIcon
                size="lg"
                radius="lg"
                aria-label={t("buttonFinish")}
                onClick={() => setActiveStep(StepsCount)}
                loading={activeStep >= StepsCount}
              >
                <IconCheck />
              </ActionIcon>
            </Group>
          </form>
        </Modal.Body>
      </Modal.Content>
    </Modal.Root>
  );
};

export default EditServerModal;
