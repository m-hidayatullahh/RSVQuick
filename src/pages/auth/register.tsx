import { useRef, useState } from "react";
import {
  Alert,
  Button,
  Card,
  CardContent,
  Link as MuiLink,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useRegister, useTranslate } from "@refinedev/core";
import { Link } from "react-router-dom";
import { AppIcon } from "../../components/app-icon";
import PasswordField from "../../components/password-field";
import AuthShell from "./auth-shell";
import Seo from "../../components/seo";
import Captcha, { captchaEnabled, type CaptchaHandle } from "../../components/captcha";

export default function RegisterPage() {
  const { mutate: register, isLoading } = useRegister<{
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
    register(
      { email: email.trim(), password, captchaToken: captchaToken ?? undefined },
      {
        onError: () => captchaRef.current?.reset(),
      },
    );
  };

  return (
    <AuthShell>
      <Seo
        title="Daftar Akun"
        description="Buat akun RSVPQuick gratis untuk mulai mengelola undangan RSVP Anda secara online."
      />
      <Card sx={{ maxWidth: 420, width: "100%" }}>
        <CardContent sx={{ p: 4 }}>
          <Stack alignItems="center" mb={3}>
            <AppIcon />
            <Typography variant="h5" fontWeight="bold" mt={1}>
              {t("pages.register.heading")}
            </Typography>
          </Stack>
          <form onSubmit={handleSubmit}>
            <Stack gap={2}>
              <TextField
                label={t("pages.register.fields.email")}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                fullWidth
                autoFocus
                required
                autoComplete="email"
              />
              <PasswordField
                label={t("pages.register.fields.password")}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                fullWidth
                required
                helperText={t("pages.register.passwordHelp")}
                autoComplete="new-password"
              />
              <Captcha ref={captchaRef} onToken={setCaptchaToken} />
              {captchaError && <Alert severity="warning">{captchaError}</Alert>}
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={isLoading}
              >
                {isLoading ? t("common.processing") : t("pages.register.buttons.submit")}
              </Button>
              <Typography variant="caption" textAlign="center" color="text.secondary">
                {t("pages.register.buttons.haveAccount")}{" "}
                <MuiLink component={Link} to="/login">
                  {t("pages.register.signin")}
                </MuiLink>
              </Typography>
            </Stack>
          </form>
        </CardContent>
      </Card>
    </AuthShell>
  );
}
