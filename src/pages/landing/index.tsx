import React, { useContext, useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import { keyframes } from "@emotion/react";
import { AppIcon } from "../../components/app-icon";
import { Link } from "react-router-dom";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import CircularProgress from "@mui/material/CircularProgress";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import QrCode2Icon from "@mui/icons-material/QrCode2";
import DashboardCustomizeIcon from "@mui/icons-material/DashboardCustomize";
import QuestionMarkIcon from "@mui/icons-material/QuestionMark";
import DarkModeOutlined from "@mui/icons-material/DarkModeOutlined";
import LightModeOutlined from "@mui/icons-material/LightModeOutlined";
import { useGetIdentity, useTranslate } from "@refinedev/core";
import { IUser } from "../../components/header";
import { ColorModeContext } from "../../contexts/color-mode";
import { getLocale, setLocale } from "../../i18n";
import Seo from "../../components/seo";

const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(24px); }
  to { opacity: 1; transform: translateY(0); }
`;

const fadeInDown = keyframes`
  from { opacity: 0; transform: translateY(-16px); }
  to { opacity: 1; transform: translateY(0); }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-12px); }
`;

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

const ctaPulse = keyframes`
  0%, 100% { box-shadow: 0 10px 24px -8px rgba(233, 30, 99, 0.45), 0 0 0 0 rgba(233, 30, 99, 0.35); }
  50% { box-shadow: 0 14px 28px -8px rgba(233, 30, 99, 0.55), 0 0 0 10px rgba(233, 30, 99, 0); }
`;

const arrowNudge = keyframes`
  0%, 100% { transform: translateX(0); }
  50% { transform: translateX(4px); }
