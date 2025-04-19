import { useLocation } from "react-router-dom";
import { navs } from "@/routes.ts";

import NavItem from "./NavItem.tsx";
import NavDir from "@/components/Nav/NavDir.tsx";
import { useTranslation } from "react-i18next";

const Nav = () => {
  const { pathname } = useLocation();
  const { t, i18n } = useTranslation("main");

  return (
    <>
      {navs.map((route) =>
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
    </>
  );
};

export default Nav;
