export type ShellClientType = "embedded" | "system";

export type ShellGridPos = {
  row: number;
  col: number;
};

export type ShellGridLocation = ShellGridPos & {
  order: number;
};

export type ShellGridActiveTab = ShellGridPos & {
  nonce: string | null;
};
