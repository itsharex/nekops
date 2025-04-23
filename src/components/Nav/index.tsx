import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { navs } from "@/routes.ts";

import NavItem from "./NavItem.tsx";
import NavDir from "@/components/Nav/NavDir.tsx";

const Nav = () => {
  const { pathname } = useLocation();
  const { t } = useTranslation();

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
