import { useState } from "react";
import {
  Alert,
  Button,
  Card,
  CardContent,
  Stack,
  Typography,
} from "@mui/material";
import { useUpdatePassword } from "@refinedev/core";
import { AppIcon } from "../../components/app-icon";
import PasswordField from "../../components/password-field";
import AuthShell from "./auth-shell";

export default function UpdatePasswordPage() {
  const { mutate: updatePassword, isLoading } = useUpdatePassword<{
    password: string;
  }>();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [mismatch, setMismatch] = useState(false);

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
      <Card sx={{ maxWidth: 420, width: "100%" }}>
        <CardContent sx={{ p: 4 }}>
          <Stack alignItems="center" mb={3}>
            <AppIcon />
            <Typography variant="h5" fontWeight="bold" mt={1}>
              Password Baru
            </Typography>
            <Typography variant="caption" color="text.secondary" textAlign="center" mt={1}>
              Masukkan password baru untuk akun Anda.
            </Typography>
          </Stack>
          {mismatch && (
            <Alert severity="error" sx={{ mb: 2 }}>
              Password tidak cocok dengan konfirmasi.
            </Alert>
          )}
          <form onSubmit={handleSubmit}>
            <Stack gap={2}>
              <PasswordField
                label="Password Baru"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                fullWidth
                autoFocus
                required
                helperText="Minimal 6 karakter"
                autoComplete="new-password"
              />
              <PasswordField
                label="Konfirmasi Password"
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
                {isLoading ? "Menyimpan..." : "Simpan Password"}
              </Button>
            </Stack>
          </form>
        </CardContent>
      </Card>
    </AuthShell>
  );
}
