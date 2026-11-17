import React, { useContext, useState } from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import { AppIcon } from "../../components/app-icon";
import { Link } from "react-router-dom";
import QrCode2Icon from "@mui/icons-material/QrCode2";
import DashboardCustomizeIcon from "@mui/icons-material/DashboardCustomize";
import QuestionMarkIcon from "@mui/icons-material/QuestionMark";
import DarkModeOutlined from "@mui/icons-material/DarkModeOutlined";
import LightModeOutlined from "@mui/icons-material/LightModeOutlined";
import { useGetIdentity, useTranslate } from "@refinedev/core";
import { IUser } from "../../components/header";
import { ColorModeContext } from "../../contexts/color-mode";
import { getLocale, setLocale } from "../../i18n";

const Feature = ({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
}) => {
  return (
    <Box display="flex" gap={2} maxWidth={400}>
      <Box
        fontSize={64}
        display="flex"
        alignItems="flex-start"
        justifyContent="center"
      >
        {icon}
      </Box>
      <Box>
        <Typography fontWeight="bold" fontSize={24}>
          {title}
        </Typography>
        <Typography>{description}</Typography>
      </Box>
    </Box>
  );
};

export default function LandingPage() {
  const { data: user } = useGetIdentity<IUser>();
  const { mode, setMode } = useContext(ColorModeContext);
  const t = useTranslate();
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
        px={{ xs: 1.5, sm: 2 }}
        py={{ xs: 1, sm: 2 }}
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        gap={1}
      >
        <Box sx={{ minWidth: 0, flexShrink: 1 }}>
          <AppIcon />
        </Box>
        <Stack
          direction="row"
          gap={{ xs: 0.5, sm: 1 }}
          alignItems="center"
          flexShrink={0}
        >
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
          {user ? (
            <Button
              variant="contained"
              component={Link}
              to="/requests"
              size="small"
              sx={{ whiteSpace: "nowrap", flexShrink: 0 }}
            >
              {t("common.dashboard")}
            </Button>
          ) : (
            <>
              <Button
                variant="outlined"
                component={Link}
                to="/login"
                size="small"
                sx={{ whiteSpace: "nowrap", flexShrink: 0, px: { xs: 1.2, sm: 2 } }}
              >
                {t("common.login")}
              </Button>
              <Button
                variant="contained"
                component={Link}
                to="/register"
                size="small"
                sx={{ whiteSpace: "nowrap", flexShrink: 0, px: { xs: 1.2, sm: 2 } }}
              >
                {t("common.register")}
              </Button>
            </>
          )}
        </Stack>
      </Box>
      <Box>
        <Box pb={{ xs: 5, sm: 20, md: 25, lg: 30 }}>
          <Box px={4} py={10} maxWidth={1280} mx="auto">
            <Typography
              component="h1"
              variant="h2"
              fontWeight="bold"
              textAlign="center"
              color="primary.main"
              fontSize={{
                xs: "2.5rem",
                md: "3.75rem",
              }}
            >
              {t("pages.landing.hero.title")}
            </Typography>
            <Typography
              variant="subtitle1"
              textAlign="center"
              fontSize={{
                xs: "1rem",
                md: "1.25rem",
              }}
            >
              {t("pages.landing.hero.subtitle")}
            </Typography>
            <Box display="flex" justifyContent="center" mt={4}>
              {user ? (
                <Button variant="contained" component={Link} to="/requests">
                  {t("common.dashboard")}
                </Button>
              ) : (
                <Button variant="contained" component={Link} to="/requests">
                  {t("pages.landing.cta.start")}
                </Button>
              )}
            </Box>
          </Box>
        </Box>
        <Box bgcolor="primary.main">
          <Box px={{ xs: 2, md: 10 }} maxWidth={1280} mx="auto">
            <img src="/hero.png" style={{ width: "100%", marginTop: "-20%" }} />
          </Box>
          <Box pb={20} pt={10} color="white" px={4} maxWidth={1280} mx="auto">
            <Box display="flex" gap={4} justifyContent="center" flexWrap="wrap">
              <Feature
                title={t("pages.landing.features.customize.title")}
                description={t("pages.landing.features.customize.desc")}
                icon={<DashboardCustomizeIcon fontSize="inherit" />}
              />
              <Feature
                title={t("pages.landing.features.profile.title")}
                description={t("pages.landing.features.profile.desc")}
                icon={<QuestionMarkIcon fontSize="inherit" />}
              />
              <Feature
                title={t("pages.landing.features.qr.title")}
                description={t("pages.landing.features.qr.desc")}
                icon={<QrCode2Icon fontSize="inherit" />}
              />
            </Box>
          </Box>
        </Box>
      </Box>
      <Box component="footer" bgcolor="primary.main" p={4}>
        <Box
          display="flex"
          gap={4}
          justifyContent="center"
          alignItems="center"
          flexWrap="wrap"
        >
          {/* <Typography color="white" fontSize={20}>
            Made with
          </Typography> */}
          {/* <img src="/refine-logo.svg" width={100} /> */}
          {/* <img src="/supabase-logo.svg" width={150} /> */}
          <img src="https://disparekraf.jakarta.go.id/jakartatourism-be/storage/jaktour/images/site-config/logo_dark/zYEVgsSVjHTy8QRV8QQGMNkcboTR3o4YmFgBmBrM.png" width={100} />
        </Box>
      </Box>
    </Stack>
  );
}