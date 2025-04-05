export const actionIconStyle = { width: "70%", height: "70%" };

export const menuIconStyle = { width: ".8rem", height: ".8rem" };

export const actionRowStyle = (actionButtonsCount: number = 3) => ({
  width: `calc(${actionButtonsCount * 3}rem * var(--mantine-scale))`,
});
