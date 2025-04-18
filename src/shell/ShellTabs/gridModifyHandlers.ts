import type {
  ShellGridTabLocationWithDataIndex,
  ShellGridTabNonce,
} from "@/types/shell.ts";
import {
  LayoutMaxCols,
  LayoutMaxRows,
} from "@/shell/ShellTabs/layoutConfig.ts";
import type { Event } from "@tauri-apps/api/event";
import type { EventPayloadShellGridModify } from "@/events/payload.ts";
import type { UseListStateHandlers } from "@mantine/hooks";

const tidyGrid = (
  currentRows: number,
  currentCols: number,
  setGridRows: (rows: number) => void,
  setGridCols: (cols: number) => void,
  activeTabCurrent: ShellGridTabNonce[],
  activeTabHandlers: UseListStateHandlers<ShellGridTabNonce>,
  tabsGridLocationCurrent: ShellGridTabLocationWithDataIndex[],
  tabsGridLocationHandlers: UseListStateHandlers<ShellGridTabLocationWithDataIndex>,
  setCurrentActiveTab: (tab: ShellGridTabNonce) => void,
) => {
  // Tidy rows
  let rowsToShrink = 0;
  for (let i = currentRows - 1; i >= 0; i--) {
    if (!tabsGridLocationCurrent.some((v) => v.row === i)) {
      rowsToShrink++;
      tabsGridLocationHandlers.applyWhere(
        (v) => v.row > i,
        (v) => ({
          ...v,
          row: v.row - 1,
        }),
      );
    }
  }
  if (rowsToShrink === currentRows) {
    rowsToShrink--; // Keep last 1
  }

  // Tidy cols
  let colsToShrink = 0;
  for (let i = currentCols - 1; i >= 0; i--) {
    if (!tabsGridLocationCurrent.some((v) => v.col === i)) {
      colsToShrink++;
      tabsGridLocationHandlers.applyWhere(
        (v) => v.col > i,
        (v) => ({
          ...v,
          col: v.col - 1,
        }),
      );
    }
  }
  if (colsToShrink === currentCols) {
    colsToShrink--; // Keep last 1
  }

  // Check if need to shrink
  if (rowsToShrink > 0 || colsToShrink > 0) {
    // Adjust current active tabs
    const activeTabRecordsToAdjust = activeTabCurrent.filter(
      (v) =>
        (v.row >= currentRows - rowsToShrink ||
          v.col >= currentCols - colsToShrink) &&
        v.nonce !== null,
    );
    for (const record of activeTabRecordsToAdjust) {
      if (
        record.row >= currentRows - rowsToShrink &&
        record.col >= currentCols - colsToShrink
      ) {
        setCurrentActiveTab({
          row: record.row - rowsToShrink >= 0 ? record.row - rowsToShrink : 0,
          col: record.col - colsToShrink >= 0 ? record.col - colsToShrink : 0,
          nonce: record.nonce,
        });
      } else if (record.row >= currentRows - rowsToShrink) {
        setCurrentActiveTab({
          row: record.row - rowsToShrink >= 0 ? record.row - rowsToShrink : 0,
          col: record.col,
          nonce: record.nonce,
        });
      } else {
        // record.col >= currentCols - colsToShrink
        setCurrentActiveTab({
          row: record.row,
          col: record.col - colsToShrink >= 0 ? record.col - colsToShrink : 0,
          nonce: record.nonce,
        });
      }
    }

    // Set new size
    setGridRows(currentRows - rowsToShrink);
    setGridCols(currentCols - colsToShrink);

    // Keep only in-field ones
    activeTabHandlers.filter(
      (v) =>
        v.row < currentRows - rowsToShrink &&
        v.col < currentCols - colsToShrink,
    );
  }
};

const expandGrid = (
  rows: number,
  cols: number,
  currentRows: number,
  currentCols: number,
  setGridRows: (rows: number) => void,
  setGridCols: (cols: number) => void,
  activeTabHandlers: UseListStateHandlers<ShellGridTabNonce>,
) => {
  setGridRows(currentRows + rows);
  setGridCols(currentCols + cols);

  // Expand active tabs
  const toAppendTabs: ShellGridTabNonce[] = [];
  // New rows old cols (bottom)
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < currentCols; j++) {
      toAppendTabs.push({
        row: currentRows + i,
        col: j,
        nonce: null, // Init
      });
    }
  }
  // New cols old rows (right)
  for (let j = 0; j < cols; j++) {
    for (let i = 0; i < currentRows; i++) {
      toAppendTabs.push({
        row: i,
        col: currentCols + j,
        nonce: null, // Init
      });
    }
  }
  // New rows new cols (bottom-right)
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      toAppendTabs.push({
        row: currentRows + i,
        col: currentCols + j,
        nonce: null, // Init
      });
    }
  }
  activeTabHandlers.append(...toAppendTabs);
};

export const gridModifyHandler = (
  ev: Event<EventPayloadShellGridModify>,
  currentRows: number,
  currentCols: number,
  setGridRows: (rows: number) => void,
  setGridCols: (cols: number) => void,
  activeTabCurrent: ShellGridTabNonce[],
  activeTabHandlers: UseListStateHandlers<ShellGridTabNonce>,
  tabsGridLocationCurrent: ShellGridTabLocationWithDataIndex[],
  tabsGridLocationHandlers: UseListStateHandlers<ShellGridTabLocationWithDataIndex>,
  setCurrentActiveTab: (tab: ShellGridTabNonce) => void,
) => {
  switch (ev.payload.action) {
    case "add":
      let acceptedRows = ev.payload.grid.row;
      if (acceptedRows < 0) {
        acceptedRows = 0;
      } else if (currentRows + acceptedRows > LayoutMaxRows) {
        acceptedRows = LayoutMaxRows - currentRows;
      }
      let acceptedCols = ev.payload.grid.col;
      if (acceptedCols < 0) {
        acceptedCols = 0;
      } else if (currentCols + acceptedCols > LayoutMaxCols) {
        acceptedCols = LayoutMaxCols - currentCols;
      }
      if (acceptedRows > 0 || acceptedCols > 0) {
        expandGrid(
          acceptedRows,
          acceptedCols,
          currentRows,
          currentCols,
          setGridRows,
          setGridCols,
          activeTabHandlers,
        );
      }
      break;
    case "set":
      if (ev.payload.grid.row > 0 && ev.payload.grid.row < LayoutMaxRows) {
        setGridRows(ev.payload.grid.row);
      }
      if (ev.payload.grid.col > 0 && ev.payload.grid.col < LayoutMaxCols) {
        setGridCols(ev.payload.grid.col);
      }
      break;
    case "tidy":
      tidyGrid(
        currentRows,
        currentCols,
        setGridRows,
        setGridCols,
        activeTabCurrent,
        activeTabHandlers,
        tabsGridLocationCurrent,
        tabsGridLocationHandlers,
        setCurrentActiveTab,
      );
      break;
  }
};
