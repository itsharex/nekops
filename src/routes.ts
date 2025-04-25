import SSHPage from "@/pages/SSH.tsx";
import MultirunPage from "@/pages/Multirun.tsx";
import RescuePage from "@/pages/Rescue.tsx";
import ServersPage from "@/pages/Servers.tsx";
import SnippetsPage from "@/pages/Snippets.tsx";
import Settings from "@/pages/Settings.tsx";
import Analysis from "@/pages/Analysis.tsx";

import {
  IconChartBar,
  IconCirclesRelation,
  IconCodeAsterix,
  IconHeartbeat,
  IconLibrary,
  IconServerCog,
  IconSettings,
  IconStars,
  IconTerminal2,
} from "@tabler/icons-react";

export const routes = [
  {
    path: "/",
    page: SSHPage,
  },
  {
    path: "/multirun",
    page: MultirunPage,
  },
  {
    path: "/rescue",
    page: RescuePage,
  },
  {
    path: "/servers",
    page: ServersPage,
  },
  {
    path: "/snippets",
    page: SnippetsPage,
  },
  {
    path: "/settings",
    page: Settings,
  },
  {
    path: "/analysis",
    page: Analysis,
  },
];

export const navs = [
  {
    label: "connect",
    icon: IconCirclesRelation,
    path: "#/connect",
    subs: [
      {
        label: "ssh",
        icon: IconTerminal2,
        path: "/",
      },
      {
        label: "multirun",
        icon: IconStars,
        path: "/multirun",
      },
      {
        label: "rescue",
        icon: IconHeartbeat,
        path: "/rescue",
      },
    ],
  },
  {
    label: "library",
    icon: IconLibrary,
    path: "#/library",
    subs: [
      {
        label: "servers",
        icon: IconServerCog,
        path: "/servers",
      },
      {
        label: "snippets",
        icon: IconCodeAsterix,
        path: "/snippets",
      },
    ],
  },
  {
    label: "analysis",
    icon: IconChartBar,
    path: "/analysis",
  },
  {
    label: "settings",
    icon: IconSettings,
    path: "/settings",
  },
];
