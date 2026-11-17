import { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Link as MuiLink,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useLogin } from "@refinedev/core";
import { Link } from "react-router-dom";
import { AppIcon } from "../../components/app-icon";
import PasswordField from "../../components/password-field";
import AuthShell from "./auth-shell";

export default function LoginPage() {
  const { mutate: login, isLoading } = useLogin<{
    email: string;
    password: string;
  }>();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login({ email: email.trim(), password });
  };

  return (
    <AuthShell>
      <Card sx={{ maxWidth: 420, width: "100%" }}>
        <CardContent sx={{ p: 4 }}>
          <Stack alignItems="center" mb={3}>
            <AppIcon />
            <Typography variant="h5" fontWeight="bold" mt={1}>
              Masuk ke RSVQuick
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
                autoComplete="current-password"
              />
              <Box textAlign="right">
                <MuiLink component={Link} to="/forgot-password" variant="caption">
                  Lupa password?
                </MuiLink>
              </Box>
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={isLoading}
              >
                {isLoading ? "Memproses..." : "Masuk"}
              </Button>
              <Typography variant="caption" textAlign="center" color="text.secondary">
                Belum punya akun?{" "}
                <MuiLink component={Link} to="/register">
                  Daftar
                </MuiLink>
              </Typography>
            </Stack>
          </form>
        </CardContent>
      </Card>
    </AuthShell>
  );
}
