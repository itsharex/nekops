import { AppShell } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import Router from "@/Router.tsx";
import Header from "@/components/Header.tsx";
import Nav from "@/components/Nav.tsx";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "@/store.ts";
import { readSettings } from "@/slices/settingsSlice.ts";
import { readServers } from "@/slices/serversSlice.ts";
import { readSnippets } from "@/slices/snippetsSlice.ts";
import { readEncryption } from "@/slices/encryptionSlice.ts";
import AboutModal from "@/components/AboutModal.tsx";
import { emit, listen } from "@tauri-apps/api/event";
import {
  EventNameWindowCloseMain,
  EventNameWindowCloseRescue,
  EventNameWindowCloseShell,
} from "@/events/name.ts";
import TerminateAndExitModal from "@/components/TerminateAndExitModal.tsx";
import { Window } from "@tauri-apps/api/window";

const App = () => {
  const [isAboutModalOpen, { open: openAboutModal, close: closeAboutModal }] =
    useDisclosure(false);

  const dispatch = useDispatch<AppDispatch>();

  // Initialize
  useEffect(() => {
    dispatch(readSettings()).then(() => {
      dispatch(readServers());
      dispatch(readSnippets());
      dispatch(readEncryption());
    });
  }, []);

  // Handle pre-close event
  const [
    isPreCloseModalOpen,
    { open: openPreCloseModal, close: closePreCloseModal },
  ] = useDisclosure(false);

  const mainWindowDoClose = () => {
    // Terminate shells window and then main window
    emit(EventNameWindowCloseShell, true);
    emit(EventNameWindowCloseRescue, true);
    Window.getCurrent().destroy();
  };

  // Listen to pre-close event at page initialize
  useEffect(() => {
    const stopWindowCloseMainPromise = listen<boolean>(
      EventNameWindowCloseMain,
      openPreCloseModal,
    );

    // Stop listen before component (page) destroy
    return () => {
      (async () => {
        (await stopWindowCloseMainPromise)();
      })();
    };
  }, []);

  return (
    <>
      <AppShell
        header={{ height: 60 }}
        navbar={{
          width: 200,
          breakpoint: 0,
          collapsed: {
            mobile: false,
            desktop: false,
          },
        }}
      >
        <AppShell.Header>
          <Header openAboutModal={openAboutModal} />
        </AppShell.Header>

        <AppShell.Navbar>
          <Nav />
        </AppShell.Navbar>

        <AppShell.Main h={"100dvh"}>
          <Router />
        </AppShell.Main>
      </AppShell>

      <AboutModal isOpen={isAboutModalOpen} close={closeAboutModal} />
      <TerminateAndExitModal
        isOpen={isPreCloseModalOpen}
        onClose={closePreCloseModal}
        onConfirm={mainWindowDoClose}
      />
    </>
  );
};

export default App;