`;

const Feature = ({
  title,
  description,
  icon,
  delay = 0,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  delay?: number;
}) => {
  return (
    <Box
      display="flex"
      gap={2}
      maxWidth={400}
      sx={{
        opacity: 0,
        animation: `${fadeInUp} 0.8s ease-out ${delay}s forwards`,
        transition: "transform 0.3s ease",
        "&:hover": { transform: "translateY(-6px)" },
      }}
    >
      <Box
        fontSize={64}
        display="flex"
        alignItems="flex-start"
        justifyContent="center"
        sx={{
          transition: "transform 0.4s cubic-bezier(.34,1.56,.64,1)",
          "&:hover": { transform: "scale(1.15) rotate(-6deg)" },
        }}
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

  const [scrollY, setScrollY] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        const y = window.scrollY;
        setScrollY(y);
        const max =
          document.documentElement.scrollHeight - window.innerHeight;
        setScrollProgress(max > 0 ? Math.min((y / max) * 100, 100) : 0);
        raf = 0;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  const showScrollTop = scrollY > 300;

  return (
    <Stack
      bgcolor="background.default"
      color="text.primary"
      minHeight="100vh"
      sx={{ overflowX: "hidden" }}
    >
      <Seo
        title=""
        description={t("pages.landing.hero.subtitle")}
        canonical={(import.meta.env.VITE_SITE_URL || "https://rsvp.jakcation.id").replace(/\/$/, "") + "/"}
      />
      <Box
        component="header"
        px={{ xs: 1.5, sm: 2 }}
        py={{ xs: 1, sm: 2 }}
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        gap={1}
        sx={{
          animation: `${fadeInDown} 0.6s ease-out both`,
        }}
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
      <Box sx={{ position: "relative", overflow: "hidden" }}>
        {/* Decorative parallax blobs */}
        <Box
          aria-hidden
          sx={{
            position: "absolute",
            top: 40,
            left: "-10%",
            width: { xs: 280, md: 440 },
            height: { xs: 280, md: 440 },
            borderRadius: "50%",
            background: (theme) =>
              `radial-gradient(circle, ${theme.palette.primary.light}33 0%, transparent 70%)`,
            filter: "blur(40px)",
            pointerEvents: "none",
            transform: `translate3d(${scrollY * 0.08}px, ${scrollY * -0.15}px, 0)`,
            willChange: "transform",
          }}
        />
        <Box
          aria-hidden
          sx={{
            position: "absolute",
            top: 120,
            right: "-8%",
            width: { xs: 240, md: 380 },
            height: { xs: 240, md: 380 },
            borderRadius: "50%",
            background: (theme) =>
              `radial-gradient(circle, ${theme.palette.primary.main}22 0%, transparent 70%)`,
            filter: "blur(50px)",
            pointerEvents: "none",
            transform: `translate3d(${scrollY * -0.1}px, ${scrollY * -0.25}px, 0)`,
            willChange: "transform",
          }}
        />
        {/* Dot grid ornament — top right of hero */}
        <Box
          aria-hidden
          sx={{
            position: "absolute",
            top: { xs: 60, md: 90 },
            right: { xs: 12, md: 60 },
            width: { xs: 90, md: 140 },
            height: { xs: 90, md: 140 },
            display: { xs: "none", sm: "block" },
            backgroundImage: (theme) =>
              `radial-gradient(circle, ${theme.palette.primary.main} 1.2px, transparent 1.5px)`,
            backgroundSize: "14px 14px",
            opacity: 0.18,
            pointerEvents: "none",
            maskImage: "radial-gradient(circle, black 40%, transparent 75%)",
            WebkitMaskImage: "radial-gradient(circle, black 40%, transparent 75%)",
            zIndex: 0,
          }}
        />
        {/* Outline ring ornament — bottom left of hero */}
        <Box
          aria-hidden
          sx={{
            position: "absolute",
            bottom: { xs: 20, md: 80 },
            left: { xs: 10, md: 40 },
            width: { xs: 70, md: 120 },
            height: { xs: 70, md: 120 },
            borderRadius: "50%",
            border: (theme) => `2px dashed ${theme.palette.primary.main}`,
            opacity: 0.15,
            pointerEvents: "none",
            zIndex: 0,
            transform: `translate3d(0, ${scrollY * -0.05}px, 0)`,
            willChange: "transform",
          }}
        />
        <Box pb={{ xs: 10, sm: 20, md: 25, lg: 30 }} sx={{ position: "relative" }}>
          <Box px={{ xs: 2, sm: 4 }} py={{ xs: 6, md: 10 }} maxWidth={1280} mx="auto">
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
              sx={{
                opacity: 0,
                backgroundImage: (theme) =>
                  `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 50%, ${theme.palette.primary.main} 100%)`,
                backgroundSize: "200% auto",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                animationName: `${fadeInUp}, ${shimmer}`,
                animationDuration: "0.9s, 6s",
                animationDelay: "0.1s, 1s",
                animationIterationCount: "1, infinite",
                animationFillMode: "forwards, forwards",
                animationTimingFunction: "ease-out, linear",
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
              sx={{
                opacity: 0,
                animation: `${fadeInUp} 0.9s ease-out 0.3s forwards`,
              }}
            >
              {t("pages.landing.hero.subtitle")}
            </Typography>
            <Box
              display="flex"
              justifyContent="center"
              mt={4}
              sx={{
                opacity: 0,
                animation: `${fadeInUp} 0.9s ease-out 0.5s forwards`,
              }}
            >
              <Button
                variant="contained"
                component={Link}
                to="/requests"
                endIcon={
                  <ArrowForwardIcon
                    className="cta-arrow"
                    sx={{ transition: "transform 0.3s ease" }}
                  />
                }
                sx={{
                  px: { xs: 3.5, md: 5 },
                  py: { xs: 1.25, md: 1.75 },
                  fontSize: { xs: "1rem", md: "1.1rem" },
                  fontWeight: 600,
                  letterSpacing: 0.3,
                  textTransform: "none",
                  borderRadius: 999,
                  color: "#fff",
                  backgroundImage: (theme) =>
                    `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
                  backgroundSize: "200% 200%",
                  backgroundPosition: "0% 50%",
                  animation: `${ctaPulse} 2.6s ease-in-out infinite`,
                  transition:
                    "transform 0.3s cubic-bezier(.34,1.56,.64,1), background-position 0.6s ease, box-shadow 0.3s ease",
                  "& .cta-arrow": {
                    animation: `${arrowNudge} 1.8s ease-in-out infinite`,
                  },
                  "&:hover": {
                    transform: "translateY(-3px) scale(1.03)",
                    backgroundPosition: "100% 50%",
                    boxShadow: (theme) =>
                      `0 18px 36px -10px ${theme.palette.primary.main}`,
                  },
                  "&:hover .cta-arrow": {
                    transform: "translateX(6px)",
                    animation: "none",
                  },
                  "&:active": {
                    transform: "translateY(-1px) scale(1)",
                  },
                }}
              >
                {user ? t("common.dashboard") : t("pages.landing.cta.start")}
              </Button>
            </Box>
          </Box>
        </Box>
        <Box
          sx={{
            bgcolor: "primary.main",
            position: "relative",
            mx: { xs: 1.5, sm: 0 },
            borderRadius: { xs: 3, sm: 0 },
          }}
        >
          {/* Ornament ring — top left of primary section */}
          <Box
            aria-hidden
            sx={{
              position: "absolute",
              top: { xs: 30, md: 60 },
              left: { xs: 10, md: 40 },
              width: { xs: 100, md: 180 },
              height: { xs: 100, md: 180 },
              borderRadius: "50%",
              border: "2px solid rgba(255,255,255,0.18)",
              pointerEvents: "none",
              zIndex: 0,
            }}
          />
          {/* Ornament dot grid — bottom right of primary section */}
          <Box
            aria-hidden
            sx={{
              position: "absolute",
              bottom: { xs: 30, md: 80 },
              right: { xs: 10, md: 60 },
              width: { xs: 90, md: 160 },
              height: { xs: 90, md: 160 },
              display: { xs: "none", sm: "block" },
              backgroundImage:
                "radial-gradient(circle, rgba(255,255,255,0.4) 1.2px, transparent 1.5px)",
              backgroundSize: "16px 16px",
              opacity: 0.55,
              pointerEvents: "none",
              maskImage: "radial-gradient(circle, black 40%, transparent 75%)",
              WebkitMaskImage: "radial-gradient(circle, black 40%, transparent 75%)",
              zIndex: 0,
            }}
          />
          {/* Ornament small dashed ring — mid right */}
          <Box
            aria-hidden
            sx={{
              position: "absolute",
              top: "48%",
              right: { md: 40 },
              width: { md: 70 },
              height: { md: 70 },
              display: { xs: "none", md: "block" },
              borderRadius: "50%",
              border: "2px dashed rgba(255,255,255,0.25)",
              pointerEvents: "none",
              zIndex: 0,
            }}
          />
          {/* Wavy divider — top (desktop only) */}
          <Box
            component="svg"
            viewBox="0 0 1440 120"
            preserveAspectRatio="none"
            aria-hidden
            sx={{
              display: { xs: "none", sm: "block" },
              width: "100%",
              height: { sm: 70, md: 110 },
              marginTop: "-1px",
              color: "background.default",
              verticalAlign: "bottom",
            }}
          >
            <path
              fill="currentColor"
              d="M0,56L60,45.3C120,35,240,13,360,18.7C480,24,600,56,720,61.3C840,67,960,45,1080,40C1200,35,1320,45,1380,50.7L1440,56L1440,0L1380,0C1320,0,1200,0,1080,0C960,0,840,0,720,0C600,0,480,0,360,0C240,0,120,0,60,0L0,0Z"
            />
          </Box>
          <Box
            px={{ xs: 3, sm: 4, md: 10 }}
            maxWidth={1280}
            mx="auto"
            sx={{
              position: "relative",
              zIndex: 1,
            }}
          >
            {/* Desktop & tablet: full-width hero image overlapping sections */}
            <Box
              sx={{
                display: { xs: "none", sm: "block" },
                marginTop: { sm: "-12%", md: "-20%" },
                transform: `translate3d(0, ${scrollY * -0.08}px, 0)`,
                willChange: "transform",
              }}
            >
              <Box
                component="img"
                src="/hero.png"
                alt="Preview undangan RSVP Jakcation RSVPQuick"
                sx={{
                  width: "100%",
                  display: "block",
                  opacity: 0,
                  animation: `${fadeInUp} 1.1s ease-out 0.7s forwards, ${float} 6s ease-in-out 1.8s infinite`,
                }}
              />
            </Box>
          </Box>
          <Box
            pb={{ xs: 8, md: 20 }}
            pt={{ xs: 6, md: 10 }}
            color="white"
            px={{ xs: 3, md: 4 }}
            maxWidth={1280}
            mx="auto"
          >
            <Box
              display="flex"
              gap={{ xs: 3, md: 4 }}
              justifyContent="center"
              flexWrap="wrap"
            >
              <Feature
                title={t("pages.landing.features.customize.title")}
                description={t("pages.landing.features.customize.desc")}
                icon={<DashboardCustomizeIcon fontSize="inherit" />}
                delay={1.0}
              />
              <Feature
                title={t("pages.landing.features.profile.title")}
                description={t("pages.landing.features.profile.desc")}
                icon={<QuestionMarkIcon fontSize="inherit" />}
                delay={1.2}
              />
              <Feature
                title={t("pages.landing.features.qr.title")}
                description={t("pages.landing.features.qr.desc")}
                icon={<QrCode2Icon fontSize="inherit" />}
                delay={1.4}
              />
            </Box>
          </Box>
          {/* Wavy divider — bottom (desktop only) */}
          <Box
            component="svg"
            viewBox="0 0 1440 120"
            preserveAspectRatio="none"
            aria-hidden
            sx={{
              display: { xs: "none", sm: "block" },
              width: "100%",
              height: { sm: 70, md: 110 },
              marginBottom: "-1px",
              color: "background.default",
              verticalAlign: "top",
            }}
          >
            <path
              fill="currentColor"
              d="M0,64L60,74.7C120,85,240,107,360,101.3C480,96,600,64,720,58.7C840,53,960,75,1080,80C1200,85,1320,75,1380,69.3L1440,64L1440,120L1380,120C1320,120,1200,120,1080,120C960,120,840,120,720,120C600,120,480,120,360,120C240,120,120,120,60,120L0,120Z"
            />
          </Box>
        </Box>
      </Box>
      <Box
        px={{ xs: 2, sm: 4 }}
        py={{ xs: 8, md: 12 }}
        maxWidth={900}
        mx="auto"
        width="100%"
        sx={{ position: "relative" }}
      >
        {/* Small dashed ring ornament — top right */}
        <Box
          aria-hidden
          sx={{
            position: "absolute",
            top: { xs: 20, md: 40 },
            right: { xs: 8, md: 24 },
            width: { xs: 50, md: 80 },
            height: { xs: 50, md: 80 },
            borderRadius: "50%",
            border: (theme) => `2px dashed ${theme.palette.primary.main}`,
            opacity: 0.2,
            pointerEvents: "none",
            display: { xs: "none", sm: "block" },
            zIndex: 0,
          }}
        />
        {/* Dot cluster ornament — bottom left */}
        <Box
          aria-hidden
          sx={{
            position: "absolute",
            bottom: { xs: 20, md: 40 },
            left: { xs: 8, md: 24 },
            width: { xs: 70, md: 110 },
            height: { xs: 70, md: 110 },
            display: { xs: "none", sm: "block" },
            backgroundImage: (theme) =>
              `radial-gradient(circle, ${theme.palette.primary.main} 1.2px, transparent 1.5px)`,
            backgroundSize: "14px 14px",
            opacity: 0.18,
            pointerEvents: "none",
            maskImage: "radial-gradient(circle, black 40%, transparent 75%)",
            WebkitMaskImage: "radial-gradient(circle, black 40%, transparent 75%)",
            zIndex: 0,
          }}
        />
        <Box sx={{ position: "relative", zIndex: 1 }}>
        <Typography
          component="h2"
          variant="h3"
          fontWeight="bold"
          textAlign="center"
          color="primary.main"
          fontSize={{ xs: "1.75rem", md: "2.5rem" }}
          sx={{
            opacity: 0,
            animation: `${fadeInUp} 0.8s ease-out forwards`,
          }}
        >
          {t("pages.landing.faq.title")}
        </Typography>
        <Typography
          textAlign="center"
          mt={1}
          mb={5}
          color="text.secondary"
          sx={{
            opacity: 0,
            animation: `${fadeInUp} 0.8s ease-out 0.15s forwards`,
          }}
        >
          {t("pages.landing.faq.subtitle")}
        </Typography>
        <Box>
          {[1, 2, 3, 4, 5, 6].map((n, idx) => (
            <Accordion
              key={n}
              defaultExpanded={n === 1}
              disableGutters
              elevation={0}
              sx={{
                mb: 1.5,
                border: (theme) => `1px solid ${theme.palette.divider}`,
                borderRadius: 2,
                overflow: "hidden",
                "&:before": { display: "none" },
                opacity: 0,
                animation: `${fadeInUp} 0.7s ease-out ${0.2 + idx * 0.1}s forwards`,
                transition: "box-shadow 0.25s ease, border-color 0.25s ease",
                "&:hover": {
                  boxShadow: 2,
                  borderColor: (theme) => theme.palette.primary.main,
                },
                "&.Mui-expanded": {
                  borderColor: (theme) => theme.palette.primary.main,
                  boxShadow: 3,
                },
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                sx={{
                  px: { xs: 2, md: 3 },
                  py: 1,
                  "& .MuiAccordionSummary-content": { my: 1.5 },
                }}
              >
                <Typography fontWeight="bold" fontSize={{ xs: 15, md: 17 }}>
                  {t(`pages.landing.faq.q${n}.q`)}
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ px: { xs: 2, md: 3 }, pb: 2.5, pt: 0 }}>
                <Typography color="text.secondary" lineHeight={1.7}>
                  {t(`pages.landing.faq.q${n}.a`)}
                </Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
        </Box>
      </Box>
      <Box component="footer" bgcolor="primary.main" color="white" py={4} px={2}>
        <Box
          display="flex"
          gap={{ xs: 2, md: 4 }}
          justifyContent="center"
          alignItems="center"
          flexWrap="wrap"
          mb={2}
        >
          <img src="https://disparekraf.jakarta.go.id/jakartatourism-be/storage/jaktour/images/site-config/logo_dark/zYEVgsSVjHTy8QRV8QQGMNkcboTR3o4YmFgBmBrM.png" width={100} alt="Disparekraf Jakarta" />
        </Box>
        <Box
          display="flex"
          gap={{ xs: 2, sm: 3 }}
          justifyContent="center"
          alignItems="center"
          flexWrap="wrap"
          sx={{
            "& a": {
              color: "white",
              opacity: 0.85,
              textDecoration: "none",
              fontSize: "0.9rem",
              transition: "opacity 0.2s ease",
              "&:hover": { opacity: 1, textDecoration: "underline" },
            },
          }}
        >
          <Link to="/privacy">{t("pages.landing.footer.privacy")}</Link>
          <Box sx={{ opacity: 0.5 }}>·</Box>
          <Link to="/terms">{t("pages.landing.footer.terms")}</Link>
        </Box>
        <Typography
          textAlign="center"
          mt={2}
          sx={{ color: "white", opacity: 0.7, fontSize: "0.8rem" }}
        >
          © {new Date().getFullYear()} Jakcation RSVPQuick. {t("pages.landing.footer.rights")}
        </Typography>
      </Box>

      {/* Scroll-to-top floating button with scroll progress ring */}
      <Box
        aria-hidden={!showScrollTop}
        sx={{
          position: "fixed",
          bottom: { xs: 16, sm: 24, md: 32 },
          right: { xs: 16, sm: 24, md: 32 },
          zIndex: 1300,
          opacity: showScrollTop ? 1 : 0,
          transform: showScrollTop
            ? "translateY(0) scale(1)"
            : "translateY(16px) scale(0.85)",
          pointerEvents: showScrollTop ? "auto" : "none",
          transition:
            "opacity 0.3s ease, transform 0.35s cubic-bezier(.34,1.56,.64,1)",
        }}
      >
        <Box
          sx={{
            position: "relative",
            display: "inline-flex",
            width: { xs: 52, md: 60 },
            height: { xs: 52, md: 60 },
          }}
        >
          {/* Track (background circle) */}
          <CircularProgress
            variant="determinate"
            value={100}
            size="100%"
            thickness={3}
            sx={{
              color: (theme) =>
                theme.palette.mode === "dark"
                  ? "rgba(255,255,255,0.12)"
                  : "rgba(0,0,0,0.08)",
              position: "absolute",
              top: 0,
              left: 0,
            }}
          />
          {/* Progress indicator */}
          <CircularProgress
            variant="determinate"
            value={scrollProgress}
            size="100%"
            thickness={3}
            sx={{
              color: "primary.main",
              position: "absolute",
              top: 0,
              left: 0,
              transition: "transform 0.2s ease",
            }}
          />
          <IconButton
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            aria-label="Kembali ke atas"
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: { xs: 40, md: 46 },
              height: { xs: 40, md: 46 },
              bgcolor: "primary.main",
              color: "primary.contrastText",
              boxShadow: 3,
              transition: "background-color 0.2s ease, transform 0.2s ease",
              "&:hover": {
                bgcolor: "primary.dark",
                transform: "translate(-50%, -50%) scale(1.08)",
              },
              "&:active": {
                transform: "translate(-50%, -50%) scale(0.95)",
              },
            }}
          >
            <KeyboardArrowUpIcon />
          </IconButton>
        </Box>
      </Box>
    </Stack>
  );
}
