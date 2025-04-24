type SpecialCharsInfo = {
  key: string;
  value: string;
  description: string;
};
export const SpecialCharsMapping: SpecialCharsInfo[] = [
  {
    key: "\\r",
    value: "\r",
    description: "specialCharDescription_newline",
  },
  {
    key: "#[Ctrl+C]",
    value: "\u0003",
    description: "specialCharDescription_ctrlC",
  },
  {
    key: "#[Ctrl+D]",
    value: "\u0004",
    description: "specialCharDescription_ctrlD",
  },
  /* Not working for dummy, not sure why
  {
    key: "#[BS]",
    value: "\u0008",
    description: "specialCharDescription_backspace",
  },
  */
  {
    key: "#[DEL]",
    value: "\u007F",
    description: "specialCharDescription_del",
  },
];
