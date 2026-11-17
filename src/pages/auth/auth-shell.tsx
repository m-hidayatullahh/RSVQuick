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
import { useTranslate } from "@refinedev/core";

export default function AuthShell({ children }: { children: React.ReactNode }) {
  const { mode, setMode } = useContext(ColorModeContext);
  const { pathname } = useLocation();
  const [locale, setLocaleState] = useState(getLocale());
  const t = useTranslate();

  const toggleLocale = () => {
    const next = locale === "id" ? "en" : "id";
    setLocale(next);
    setLocaleState(next);
  };

  return (
    <Stack bgcolor="background.default" color="text.primary" minHeight="100vh">
      <Box
        component="header"
        px={{ xs: 1.5, sm: 2 }}
        py={{ xs: 1, sm: 2 }}
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        gap={1}
      >
        <Box
          component={Link}
          to="/"
          sx={{ textDecoration: "none", color: "inherit", minWidth: 0, flexShrink: 1 }}
        >
          <AppIcon />
        </Box>
        <Stack direction="row" gap={{ xs: 0.5, sm: 1 }} alignItems="center" flexShrink={0}>
          <Tooltip title={locale === "id" ? t("common.switchToEn") : t("common.switchToId")}>
            <Button
              size="small"
              color="inherit"
              onClick={toggleLocale}
              sx={{ minWidth: 42, fontWeight: "bold", textTransform: "none" }}
            >
              {locale === "id" ? "ID" : "EN"}
            </Button>
          </Tooltip>
          <Tooltip title={mode === "dark" ? t("common.lightMode") : t("common.darkMode")}>
            <IconButton onClick={() => setMode()} color="inherit" size="small">
              {mode === "dark" ? <LightModeOutlined /> : <DarkModeOutlined />}
            </IconButton>
          </Tooltip>
          {pathname !== "/login" && (
            <Button
              variant="outlined"
              component={Link}
              to="/login"
              size="small"
              sx={{ whiteSpace: "nowrap", flexShrink: 0, px: { xs: 1.2, sm: 2 } }}
            >
              {t("common.login")}
            </Button>
          )}
          {pathname !== "/register" && (
            <Button
              variant="contained"
              component={Link}
              to="/register"
              size="small"
              sx={{ whiteSpace: "nowrap", flexShrink: 0, px: { xs: 1.2, sm: 2 } }}
            >
              {t("common.register")}
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
