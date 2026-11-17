import { useState } from "react";
import {
  Button,
  Card,
  CardContent,
  Link as MuiLink,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useRegister } from "@refinedev/core";
import { Link } from "react-router-dom";
import { AppIcon } from "../../components/app-icon";
import PasswordField from "../../components/password-field";
import AuthShell from "./auth-shell";

export default function RegisterPage() {
  const { mutate: register, isLoading } = useRegister<{
    email: string;
    password: string;
  }>();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    register({ email: email.trim(), password });
  };

  return (
    <AuthShell>
      <Card sx={{ maxWidth: 420, width: "100%" }}>
        <CardContent sx={{ p: 4 }}>
          <Stack alignItems="center" mb={3}>
            <AppIcon />
            <Typography variant="h5" fontWeight="bold" mt={1}>
              Daftar akun baru
            </Typography>
          </Stack>
          <form onSubmit={handleSubmit}>
            <Stack gap={2}>
              <TextField
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                fullWidth
                autoFocus
                required
                autoComplete="email"
              />
              <PasswordField
                label="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                fullWidth
                required
                helperText="Minimal 6 karakter"
                autoComplete="new-password"
              />
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={isLoading}
              >
                {isLoading ? "Memproses..." : "Daftar"}
              </Button>
              <Typography variant="caption" textAlign="center" color="text.secondary">
                Sudah punya akun?{" "}
                <MuiLink component={Link} to="/login">
                  Masuk
                </MuiLink>
              </Typography>
            </Stack>
          </form>
        </CardContent>
      </Card>
    </AuthShell>
  );
}
