import { IconSearch } from "@tabler/icons-react";
import { CloseButton, FocusTrap, Loader, TextInput } from "@mantine/core";
import { useState } from "react";
import { useDebouncedCallback } from "@mantine/hooks";
import { useField } from "@mantine/form";

interface SearchBarProps {
  placeholder: string;
  setSearchInput: (state: string) => void;
  isAutoFocus?: boolean;
}
const SearchBar = ({
  placeholder,
  setSearchInput,
  isAutoFocus = true,
}: SearchBarProps) => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const debouncedSetSearchInput = useDebouncedCallback((state: string) => {
    setSearchInput(state);
    setIsSubmitted(true);
  }, 500);

  const inputField = useField({
    // mode: "uncontrolled",
    initialValue: "",
    onValueChange: (state: string) => {
      setIsSubmitted(false);
      debouncedSetSearchInput(state);
    },
  });

  return (
    <FocusTrap active={isAutoFocus}>
      <TextInput
        {...inputField.getInputProps()}
        leftSection={<IconSearch size={18} />}
        rightSection={
          inputField.isDirty() &&
          (!isSubmitted ? (
            <Loader size="xs" />
          ) : (
            <CloseButton onClick={inputField.reset} />
          ))
        }
        placeholder={placeholder}
        style={{
          flexGrow: 1,
        }}
      />
    </FocusTrap>
  );
};

export default SearchBar;
