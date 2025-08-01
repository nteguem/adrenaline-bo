"use client";
import React from "react";
import styles from "./navbar.module.css";
import Image from "next/image";
import { ListItemIcon, Menu, MenuItem } from "@mui/material";
import { Logout } from "@mui/icons-material";
import { useRouter } from "next/navigation";

const Navbar = () => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const router = useRouter();
  const handleLogOut = async () => {
    try {
      const response = await fetch("/api/logout", { method: "POST" });
      response.json().then((val) => {
        if (val === "OK") {
          router.push("/login");
        }
      });
    } catch (error) {
      console.error("Logout failed :", error);
    }
  };
  return (
    <div className={styles.container}>
      <div>Matt Pokora | Adrénaline Tour - BackOffice</div>
      <div className={styles.leftSideContainer}>
        <div className={styles.leftSide}>
          <Image
            className={styles.leftSideLogo}
            src="/images/mackk.png"
            width={50}
            height={50}
            alt="Picture of the author"
          />
          <div className={styles.leftSideText}>Manager</div>
        </div>
        <React.Fragment>
          <div
            onClick={handleClick}
            className={styles.leftSideRight}
            style={{ cursor: "pointer" }}
          >
            M
          </div>
          <Menu
            anchorEl={anchorEl}
            id="account-menu"
            open={open}
            onClose={handleClose}
            onClick={handleClose}
            slotProps={{
              paper: {
                elevation: 0,
                sx: {
                  overflow: "visible",
                  filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
                  mt: 1.5,
                  "& .MuiAvatar-root": {
                    width: 32,
                    height: 32,
                    ml: -0.5,
                    mr: 1,
                  },
                  "&::before": {
                    content: '""',
                    display: "block",
                    position: "absolute",
                    top: 0,
                    right: 14,
                    width: 10,
                    height: 10,
                    bgcolor: "background.paper",
                    transform: "translateY(-50%) rotate(45deg)",
                    zIndex: 0,
                  },
                },
              },
            }}
            transformOrigin={{ horizontal: "right", vertical: "top" }}
            anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
          >
            <MenuItem onClick={handleLogOut}>
              <ListItemIcon>
                <Logout fontSize="small" />
              </ListItemIcon>
              Logout
            </MenuItem>
          </Menu>
        </React.Fragment>
      </div>
    </div>
  );
};

export default Navbar;
