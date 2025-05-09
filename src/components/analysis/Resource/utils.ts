export const showDiskSize = (sizeTB: number) =>
  sizeTB > 1 ? `${sizeTB.toFixed(3)}TB` : `${(sizeTB * 1000).toFixed(0)}GB`;
