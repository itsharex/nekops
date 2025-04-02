import { Button, Center, Group, Modal, Text } from "@mantine/core";

interface TerminateAndExitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}
const TerminateAndExitModal = ({
  isOpen,
  onClose,
  onConfirm,
}: TerminateAndExitModalProps) => {
  return (
    <Modal
      opened={isOpen}
      onClose={onClose}
      title="Terminate and Exit"
      centered
    >
      <Text>Some shells might still be running...</Text>
      <Text>Do you sure to terminate them all and exit?</Text>
      <Center mt="lg">
        <Group gap="sm">
          <Button variant="default" color="gray" onClick={onClose}>
            Cancel
          </Button>
          <Button color="red" onClick={onConfirm}>
            Terminate and Exit
          </Button>
        </Group>
      </Center>
    </Modal>
  );
};

export default TerminateAndExitModal;
