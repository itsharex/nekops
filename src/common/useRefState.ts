import type { Dispatch, RefObject, SetStateAction } from "react";
import { useEffect, useRef, useState } from "react";

export function useRefState<T>(
  initialValue: T,
): [T, Dispatch<SetStateAction<T>>, RefObject<T>] {
  const [state, setState] = useState(initialValue);
  const stateRef = useRef<T>(initialValue);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  return [state, setState, stateRef];
}
