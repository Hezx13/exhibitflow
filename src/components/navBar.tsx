import { memo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { StyledNavBar, StyledNavBarItem, StyledLink } from "../styles/styles";
import { Menu, MenuItem, IconButton, Drawer } from "@mui/material";
import PermIdentityIcon from "@mui/icons-material/PermIdentity";
import PersonIcon from "@mui/icons-material/Person";
import { logout } from "../api/user-api";
import useMediaQuery from "@mui/material/useMediaQuery";
import MenuIcon from "@mui/icons-material/Menu";
import logo from "../assets/logo192.png";
import DepartmentSelector from "./DepartmentSelector";

function NavbarItems(props) {
  return (
    <>
    <StyledNavBarItem>
        <StyledLink
          to="/management"
          onClick={props.validateLogin}
          color={!props.isLoggedIn ? "grey" : "#ffffff"}
          isActive={props.location.pathname === "/management"}
        >
          Management
        </StyledLink>
      </StyledNavBarItem>
      <StyledNavBarItem>
        <StyledLink
          to="/dashboard"
          onClick={props.validateLogin}
          color={!props.isLoggedIn ? "grey" : "#ffffff"}
          isActive={props.location.pathname === "/dashboard"}
        >
          Dashboard
        </StyledLink>
      </StyledNavBarItem>
      <StyledNavBarItem>
        <StyledLink
          to="/"
          onClick={props.validateLogin}
          color={!props.isLoggedIn ? "grey" : "#ffffff"}
          isActive={props.location.pathname === "/"}
        >
          Projects
        </StyledLink>
      </StyledNavBarItem>
      <StyledNavBarItem>
        <StyledLink
          to="/reports"
          onClick={props.validateLogin}
          color={!props.isLoggedIn ? "grey" : "#ffffff"}
          isActive={props.location.pathname === "/reports"}
        >
          Reports
        </StyledLink>
      </StyledNavBarItem>
      <StyledNavBarItem>
        <StyledLink
          to="/archive"
          onClick={props.validateLogin}
          color={!props.isLoggedIn ? "grey" : "#ffffff"}
          isActive={props.location.pathname === "/archive"}
        >
          Archive
        </StyledLink>
      </StyledNavBarItem>
    </>
  );
}

export const NavBar = () => {
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  document.title = 'ExhibitFlow - ' + (location.pathname.split("/")[1] ? location.pathname.split("/")[1] : "projects");
  const isMobile = useMediaQuery("(max-width:600px)");

  const openMenu = (event) => {
    setMenuAnchor(event.currentTarget);
  };

  const closeMenu = () => {
    setMenuAnchor(null);
  };

  const handleLogOut = async () => {
    await logout();
    setIsLoggedIn(!!localStorage.getItem("token"));
    closeMenu();
  };

  const validateLogin = (event) => {
    setIsLoggedIn(!!localStorage.getItem("token"));
    if (!isLoggedIn) event?.preventDefault();
  };

  const toggleDrawer = (open) => (event) => {
    if (
      event.type === "keydown" &&
      (event.key === "Tab" || event.key === "Shift")
    ) {
      return;
    }
    setDrawerOpen(open);
  };

  return (
    <StyledNavBar>
      <span>
        {isMobile ? (
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={toggleDrawer(true)}
          >
            <MenuIcon htmlColor="orange" />
          </IconButton>
        ) : (
          <img
            src={logo}
            alt="exhibitFlow"
            style={{
              textAlign: "center",
              maxHeight: "25px",
              width: "auto",
              height: "100%",
            }}
          />
        )}
      </span>
      <Drawer
        open={drawerOpen}
        anchor="top"
        onClose={toggleDrawer(false)}
        ModalProps={{
          BackdropProps:{
            style: {
              backdropFilter: 'blur(5px)',
            }
          }
          }}
          PaperProps={{
            style: {
              background: '#101010F0',
              padding: '30px 0',
            }
          }}
        sx={{ textAlign: "center", }}
      >
         <NavbarItems
          location={location}
          isLoggedIn={isLoggedIn}
          validateLogin={validateLogin}
        ></NavbarItems>
      </Drawer>
      {!isMobile ? (
        <span
        style={{
          display: "flex",
          flexDirection: "row",
        }}
      >
         <NavbarItems
          location={location}
          isLoggedIn={isLoggedIn}
          validateLogin={validateLogin}
        ></NavbarItems>
      </span>
       
      ) : (
        <img
          src={logo}
          alt="exhibitFlow"
          style={{
            textAlign: "center",
            maxHeight: "25px",
            width: "auto",
            height: "100%",
          }}
        />
      )}

      <span>
        <StyledNavBarItem>
          <IconButton aria-label="account" onClick={openMenu}>
            {isLoggedIn ? 
            <>
            <PersonIcon />
            </>
             : <PermIdentityIcon />}
          </IconButton>
          <Menu
            anchorEl={menuAnchor}
            keepMounted
            open={Boolean(menuAnchor)}
            onClose={closeMenu}
          >
            {isLoggedIn ? (
              <div>
                <MenuItem onClick={handleLogOut}>Log Out</MenuItem>
              </div>
            ) : (
              <div>
                <StyledLink to="/login" color="#e3f2fd">
                  <MenuItem>Log in</MenuItem>
                </StyledLink>
                <StyledLink to="/register" color="#e3f2fd">
                  <MenuItem>Register</MenuItem>
                </StyledLink>
              </div>
            )}
            { isLoggedIn && menuAnchor && <DepartmentSelector/> }
          </Menu>
        </StyledNavBarItem>
      </span>
    </StyledNavBar>
  );
};

export default memo(NavBar);
