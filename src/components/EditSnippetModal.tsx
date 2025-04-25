import { Button, Code, Modal, TagsInput, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";

import { defaultSnippet, type Snippet } from "@/types/snippet.ts";
import CodeHighlightEditor from "@/components/CodeHighlightEditor";

interface EditSnippetModalProps {
  isOpen: boolean;
  close: () => void;
  snippetInfo?: Snippet | null;
  save: (info: Snippet) => boolean;
}
const EditSnippetModal = ({
  isOpen,
  close,
  snippetInfo,
  save,
}: EditSnippetModalProps) => {
  const { t } = useTranslation("main", { keyPrefix: "editSnippet" });

  const form = useForm<Snippet>({
    initialValues: defaultSnippet,
  });
  const saveSnippet = (snippetInfo: Snippet) => {
    if (save(snippetInfo)) {
      close();
    }
  };

  useEffect(() => {
    if (isOpen) {
      if (!!snippetInfo) {
        form.setInitialValues(structuredClone(snippetInfo));
      } else {
        form.setInitialValues(defaultSnippet);
      }
      form.reset();
    }
  }, [isOpen]);

  return (
    <Modal
      title={
        snippetInfo ? (
          <>
            {t("modalTitleEdit")}
            <Code>{snippetInfo.name}</Code>
          </>
        ) : (
          t("modalTitleCreate")
        )
      }
      opened={isOpen}
      onClose={close}
      size="lg"
    >
      <form onSubmit={form.onSubmit(saveSnippet)}>
        <TextInput
          label={t("nameLabel")}
          required
          withAsterisk
          data-autofocus
          {...form.getInputProps("name")}
        />

        <TagsInput
          label={t("tagsLabel")}
          clearable
          {...form.getInputProps("tags")}
        />

        <CodeHighlightEditor
          value={form.getInputProps("code").value}
          onChange={form.getInputProps("code").onChange}
        />

        <Button mt="lg" type="submit">
          {t("buttonSave")}
        </Button>
      </form>
    </Modal>
  );
};

export default EditSnippetModal;
