import type { ShellGridTabLocation, ShellGridTabNonce } from "@/types/shell.ts";
import type { ShellSingleServer } from "@/events/payload.ts";

export const fallbackActive = (
  pos: ShellGridTabLocation,
  tabsGridLocation: ShellGridTabLocation[],
  tabsData: ShellSingleServer[],
  setActiveTab: (payload: ShellGridTabNonce) => void,
) => {
  const tabsInSameGrid = tabsGridLocation
    .map((v, origIndex) => ({
      ...v,
      origIndex,
    }))
    .filter(
      (v) => v.row === pos.row && v.col === pos.col && v.order !== pos.order,
    );
  // console.log("fallbackActive", pos, tabsInSameGrid);
  if (tabsInSameGrid.length > pos.order + 1) {
    // Still has tab on right
    const nextOrderTab = tabsInSameGrid.find((v) => v.order === pos.order + 1);
    if (nextOrderTab) {
      setActiveTab({
        row: pos.row,
        col: pos.col,
        nonce: tabsData[nextOrderTab.origIndex].nonce,
      });
    }
  } else if (tabsInSameGrid.length > 0) {
    // Still have tab
    tabsInSameGrid.sort((a, b) => b.order - a.order); // DESC
    setActiveTab({
      row: pos.row,
      col: pos.col,
      nonce: tabsData[tabsInSameGrid[0].origIndex].nonce,
    });
  } else {
    // No remain tabs
    setActiveTab({
      row: pos.row,
      col: pos.col,
      nonce: null,
    });
  }
};
