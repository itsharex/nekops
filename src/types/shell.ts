export type ShellClientType = "embedded" | "system";

export type GridPos = {
  row: number;
  col: number;
};

export type ShellGridLocation = GridPos & {
  order: number;
};

export type ShellGridActiveTab = GridPos & {
  nonce: string | null;
};
