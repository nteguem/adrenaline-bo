"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import styles from "./menuLink.module.css";

interface MenuLinkprops {
  title: string;
  path: string;
}

const MenuLink: React.FC<MenuLinkprops> = ({ title, path }) => {
  const pathname = usePathname();

  return (
    <Link
      href={path}
      className={`${styles.container} ${
        pathname === path ? styles.active : ""
      }`}
    >
      {title}
    </Link>
  );
};

export default MenuLink;
