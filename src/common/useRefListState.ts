import type { UseListStateHandlers } from "@mantine/hooks";
import { useListState } from "@mantine/hooks";
import type { RefObject } from "react";
import { useEffect, useRef } from "react";

export function useRefListState<T>(
  initialValue: T[] = [],
): [T[], UseListStateHandlers<T>, RefObject<T[]>] {
  const [state, setState] = useListState(initialValue);
  const stateRef = useRef<T[]>(initialValue);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  return [state, setState, stateRef];
}
