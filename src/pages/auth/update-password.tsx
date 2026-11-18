import { useState } from "react";
import {
  Alert,
  Button,
  Card,
  CardContent,
  Stack,
  Typography,
} from "@mui/material";
import { useUpdatePassword, useTranslate } from "@refinedev/core";
import { AppIcon } from "../../components/app-icon";
import PasswordField from "../../components/password-field";
import AuthShell from "./auth-shell";
import Seo from "../../components/seo";

export default function UpdatePasswordPage() {
  const { mutate: updatePassword, isLoading } = useUpdatePassword<{
    password: string;
  }>();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [mismatch, setMismatch] = useState(false);
  const t = useTranslate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      setMismatch(true);
      return;
    }
    setMismatch(false);
    updatePassword({ password });
  };

  return (
    <AuthShell>
      <Seo title="Ubah Password" description="Perbarui password akun RSVPQuick Anda." noindex />
      <Card sx={{ maxWidth: 420, width: "100%" }}>
        <CardContent sx={{ p: 4 }}>
          <Stack alignItems="center" mb={3}>
            <AppIcon />
            <Typography variant="h5" fontWeight="bold" mt={1}>
              {t("pages.updatePassword.heading")}
            </Typography>
            <Typography variant="caption" color="text.secondary" textAlign="center" mt={1}>
              {t("pages.updatePassword.subtitle")}
            </Typography>
          </Stack>
          {mismatch && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {t("pages.updatePassword.errors.mismatch")}
            </Alert>
          )}
          <form onSubmit={handleSubmit}>
            <Stack gap={2}>
              <PasswordField
                label={t("pages.updatePassword.fields.password")}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                fullWidth
                autoFocus
                required
                helperText={t("pages.updatePassword.passwordHelp")}
                autoComplete="new-password"
              />
              <PasswordField
                label={t("pages.updatePassword.fields.confirm")}
                value={confirm}
                onChange={(e) => {
                  setConfirm(e.target.value);
                  if (mismatch) setMismatch(false);
                }}
                fullWidth
                required
                error={mismatch}
                autoComplete="new-password"
              />
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={isLoading}
              >
                {isLoading
                  ? t("pages.updatePassword.buttons.saving")
                  : t("pages.updatePassword.buttons.save")}
              </Button>
            </Stack>
          </form>
        </CardContent>
      </Card>
    </AuthShell>
  );
}
