import { NavLink as RouterNavLink } from "react-router-dom";
import type { ReactNode } from "react";
import { memo } from "react";
import { NavLink } from "@mantine/core";

import { iconStyle } from "./iconStyle.ts";

interface NavItemProps {
  label: ReactNode;
  icon: (props: any) => ReactNode;
  to: string;
  isActive: boolean;
}
const NavItem = ({ label, icon: Icon, to, isActive }: NavItemProps) => (
  <NavLink
    label={label}
    leftSection={<Icon style={iconStyle} stroke={1.5} />}
    component={RouterNavLink}
    to={to}
    active={isActive}
  />
);

export default memo(NavItem);
