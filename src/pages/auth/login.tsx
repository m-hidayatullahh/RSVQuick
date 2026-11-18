import { useRef, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Link as MuiLink,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useLogin, useTranslate } from "@refinedev/core";
import { Link } from "react-router-dom";
import { AppIcon } from "../../components/app-icon";
import PasswordField from "../../components/password-field";
import AuthShell from "./auth-shell";
import Seo from "../../components/seo";
import Captcha, { captchaEnabled, type CaptchaHandle } from "../../components/captcha";

export default function LoginPage() {
  const { mutate: login, isLoading } = useLogin<{
    email: string;
    password: string;
    captchaToken?: string;
  }>();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [captchaError, setCaptchaError] = useState<string | null>(null);
  const captchaRef = useRef<CaptchaHandle>(null);
  const t = useTranslate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (captchaEnabled && !captchaToken) {
      setCaptchaError(t("captcha.required"));
      return;
    }
    setCaptchaError(null);
    login(
      { email: email.trim(), password, captchaToken: captchaToken ?? undefined },
      {
        onError: () => captchaRef.current?.reset(),
      },
    );
  };

  return (
    <AuthShell>
      <Seo
        title="Masuk"
        description="Masuk ke akun RSVPQuick untuk membuat dan mengelola undangan RSVP Anda."
        noindex
      />
      <Card sx={{ maxWidth: 420, width: "100%" }}>
        <CardContent sx={{ p: 4 }}>
          <Stack alignItems="center" mb={3}>
            <AppIcon />
            <Typography variant="h5" fontWeight="bold" mt={1}>
              {t("pages.login.heading")}
            </Typography>
          </Stack>
          <form onSubmit={handleSubmit}>
            <Stack gap={2}>
              <TextField
                label={t("pages.login.fields.email")}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                fullWidth
                autoFocus
                required
                autoComplete="email"
              />
              <PasswordField
                label={t("pages.login.fields.password")}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                fullWidth
                required
                autoComplete="current-password"
              />
              <Box textAlign="right">
                <MuiLink component={Link} to="/forgot-password" variant="caption">
                  {t("pages.login.buttons.forgotPassword")}
                </MuiLink>
              </Box>
              <Captcha ref={captchaRef} onToken={setCaptchaToken} />
              {captchaError && <Alert severity="warning">{captchaError}</Alert>}
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={isLoading}
              >
                {isLoading ? t("common.processing") : t("pages.login.buttons.submit")}
              </Button>
              <Typography variant="caption" textAlign="center" color="text.secondary">
                {t("pages.login.buttons.noAccount")}{" "}
                <MuiLink component={Link} to="/register">
                  {t("pages.login.signup")}
                </MuiLink>
              </Typography>
            </Stack>
          </form>
        </CardContent>
      </Card>
    </AuthShell>
  );
}
