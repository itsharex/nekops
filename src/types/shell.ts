export type ShellClientType = "embedded" | "system";

export type ShellGridBase = {
  row: number;
  col: number;
};

export type ShellGridTabLocation = ShellGridBase & {
  order: number;
};

export type ShellGridTabNonce = ShellGridBase & {
  nonce: string | null;
};
