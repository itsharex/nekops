import type { PropsWithChildren, ReactNode } from "react";
import { memo } from "react";
import { NavLink } from "@mantine/core";
import { IconChevronRight } from "@tabler/icons-react";

import { iconStyle } from "./iconStyle.ts";

interface NavDirProps extends PropsWithChildren {
  label: ReactNode;
  icon: (props: any) => ReactNode;
}
const NavDir = ({ label, icon: Icon, children }: NavDirProps) => (
  <NavLink
    label={label}
    leftSection={<Icon style={iconStyle} stroke={1.5} />}
    rightSection={<IconChevronRight style={iconStyle} stroke={1.5} />}
    defaultOpened
  >
    {children}
  </NavLink>
);

export default memo(NavDir);
