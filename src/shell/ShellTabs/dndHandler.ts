import { DndZonePanel, DndZoneTabs } from "@/shell/ShellTabs/dndConfig.ts";
import type { DraggableLocation } from "@hello-pangea/dnd";
import type { ShellSingleServer } from "@/events/payload.ts";
import type {
  ShellGridBase,
  ShellGridTabLocation,
  ShellGridTabLocationWithDataIndex,
  ShellGridTabNonce,
} from "@/types/shell.ts";
import type { UseListStateHandlers } from "@mantine/hooks";

export const dndHandler = (
  nonce: string,
  source: DraggableLocation<string>,
  destination: DraggableLocation<string>,
  tabsData: ShellSingleServer[],
  tabsGridLocation: ShellGridTabLocationWithDataIndex[],
  tabsGridLocationHandlers: UseListStateHandlers<ShellGridTabLocationWithDataIndex>,
  isActiveTab: (
    nonce: string,
    pos: ShellGridBase,
    current?: boolean,
  ) => boolean,
  fallbackActive: (pos: ShellGridTabLocation) => void,
  activeTab: ShellGridTabNonce[],
  setActiveTab: (payload: ShellGridTabNonce) => void,
) => {
  const tabIndex = tabsData.findIndex((t) => t.nonce === nonce);
  const tabLocation = tabsGridLocation[tabIndex];

  const sourceGrid = source.droppableId.split(":")[1];
  const [destZone, destGrid] = destination.droppableId.split(":");

  if (sourceGrid === destGrid) {
    // In same section
    if (destZone !== DndZonePanel) {
      if (source.index !== destination.index) {
        if (source.index > destination.index) {
          // Move forward
          tabsGridLocationHandlers.applyWhere(
            (v) =>
              v.row === tabLocation.row &&
              v.col === tabLocation.col &&
              v.order < source.index &&
              v.order >= destination.index,
            (v) => ({
              ...v,
              order: v.order + 1,
            }),
          );
        } else {
          // Move backward
          tabsGridLocationHandlers.applyWhere(
            (v) =>
              v.row === tabLocation.row &&
              v.col === tabLocation.col &&
              v.order > source.index &&
              v.order <= destination.index,
            (v) => ({
              ...v,
              order: v.order - 1,
            }),
          );
        }
        // Set new order
        tabsGridLocationHandlers.setItem(tabIndex, {
          ...tabLocation,
          order: destination.index,
        });
      }
    }
  } else {
    // Cross sections
    const destPos = destGrid.split("-");
    const destRow = parseInt(destPos[0]);
    const destCol = parseInt(destPos[1]);

    const isActive = isActiveTab(nonce, tabLocation);
    if (isActive) {
      fallbackActive(tabLocation);
    }

    // Move tabs in source
    tabsGridLocationHandlers.applyWhere(
      (v) =>
        v.row === tabLocation.row &&
        v.col === tabLocation.col &&
        v.order > tabLocation.order,
      (v) => ({
        ...v,
        order: v.order - 1,
      }),
    );

    // Move tabs in destination
    const destOrder =
      destZone === DndZoneTabs
        ? destination.index // Target index
        : tabsGridLocation.filter(
            (v) => v.row === destRow && v.col === destCol, // Place at last
          ).length;
    tabsGridLocationHandlers.applyWhere(
      (v) => v.row === destRow && v.col === destCol && v.order > destOrder,
      (v) => ({
        ...v,
        order: v.order + 1,
      }),
    );
    // Set new location
    tabsGridLocationHandlers.setItem(tabIndex, {
      row: destRow,
      col: destCol,
      order: destOrder,
      dataIndex: tabLocation.dataIndex, // Keep unchanged
    });

    // Keep active state
    if (
      isActive || // Tab is active
      !activeTab.some(
        (v) => v.row === destRow && v.col === destCol && v.nonce !== null, // No active tab in new grid, set current as active one
      )
    ) {
      setActiveTab({
        row: destRow,
        col: destCol,
        nonce: nonce,
      });
    }
  }
};
