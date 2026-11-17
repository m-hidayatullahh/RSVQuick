import { useEffect, useState } from "react";
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
import { useForgotPassword } from "@refinedev/core";
import { Link } from "react-router-dom";
import { AppIcon } from "../../components/app-icon";
import AuthShell from "./auth-shell";

const COOLDOWN_SECONDS = 60;
const COOLDOWN_KEY = "forgot-password-cooldown-until";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPasswordPage() {
  const { mutate: forgotPassword, isLoading } = useForgotPassword<{
    email: string;
  }>();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [cooldownLeft, setCooldownLeft] = useState(0);

  // Baca sisa cooldown dari localStorage saat mount
  useEffect(() => {
    const raw = localStorage.getItem(COOLDOWN_KEY);
    if (raw) {
      const until = parseInt(raw, 10);
      const left = Math.max(0, Math.ceil((until - Date.now()) / 1000));
      setCooldownLeft(left);
    }
  }, []);

  // Timer countdown
  useEffect(() => {
    if (cooldownLeft <= 0) return;
    const t = setInterval(() => {
      setCooldownLeft((prev) => {
        const next = prev - 1;
        if (next <= 0) {
          localStorage.removeItem(COOLDOWN_KEY);
          return 0;
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [cooldownLeft]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    setErrorMsg(null);
    setSubmitted(null);

    if (!trimmed) {
      setErrorMsg("Email harus diisi");
      return;
    }
    if (!EMAIL_RE.test(trimmed)) {
      setErrorMsg("Format email tidak valid");
      return;
    }
    if (cooldownLeft > 0) {
      setErrorMsg(`Tunggu ${cooldownLeft} detik sebelum mencoba lagi`);
      return;
    }

    forgotPassword(
      { email: trimmed },
      {
        onSuccess: () => {
          setSubmitted(trimmed);
          const until = Date.now() + COOLDOWN_SECONDS * 1000;
          localStorage.setItem(COOLDOWN_KEY, String(until));
          setCooldownLeft(COOLDOWN_SECONDS);
        },
        onError: (err: any) => {
          const msg =
            err?.message ??
            err?.error?.message ??
            err?.name ??
            "Gagal mengirim link reset. Coba lagi.";
          setErrorMsg(msg);
        },
      }
    );
  };

  return (
    <AuthShell>
      <Card sx={{ maxWidth: 420, width: "100%" }}>
        <CardContent sx={{ p: 4 }}>
          <Stack alignItems="center" mb={3}>
            <AppIcon />
            <Typography variant="h5" fontWeight="bold" mt={1}>
              Lupa password
            </Typography>
            <Typography variant="caption" color="text.secondary" textAlign="center" mt={1}>
              Masukkan email terdaftar, kami akan mengirim link reset password.
            </Typography>
          </Stack>

          {submitted && (
            <Alert severity="success" sx={{ mb: 2 }}>
              <strong>Link reset dikirim!</strong>
              <br />
              Jika <strong>{submitted}</strong> terdaftar, cek inbox email Anda
              (termasuk folder Spam/Promosi). Link berlaku 60 menit.
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
                label="Email"
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
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={isLoading || cooldownLeft > 0}
              >
                {isLoading
                  ? "Mengirim..."
                  : cooldownLeft > 0
                  ? `Tunggu ${cooldownLeft} detik`
                  : submitted
                  ? "Kirim Ulang"
                  : "Kirim Link Reset"}
              </Button>
              <Typography variant="caption" textAlign="center" color="text.secondary">
                Ingat password?{" "}
                <MuiLink component={Link} to="/login">
                  Kembali ke login
                </MuiLink>
              </Typography>
            </Stack>
          </form>
        </CardContent>
      </Card>
    </AuthShell>
  );
}
