import React from "react";
import { Link } from "react-router-dom";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useTranslate } from "@refinedev/core";
import { AppIcon } from "../../components/app-icon";
import ScrollToTop from "../../components/scroll-to-top";

interface LegalShellProps {
  title: string;
  children: React.ReactNode;
}

export default function LegalShell({ title, children }: LegalShellProps) {
  const t = useTranslate();
  return (
    <Box bgcolor="background.default" color="text.primary" minHeight="100vh">
      <Container maxWidth="md" sx={{ py: { xs: 4, md: 8 } }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <AppIcon size={80} />
          <Button
            component={Link}
            to="/"
            variant="outlined"
            size="small"
            startIcon={<ArrowBackIcon />}
          >
            {t("pages.legal.back")}
          </Button>
        </Box>
        <Typography variant="h3" fontWeight="bold" gutterBottom>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {t("pages.legal.updated")}: {t("pages.legal.updatedAt")}
        </Typography>
        <Divider sx={{ my: 3 }} />
        <Box
          sx={{
            "& h2": { mt: 4, mb: 1.5, fontSize: "1.4rem", fontWeight: 700 },
            "& p": { mb: 2, lineHeight: 1.75 },
            "& ul": { pl: 3, mb: 2 },
            "& li": { mb: 0.5, lineHeight: 1.7 },
          }}
        >
          {children}
        </Box>
      </Container>
      <ScrollToTop />
    </Box>
  );
}
