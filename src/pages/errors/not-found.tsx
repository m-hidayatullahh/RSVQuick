import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import HomeIcon from "@mui/icons-material/Home";
import { Link } from "react-router-dom";
import { keyframes } from "@emotion/react";
import { useTranslate } from "@refinedev/core";
import { AppIcon } from "../../components/app-icon";
import Seo from "../../components/seo";

const float = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-14px); }
`;

export default function NotFoundPage() {
  const t = useTranslate();
  return (
    <Box
      minHeight="100vh"
      bgcolor="background.default"
      color="text.primary"
      display="flex"
      alignItems="center"
      justifyContent="center"
      px={2}
      sx={{ position: "relative", overflow: "hidden" }}
    >
      <Seo title={t("pages.error.heading")} noindex />

      {/* Ornament blobs */}
      <Box
        aria-hidden
        sx={{
          position: "absolute",
          top: { xs: -80, md: -120 },
          right: { xs: -80, md: -120 },
          width: { xs: 240, md: 360 },
          height: { xs: 240, md: 360 },
          borderRadius: "50%",
          background: (theme) =>
            `radial-gradient(circle, ${theme.palette.primary.main}22 0%, transparent 70%)`,
        }}
      />
      <Box
        aria-hidden
        sx={{
          position: "absolute",
          bottom: { xs: -80, md: -120 },
          left: { xs: -80, md: -120 },
          width: { xs: 240, md: 360 },
          height: { xs: 240, md: 360 },
          borderRadius: "50%",
          background: (theme) =>
            `radial-gradient(circle, ${theme.palette.primary.main}1a 0%, transparent 70%)`,
        }}
      />

      <Stack
        spacing={3}
        alignItems="center"
        maxWidth={520}
        textAlign="center"
        sx={{ position: "relative", zIndex: 1 }}
      >
        <Box sx={{ animation: `${float} 4s ease-in-out infinite` }}>
          <AppIcon size={100} />
        </Box>
        <Typography
          variant="h1"
          fontWeight={800}
          color="primary.main"
          sx={{
            fontSize: { xs: "5rem", md: "7rem" },
            lineHeight: 1,
            letterSpacing: "-0.04em",
          }}
        >
          404
        </Typography>
        <Typography variant="h5" fontWeight={700}>
          {t("pages.error.heading")}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {t("pages.error.body")}
        </Typography>
        <Button
          component={Link}
          to="/"
          variant="contained"
          size="large"
          startIcon={<HomeIcon />}
          sx={{
            borderRadius: 999,
            px: 4,
            py: 1.25,
            textTransform: "none",
            fontWeight: 600,
          }}
        >
          {t("pages.error.homeButton")}
        </Button>
      </Stack>
    </Box>
  );
}
