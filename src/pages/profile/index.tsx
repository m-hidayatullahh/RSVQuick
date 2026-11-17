import React, { useEffect, useRef, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  CircularProgress,
  Divider,
  IconButton,
  LinearProgress,
  Stack,
  TextField,
  Typography,
  Alert,
} from "@mui/material";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import { useGetIdentity, useNotification } from "@refinedev/core";
import PasswordField from "../../components/password-field";
import { IUser } from "../../components/header";
import { supabaseClient } from "../../utility";
import { v4 as uuidv4 } from "uuid";

export default function ProfilePage() {
  const { data: user, refetch } = useGetIdentity<IUser>();
  const { open } = useNotification();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [fullName, setFullName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      const { data: authData } = await (supabaseClient as any).auth.getUser();
      if (!authData?.user) return;
      const { data: profile } = await (supabaseClient as any)
        .from("profiles")
        .select("full_name, avatar_url")
        .eq("id", authData.user.id)
        .single();
      setFullName(profile?.full_name ?? authData.user.email ?? "");
      setAvatarUrl(profile?.avatar_url ?? null);
      setLoading(false);
    };
    loadProfile();
  }, []);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      open?.({ type: "error", key: "av-type", message: "Format tidak didukung", description: "Gunakan JPG, PNG, atau WebP." });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      open?.({ type: "error", key: "av-size", message: "File terlalu besar", description: "Maks 5 MB." });
      return;
    }
    setUploadingAvatar(true);
    try {
      const { data: authData } = await (supabaseClient as any).auth.getUser();
      const userId = authData?.user?.id;
      const ext = file.name.split(".").pop();
      const path = `${userId}/${uuidv4()}.${ext}`;

      const { error: uploadError } = await (supabaseClient as any).storage
        .from("avatars")
        .upload(path, file, { upsert: true });
      if (uploadError) throw uploadError;

      const { data: urlData } = (supabaseClient as any).storage
        .from("avatars")
        .getPublicUrl(path);
      const url = urlData?.publicUrl as string;

      await (supabaseClient as any)
        .from("profiles")
        .update({ avatar_url: url, updated_at: new Date().toISOString() })
        .eq("id", userId);

      setAvatarUrl(url);
      refetch?.();
      open?.({ type: "success", key: "av-ok", message: "Foto profil diperbarui", description: "" });
    } catch (err: any) {
      open?.({ type: "error", key: "av-err", message: "Gagal mengunggah foto", description: err?.message ?? "" });
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    try {
      const { data: authData } = await (supabaseClient as any).auth.getUser();
      await (supabaseClient as any)
        .from("profiles")
        .update({ full_name: fullName, updated_at: new Date().toISOString() })
        .eq("id", authData?.user?.id);
      refetch?.();
      open?.({ type: "success", key: "prof-ok", message: "Profil disimpan", description: "" });
    } catch (err: any) {
      open?.({ type: "error", key: "prof-err", message: "Gagal menyimpan", description: err?.message ?? "" });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    if (!newPassword) {
      open?.({ type: "error", key: "pw-empty", message: "Password baru harus diisi", description: "" });
      return;
    }
    if (newPassword !== confirmPassword) {
      open?.({ type: "error", key: "pw-mismatch", message: "Password tidak cocok", description: "" });
      return;
    }
    if (newPassword.length < 6) {
      open?.({ type: "error", key: "pw-short", message: "Password min. 6 karakter", description: "" });
      return;
    }
    setSavingPassword(true);
    try {
      const { error } = await (supabaseClient as any).auth.updateUser({ password: newPassword });
      if (error) throw error;
      setNewPassword("");
      setConfirmPassword("");
      open?.({ type: "success", key: "pw-ok", message: "Password berhasil diubah", description: "" });
    } catch (err: any) {
      open?.({ type: "error", key: "pw-err", message: "Gagal mengubah password", description: err?.message ?? "" });
    } finally {
      setSavingPassword(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={8}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box maxWidth={500} mx="auto" p={3}>
      <Typography variant="h5" fontWeight="bold" mb={3}>
        Profil Saya
      </Typography>

      {/* Avatar */}
      <Stack alignItems="center" gap={2} mb={3}>
        <Box position="relative">
          <Avatar
            src={avatarUrl ?? undefined}
            sx={{ width: 100, height: 100, fontSize: 40 }}
          >
            {fullName?.[0]?.toUpperCase()}
          </Avatar>
          <IconButton
            size="small"
            sx={{
              position: "absolute",
              bottom: 0,
              right: 0,
              bgcolor: "background.paper",
              border: "1px solid",
              borderColor: "divider",
            }}
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingAvatar}
          >
            {uploadingAvatar ? <CircularProgress size={16} /> : <PhotoCameraIcon fontSize="small" />}
          </IconButton>
          <input
            ref={fileInputRef}
            type="file"
            hidden
            accept="image/jpeg,image/png,image/webp"
            onChange={handleAvatarUpload}
          />
        </Box>
        <Typography variant="caption" color="text.secondary">
          Klik ikon kamera untuk mengubah foto (JPG/PNG/WebP, maks 5 MB)
        </Typography>
      </Stack>

      {uploadingAvatar && <LinearProgress sx={{ mb: 2 }} />}

      {/* <Alert severity="info" sx={{ mb: 2, fontSize: 12 }}>
        Pastikan bucket "avatars" sudah dibuat di Supabase Storage (public).
      </Alert> */}

      {/* Profile Info */}
      <Stack gap={2} mb={3}>
        <TextField
          label="Email"
          value={user?.name ?? ""}
          disabled
          fullWidth
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          label="Nama Lengkap"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          fullWidth
          InputLabelProps={{ shrink: true }}
        />
        <Button variant="contained" onClick={handleSaveProfile} disabled={savingProfile}>
          {savingProfile ? "Menyimpan..." : "Simpan Profil"}
        </Button>
      </Stack>

      <Divider sx={{ my: 3 }} />

      {/* Change Password */}
      <Typography variant="h6" fontWeight="bold" mb={2}>
        Ubah Password
      </Typography>
      <Stack gap={2}>
        <PasswordField
          label="Password Baru"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          fullWidth
          InputLabelProps={{ shrink: true }}
        />
        <PasswordField
          label="Konfirmasi Password Baru"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          fullWidth
          InputLabelProps={{ shrink: true }}
        />
        <Button
          variant="contained"
          color="warning"
          onClick={handleChangePassword}
          disabled={savingPassword}
        >
          {savingPassword ? "Menyimpan..." : "Ubah Password"}
        </Button>
      </Stack>
    </Box>
  );
}
