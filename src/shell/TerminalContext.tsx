import React, { createContext, ReactNode, useContext, useRef } from "react";
import type { Terminal } from "xterm";
import type { FitAddon } from "xterm-addon-fit";

// Define the structure of a terminal instance
interface TerminalInstance {
  terminal: Terminal | null;
  fitAddon: FitAddon | null;
  terminateFunc: (() => void) | null;
  isLoading: boolean;
  isPendingFit: boolean;
}

// Define the context structure
interface TerminalContextType {
  getTerminalInstance: (nonce: string) => TerminalInstance;
  setTerminalInstance: (
    nonce: string,
    instance: Partial<TerminalInstance>,
  ) => void;
  removeTerminalInstance: (nonce: string) => void;
}

// Create the context with a default value
const TerminalContext = createContext<TerminalContextType>({
  getTerminalInstance: () => ({
    terminal: null,
    fitAddon: null,
    terminateFunc: null,
    isLoading: true,
    isPendingFit: false,
  }),
  setTerminalInstance: () => {},
  removeTerminalInstance: () => {},
});

// Create a provider component
export const TerminalProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  // Use a ref to store terminal instances
  const terminalInstancesRef = useRef<Record<string, TerminalInstance>>({});

  // Get a terminal instance by nonce
  const getTerminalInstance = (nonce: string): TerminalInstance => {
    if (!terminalInstancesRef.current[nonce]) {
      terminalInstancesRef.current[nonce] = {
        terminal: null,
        fitAddon: null,
        terminateFunc: null,
        isLoading: true,
        isPendingFit: false,
      };
    }
    return terminalInstancesRef.current[nonce];
  };

  // Set a terminal instance by nonce
  const setTerminalInstance = (
    nonce: string,
    instance: Partial<TerminalInstance>,
  ) => {
    terminalInstancesRef.current[nonce] = {
      ...getTerminalInstance(nonce),
      ...instance,
    };
  };

  // Remove a terminal instance by nonce
  const removeTerminalInstance = (nonce: string) => {
    delete terminalInstancesRef.current[nonce];
  };

  return (
    <TerminalContext.Provider
      value={{
        getTerminalInstance,
        setTerminalInstance,
        removeTerminalInstance,
      }}
    >
      {children}
    </TerminalContext.Provider>
  );
};

// Create a hook to use the context
export const useTerminal = () => useContext(TerminalContext);
