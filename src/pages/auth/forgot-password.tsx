import { useEffect, useRef, useState } from "react";
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
import { useForgotPassword, useTranslate } from "@refinedev/core";
import { Link } from "react-router-dom";
import { AppIcon } from "../../components/app-icon";
import AuthShell from "./auth-shell";
import Seo from "../../components/seo";
import Captcha, { captchaEnabled, type CaptchaHandle } from "../../components/captcha";

const COOLDOWN_SECONDS = 60;
const COOLDOWN_KEY = "forgot-password-cooldown-until";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPasswordPage() {
  const { mutate: forgotPassword, isLoading } = useForgotPassword<{
    email: string;
    captchaToken?: string;
  }>();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [cooldownLeft, setCooldownLeft] = useState(0);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [captchaError, setCaptchaError] = useState<string | null>(null);
  const captchaRef = useRef<CaptchaHandle>(null);
  const t = useTranslate();

  useEffect(() => {
    const raw = localStorage.getItem(COOLDOWN_KEY);
    if (raw) {
      const until = parseInt(raw, 10);
      const left = Math.max(0, Math.ceil((until - Date.now()) / 1000));
      setCooldownLeft(left);
    }
  }, []);

  useEffect(() => {
    if (cooldownLeft <= 0) return;
    const tick = setInterval(() => {
      setCooldownLeft((prev) => {
        const next = prev - 1;
        if (next <= 0) {
          localStorage.removeItem(COOLDOWN_KEY);
          return 0;
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(tick);
  }, [cooldownLeft]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    setErrorMsg(null);
    setSubmitted(null);
    setCaptchaError(null);

    if (!trimmed) {
      setErrorMsg(t("pages.forgotPassword.errors.requiredEmail"));
      return;
    }
    if (!EMAIL_RE.test(trimmed)) {
      setErrorMsg(t("pages.forgotPassword.errors.validEmail"));
      return;
    }
    if (cooldownLeft > 0) {
      setErrorMsg(t("pages.forgotPassword.errors.cooldown", { seconds: cooldownLeft }));
      return;
    }
    if (captchaEnabled && !captchaToken) {
      setCaptchaError(t("captcha.required"));
      return;
    }

    forgotPassword(
      { email: trimmed, captchaToken: captchaToken ?? undefined },
      {
        onSuccess: () => {
          setSubmitted(trimmed);
          const until = Date.now() + COOLDOWN_SECONDS * 1000;
          localStorage.setItem(COOLDOWN_KEY, String(until));
          setCooldownLeft(COOLDOWN_SECONDS);
          captchaRef.current?.reset();
        },
        onError: (err: any) => {
          const msg =
            err?.message ??
            err?.error?.message ??
            err?.name ??
            t("pages.forgotPassword.errors.genericFailure");
          setErrorMsg(msg);
          captchaRef.current?.reset();
        },
      }
    );
  };

  return (
    <AuthShell>
      <Seo
        title="Lupa Password"
        description="Reset password akun RSVPQuick Anda dengan mudah."
        noindex
      />
      <Card sx={{ maxWidth: 420, width: "100%" }}>
        <CardContent sx={{ p: 4 }}>
          <Stack alignItems="center" mb={3}>
            <AppIcon />
            <Typography variant="h5" fontWeight="bold" mt={1}>
              {t("pages.forgotPassword.heading")}
            </Typography>
            <Typography variant="caption" color="text.secondary" textAlign="center" mt={1}>
              {t("pages.forgotPassword.subtitle")}
            </Typography>
          </Stack>

          {submitted && (
            <Alert severity="success" sx={{ mb: 2 }}>
              <strong>{t("pages.forgotPassword.successTitle")}</strong>
              <br />
              {t("pages.forgotPassword.successBody", { email: submitted })}
            </Alert>
          )}
          {errorMsg && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errorMsg}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Stack gap={2}>
              <TextField
                label={t("pages.forgotPassword.fields.email")}
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errorMsg) setErrorMsg(null);
                }}
                fullWidth
                autoFocus
                required
                autoComplete="email"
                disabled={isLoading}
              />
              <Captcha ref={captchaRef} onToken={setCaptchaToken} />
              {captchaError && <Alert severity="warning">{captchaError}</Alert>}
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={isLoading || cooldownLeft > 0}
              >
                {isLoading
                  ? t("pages.forgotPassword.buttons.sending")
                  : cooldownLeft > 0
                  ? t("pages.forgotPassword.buttons.waitCooldown", { seconds: cooldownLeft })
                  : submitted
                  ? t("pages.forgotPassword.buttons.resend")
                  : t("pages.forgotPassword.buttons.sendReset")}
              </Button>
              <Typography variant="caption" textAlign="center" color="text.secondary">
                {t("pages.forgotPassword.buttons.rememberPassword")}{" "}
                <MuiLink component={Link} to="/login">
                  {t("pages.forgotPassword.buttons.backToLogin")}
                </MuiLink>
              </Typography>
            </Stack>
          </form>
        </CardContent>
      </Card>
    </AuthShell>
  );
}
