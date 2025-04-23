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

export type ShellSettings = {
  background_color: string;
  background_image: string;
  foreground_color: string;
  font_family: string;
  font_size: number;
};
