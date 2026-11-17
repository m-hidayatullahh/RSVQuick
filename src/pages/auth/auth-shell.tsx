import React, { useContext, useState } from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import DarkModeOutlined from "@mui/icons-material/DarkModeOutlined";
import LightModeOutlined from "@mui/icons-material/LightModeOutlined";
import { Link, useLocation } from "react-router-dom";
import { AppIcon } from "../../components/app-icon";
import { ColorModeContext } from "../../contexts/color-mode";
import { getLocale, setLocale } from "../../i18n";

export default function AuthShell({ children }: { children: React.ReactNode }) {
  const { mode, setMode } = useContext(ColorModeContext);
  const { pathname } = useLocation();
  const [locale, setLocaleState] = useState(getLocale());

  const toggleLocale = () => {
    const next = locale === "id" ? "en" : "id";
    setLocale(next);
    setLocaleState(next);
  };

  return (
    <Stack bgcolor="background.default" color="text.primary" minHeight="100vh">
      <Box
        component="header"
        p={2}
        display="flex"
        justifyContent="space-between"
        alignItems="center"
      >
        <Box component={Link} to="/" sx={{ textDecoration: "none", color: "inherit" }}>
          <AppIcon />
        </Box>
        <Stack direction="row" gap={1} alignItems="center">
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
          <Tooltip title={mode === "dark" ? "Mode Terang" : "Mode Gelap"}>
            <IconButton onClick={() => setMode()} color="inherit" size="small">
              {mode === "dark" ? <LightModeOutlined /> : <DarkModeOutlined />}
            </IconButton>
          </Tooltip>
          {pathname !== "/login" && (
            <Button variant="outlined" component={Link} to="/login" size="small">
              Login
            </Button>
          )}
          {pathname !== "/register" && (
            <Button variant="contained" component={Link} to="/register" size="small">
              Buat Akun
            </Button>
          )}
        </Stack>
      </Box>
      <Box flex={1} display="flex" justifyContent="center" alignItems="center" p={2}>
        {children}
      </Box>
    </Stack>
  );
}
