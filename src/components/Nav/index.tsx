import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Flex } from "@mantine/core";

import { navs } from "@/routes.ts";

import NavItem from "./NavItem.tsx";
import NavDir from "@/components/Nav/NavDir.tsx";

const Nav = () => {
  const { pathname } = useLocation();
  const { t } = useTranslation("main", { keyPrefix: "nav" });

  return (
    <Flex h="100%" direction="column" justify="space-between">
      {navs.map((group) => (
        <div>
          {group.map((route) =>
            route.subs ? (
              <NavDir key={route.path} label={t(route.label)} icon={route.icon}>
                {route.subs.map((route) => (
                  <NavItem
                    key={route.path}
                    label={t(route.label)}
                    icon={route.icon}
                    to={route.path}
                    isActive={pathname === route.path}
                  />
                ))}
              </NavDir>
            ) : (
              <NavItem
                key={route.path}
                label={t(route.label)}
                icon={route.icon}
                to={route.path}
                isActive={pathname === route.path}
              />
            ),
          )}
        </div>
      ))}
    </Flex>
  );
};

export default Nav;
