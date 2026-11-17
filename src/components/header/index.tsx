import DarkModeOutlined from "@mui/icons-material/DarkModeOutlined";
import LightModeOutlined from "@mui/icons-material/LightModeOutlined";
import AccountCircleOutlined from "@mui/icons-material/AccountCircleOutlined";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import AppBar from "@mui/material/AppBar";
import Avatar from "@mui/material/Avatar";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Tooltip from "@mui/material/Tooltip";
import Button from "@mui/material/Button";
import { useGetIdentity } from "@refinedev/core";
import { HamburgerMenu, RefineThemedLayoutV2HeaderProps } from "@refinedev/mui";
import React, { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { ColorModeContext } from "../../contexts/color-mode";
import { getLocale, setLocale } from "../../i18n";

export type IUser = {
  id: string;
  name: string;
  avatar: string;
  role?: "admin" | "user";
};

type HeaderProps = RefineThemedLayoutV2HeaderProps & {
  /** Hide the hamburger menu — use true on pages outside ThemedLayoutV2 (e.g. auth pages). */
  hideMenu?: boolean;
};

export const Header: React.FC<HeaderProps> = ({
  sticky = true,
  hideMenu = false,
}) => {
  const { mode, setMode } = useContext(ColorModeContext);
  const { data: user } = useGetIdentity<IUser>();
  const [locale, setLocaleState] = useState(getLocale());

  const toggleLocale = () => {
    const next = locale === "id" ? "en" : "id";
    setLocale(next);
    setLocaleState(next);
  };

  return (
    <AppBar position={sticky ? "sticky" : "relative"}>
      <Toolbar>
        <Stack direction="row" width="100%" justifyContent="flex-end" alignItems="center">
          {!hideMenu && <HamburgerMenu />}
          <Stack
            direction="row"
            width="100%"
            justifyContent="flex-end"
            alignItems="center"
            gap={0.5}
          >
            {/* Language switcher */}
            <Tooltip title={locale === "id" ? "Switch to English" : "Ganti ke Bahasa Indonesia"}>
              <Button
                size="small"
                color="inherit"
                onClick={toggleLocale}
                sx={{ minWidth: 42, fontWeight: "bold", textTransform: "none" }}
              >
                {locale === "id" ? "ID" : "EN"}
              </Button>
            </Tooltip>

            <IconButton color="inherit" onClick={() => setMode()}>
              {mode === "dark" ? <LightModeOutlined /> : <DarkModeOutlined />}
            </IconButton>

            {user && (
              <Stack direction="row" gap="8px" alignItems="center">
                {user.role === "admin" && (
                  <Tooltip title="Kelola Pengguna">
                    <IconButton component={Link} to="/admin/users" color="inherit" size="small">
                      <AdminPanelSettingsIcon />
                    </IconButton>
                  </Tooltip>
                )}
                {user.name && (
                  <Typography
                    sx={{ display: { xs: "none", sm: "inline-block" } }}
                    variant="subtitle2"
                  >
                    {user.name}
                  </Typography>
                )}
                <Tooltip title="Profil Saya">
                  <IconButton component={Link} to="/profile" color="inherit" size="small">
                    {user.avatar ? (
                      <Avatar
                        src={user.avatar}
                        alt={user.name}
                        sx={{ width: 32, height: 32 }}
                      />
                    ) : (
                      <AccountCircleOutlined />
                    )}
                  </IconButton>
                </Tooltip>
              </Stack>
            )}
          </Stack>
        </Stack>
      </Toolbar>
    </AppBar>
  );
};
