import React, { useEffect, useState } from "react";
import {
  Box,
  Chip,
  CircularProgress,
  MenuItem,
  Select,
  Stack,
  Typography,
  Alert,
} from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { DateField } from "@refinedev/mui";
import { useGetIdentity, useNotification } from "@refinedev/core";
import { useNavigate } from "react-router-dom";
import { IUser } from "../../components/header";
import { supabaseClient } from "../../utility";
import { IProfile } from "../../utility/types";

export default function AdminUsersPage() {
  const { data: identity } = useGetIdentity<IUser>();
  const { open } = useNotification();
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState<IProfile[]>([]);
  const [loading, setLoading] = useState(true);

  const isAdmin = identity?.role === "admin";

  const loadProfiles = async () => {
    setLoading(true);
    const { data, error } = await (supabaseClient as any)
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error) setProfiles(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    if (identity === undefined) return; // still loading identity
    if (!isAdmin) {
      navigate("/requests", { replace: true });
      return;
    }
    loadProfiles();
  }, [identity, isAdmin]);

  const handleRoleChange = async (profileId: string, newRole: "admin" | "user") => {
    const { error } = await (supabaseClient as any)
      .from("profiles")
      .update({ role: newRole, updated_at: new Date().toISOString() })
      .eq("id", profileId);

    if (error) {
      open?.({ type: "error", key: "role-err", message: "Gagal mengubah role", description: error.message });
    } else {
      setProfiles((prev) =>
        prev.map((p) => (p.id === profileId ? { ...p, role: newRole } : p))
      );
      open?.({ type: "success", key: "role-ok", message: "Role berhasil diubah", description: "" });
    }
  };

  const columns: GridColDef[] = [
    { field: "email", headerName: "Email", flex: 1, minWidth: 220 },
    { field: "full_name", headerName: "Nama Lengkap", flex: 1, minWidth: 160 },
    {
      field: "role",
      headerName: "Role",
      minWidth: 140,
      renderCell: ({ row }) => (
        <Select
          value={row.role ?? "user"}
          size="small"
          onChange={(e) => handleRoleChange(row.id, e.target.value as "admin" | "user")}
          disabled={row.id === identity?.id}
          sx={{ minWidth: 100 }}
        >
          <MenuItem value="user">User</MenuItem>
          <MenuItem value="admin">Admin</MenuItem>
        </Select>
      ),
    },
    {
      field: "created_at",
      headerName: "Bergabung",
      minWidth: 160,
      renderCell: ({ value }) => (
        <DateField value={value} format="DD MMM YYYY HH:mm" />
      ),
    },
  ];

  if (identity === undefined) {
    return (
      <Box display="flex" justifyContent="center" mt={8}>
        <CircularProgress />
      </Box>
    );
  }

  if (!isAdmin) {
    return (
      <Box p={3}>
        <Alert severity="error">
          Halaman ini hanya untuk admin. Hubungi administrator untuk mendapatkan akses.
        </Alert>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Stack direction="row" alignItems="center" gap={2} mb={3}>
        <Typography variant="h5" fontWeight="bold">
          Kelola Pengguna
        </Typography>
        <Chip label={`${profiles.length} pengguna`} size="small" color="primary" />
      </Stack>

      {loading ? (
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress />
        </Box>
      ) : (
        <DataGrid
          rows={profiles}
          columns={columns}
          autoHeight
          pageSizeOptions={[25, 50, 100]}
          initialState={{ pagination: { paginationModel: { pageSize: 25 } } }}
          disableRowSelectionOnClick
        />
      )}
    </Box>
  );
}
