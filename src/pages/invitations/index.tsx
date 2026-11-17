import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  LinearProgress,
  Stack,
  TextField,
  Tooltip,
  Typography,
  Alert,
} from "@mui/material";
import {
  DataGrid,
  GridColDef,
  GridRowSelectionModel,
  GridToolbarContainer,
  GridToolbarExport,
} from "@mui/x-data-grid";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import EmailIcon from "@mui/icons-material/Email";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import DownloadIcon from "@mui/icons-material/Download";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import FilterListIcon from "@mui/icons-material/FilterList";
import PersonAddAlt1OutlinedIcon from "@mui/icons-material/PersonAddAlt1Outlined";
import GroupAddOutlinedIcon from "@mui/icons-material/GroupAddOutlined";
import InputAdornment from "@mui/material/InputAdornment";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import {
  useDelete,
  useNotification,
  useOne,
} from "@refinedev/core";
import { List } from "@refinedev/mui";
import { Link, useParams } from "react-router-dom";
import { IInvitation } from "../../utility/types";
import { IRequest } from "../requests/list";
import { supabaseClient } from "../../utility";

const APP_URL = window.location.origin;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Nomor Indonesia: 10-15 digit, mulai dengan 0 (lokal) atau 62 (internasional)
// Contoh valid: 08123456789 (11) | 6281234567890 (13) | 081234567890 (12)
const WA_MIN = 10;
const WA_MAX = 15;
const WA_RE = /^(0|62)[0-9]{8,13}$/;

// Normalize: ambil digit saja, buang + / spasi / dash
const normalizeWa = (raw: string) => raw.replace(/[^0-9]/g, "");

// Validasi + pesan error spesifik untuk UI realtime
const validateWa = (raw: string): { valid: boolean; error?: string } => {
  const digits = normalizeWa(raw);
  if (!digits) return { valid: true }; // opsional
  if (digits.length < WA_MIN) {
    return { valid: false, error: `Terlalu pendek (min ${WA_MIN} digit)` };
  }
  if (digits.length > WA_MAX) {
    return { valid: false, error: `Terlalu panjang (maks ${WA_MAX} digit)` };
  }
  if (!digits.startsWith("0") && !digits.startsWith("62")) {
    return { valid: false, error: "Harus mulai dengan 0 atau 62" };
  }
  if (!WA_RE.test(digits)) {
    return { valid: false, error: "Format nomor tidak valid" };
  }
  return { valid: true };
};

// Parse a single CSV line respecting quoted fields with commas / escaped quotes
function parseCSVLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        cur += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ",") {
        out.push(cur.trim());
        cur = "";
      } else {
        cur += ch;
      }
    }
  }
  out.push(cur.trim());
  return out;
}

function CustomToolbar() {
  return (
    <GridToolbarContainer>
      <GridToolbarExport printOptions={{ disableToolbarButton: true }} />
    </GridToolbarContainer>
  );
}

export default function InvitationListPage() {
  const { id: requestId } = useParams<{ id: string }>();
  const { open } = useNotification();

  const { data: requestData } = useOne<IRequest>({
    resource: "requests",
    id: requestId,
  });
  const request = requestData?.data;

  // Auto-pagination: fetch in chunks of 1000 to bypass PostgREST max_rows cap
  const [invitations, setInvitations] = useState<IInvitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAllInvitations = async () => {
    if (!requestId) return;
    setIsLoading(true);
    try {
      const CHUNK = 1000;
      let all: IInvitation[] = [];
      let from = 0;
      while (true) {
        const { data: chunk, error } = await (supabaseClient as any)
          .from("invitations")
          .select("*")
          .eq("request_id", requestId)
          .order("created_at", { ascending: false })
          .range(from, from + CHUNK - 1);
        if (error) break;
        if (!chunk || chunk.length === 0) break;
        all = all.concat(chunk);
        if (chunk.length < CHUNK) break;
        from += CHUNK;
      }
      setInvitations(all);
    } finally {
      setIsLoading(false);
    }
  };

  const refetch = fetchAllInvitations;

  useEffect(() => {
    fetchAllInvitations();
  }, [requestId]);

  // Realtime subscription for this request's invitations
  useEffect(() => {
    if (!requestId) return;
    const channel = (supabaseClient as any)
      .channel(`invitations:${requestId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "invitations", filter: `request_id=eq.${requestId}` },
        () => {
          fetchAllInvitations();
          fetchStats();
        }
      )
      .subscribe();
    return () => {
      (supabaseClient as any).removeChannel(channel);
    };
  }, [requestId]);

  const { mutate: deleteInvitation } = useDelete();

  // Real counts (bypass PostgREST max_rows cap) — biar breakdown jelas, bukan dikira bug
  const [stats, setStats] = useState<{
    total: number;
    withEmail: number;
    emailSent: number;
    emailUnsent: number;
    withWa: number;
    waSent: number;
  } | null>(null);

  const fetchStats = async () => {
    if (!requestId) return;
    const client = supabaseClient as any;
    const q = () => client.from("invitations").select("id", { count: "exact", head: true }).eq("request_id", requestId);
    const [total, withEmail, emailSent, withWa, waSent] = await Promise.all([
      q(),
      q().not("email", "is", null),
      q().not("sent_email_at", "is", null),
      q().not("wa_number", "is", null),
      q().not("sent_wa_at", "is", null),
    ]);
    setStats({
      total: total.count ?? 0,
      withEmail: withEmail.count ?? 0,
      emailSent: emailSent.count ?? 0,
      emailUnsent: Math.max(0, (withEmail.count ?? 0) - (emailSent.count ?? 0)),
      withWa: withWa.count ?? 0,
      waSent: waSent.count ?? 0,
    });
  };

  const totalCount = stats?.total ?? null;
  useEffect(() => {
    fetchStats();
  }, [requestId]);

  const reloadInvitations = async () => {
    await refetch();
    await fetchStats();
  };

  // --- Add dialog ---
  const [openAdd, setOpenAdd] = useState(false);
  const [formData, setFormData] = useState({ name: "", jabatan: "", email: "", wa_number: "" });
  const [addLoading, setAddLoading] = useState(false);

  // --- Edit dialog ---
  const [editTarget, setEditTarget] = useState<IInvitation | null>(null);
  const [editForm, setEditForm] = useState({ name: "", jabatan: "", email: "", wa_number: "" });
  const [editLoading, setEditLoading] = useState(false);

  const openEditDialog = (row: IInvitation) => {
    setEditTarget(row);
    setEditForm({
      name: row.name ?? "",
      jabatan: row.jabatan ?? "",
      email: row.email ?? "",
      wa_number: row.wa_number ?? "",
    });
  };

  const closeEditDialog = () => {
    setEditTarget(null);
    setEditForm({ name: "", jabatan: "", email: "", wa_number: "" });
  };

  const handleUpdate = async () => {
    if (!editTarget) return;
    const name = editForm.name.trim();
    const email = editForm.email.trim();
    const wa = normalizeWa(editForm.wa_number);

    if (!name) {
      open?.({ type: "error", key: "name-req", message: "Nama harus diisi", description: "" });
      return;
    }
    if (email && !EMAIL_RE.test(email)) {
      open?.({ type: "error", key: "email-bad", message: "Format email tidak valid", description: "" });
      return;
    }
    const waCheck = validateWa(editForm.wa_number);
    if (!waCheck.valid) {
      open?.({ type: "error", key: "wa-bad", message: "Nomor WA tidak valid", description: waCheck.error ?? "" });
      return;
    }

    setEditLoading(true);
    const { data: updated, error } = await (supabaseClient as any)
      .from("invitations")
      .update({
        name,
        jabatan: editForm.jabatan.trim() || null,
        email: email || null,
        wa_number: wa || null,
      })
      .eq("id", editTarget.id)
      .select("id");
    setEditLoading(false);

    if (error) {
      open?.({ type: "error", key: "edit-err", message: "Gagal menyimpan", description: error.message });
      return;
    }
    if (!updated || updated.length === 0) {
      open?.({
        type: "error",
        key: "edit-blocked",
        message: "Perubahan tidak tersimpan",
        description: "Kemungkinan RLS policy memblokir. Cek policy UPDATE tabel 'invitations'.",
      });
      return;
    }
    closeEditDialog();
    refetch();
    open?.({ type: "success", key: "edit-ok", message: "Tamu diperbarui", description: "" });
  };

  const handleAdd = async () => {
    const name = formData.name.trim();
    const email = formData.email.trim();
    const wa = normalizeWa(formData.wa_number);

    if (!name) {
      open?.({ type: "error", key: "name-req", message: "Nama harus diisi", description: "" });
      return;
    }
    if (email && !EMAIL_RE.test(email)) {
      open?.({ type: "error", key: "email-bad", message: "Format email tidak valid", description: "" });
      return;
    }
    const waCheck = validateWa(formData.wa_number);
    if (!waCheck.valid) {
      open?.({ type: "error", key: "wa-bad", message: "Nomor WA tidak valid", description: waCheck.error ?? "" });
      return;
    }

    setAddLoading(true);
    const { error } = await (supabaseClient as any)
      .from("invitations")
      .insert({
        name,
        jabatan: formData.jabatan.trim() || null,
        email: email || null,
        wa_number: wa || null,
        request_id: requestId,
      });
    setAddLoading(false);

    if (error) {
      open?.({ type: "error", key: "add-err", message: "Gagal menambahkan", description: error.message });
      return;
    }
    setOpenAdd(false);
    setFormData({ name: "", jabatan: "", email: "", wa_number: "" });
    refetch();
    open?.({ type: "success", key: "add-ok", message: "Tamu ditambahkan", description: "" });
  };

  // --- CSV Template Download ---
  const downloadTemplate = () => {
    const rows = [
      ["name", "jabatan", "email", "wa_number"],
      ["Budi Santoso", "Direktur Utama", "budi.santoso@example.com", "628123456789"],
      ["Siti Rahmawati", "Manajer Pemasaran", "siti.rahmawati@example.com", "628198765432"],
      ["Agus Pratama, S.T.", "Kepala Divisi IT", "agus.pratama@example.com", "628711223344"],
      ["Dewi Lestari", "Staff HRD", "dewi.lestari@example.com", ""],
      ["Rangga Wijaya", "", "rangga.w@example.com", "628812345678"],
    ];
    const escape = (v: string) => {
      if (v.includes(",") || v.includes('"') || v.includes("\n")) {
        return `"${v.replace(/"/g, '""')}"`;
      }
      return v;
    };
    const csv = rows.map((r) => r.map(escape).join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "template-tamu-undangan.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    open?.({
      type: "success",
      key: "tpl-ok",
      message: "Template CSV diunduh",
      description: "Isi dengan data tamu Anda, lalu gunakan tombol Import CSV.",
    });
  };

  // --- CSV Import ---
  const csvRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);

  const handleCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    try {
      const text = await file.text();
      const lines = text.replace(/\r/g, "").split("\n").filter((l) => l.trim() !== "");
      if (!lines.length) {
        open?.({ type: "error", key: "csv-empty", message: "CSV kosong", description: "" });
        return;
      }
      // Skip header row if first column header is 'name'
      const firstCols = parseCSVLine(lines[0]);
      const start = firstCols[0]?.toLowerCase() === "name" ? 1 : 0;

      let skippedInvalid = 0;
      const rows = lines.slice(start)
        .map((line) => {
          const cols = parseCSVLine(line);
          const name = (cols[0] ?? "").trim();
          const jabatan = (cols[1] ?? "").trim();
          const email = (cols[2] ?? "").trim();
          const wa_number = (cols[3] ?? "").replace(/[^0-9]/g, "");
          if (!name) return null;
          if (email && !EMAIL_RE.test(email)) {
            skippedInvalid++;
            return null;
          }
          if (wa_number && !WA_RE.test(wa_number)) {
            skippedInvalid++;
            return null;
          }
          return {
            name,
            jabatan: jabatan || null,
            email: email || null,
            wa_number: wa_number || null,
            request_id: requestId,
          };
        })
        .filter((r): r is NonNullable<typeof r> => r !== null);

      if (rows.length > 5000) {
        open?.({ type: "error", key: "csv-limit", message: "Maks 5000 baris", description: "" });
        return;
      }
      if (!rows.length) {
        open?.({ type: "error", key: "csv-no-valid", message: "Tidak ada baris valid", description: "" });
        return;
      }

      // Batch insert 500 per request
      const BATCH = 500;
      let success = 0;
      let failed = 0;
      for (let i = 0; i < rows.length; i += BATCH) {
        const chunk = rows.slice(i, i + BATCH);
        const { error } = await (supabaseClient as any).from("invitations").insert(chunk);
        if (error) failed += chunk.length;
        else success += chunk.length;
      }
      refetch();
      open?.({
        type: failed ? "error" : "success",
        key: "csv-ok",
        message: `${success} tamu diimpor${failed ? `, ${failed} gagal` : ""}${skippedInvalid ? `, ${skippedInvalid} dilewati (format invalid)` : ""}`,
        description: "",
      });
    } catch {
      open?.({ type: "error", key: "csv-err", message: "Gagal membaca CSV", description: "" });
    } finally {
      setImporting(false);
      if (csvRef.current) csvRef.current.value = "";
    }
  };

  // --- Send Email (via edge function or mailto fallback) ---
  const [sendingEmail, setSendingEmail] = useState(false);
  const [sendingEmailIds, setSendingEmailIds] = useState<Set<string>>(new Set());

  const sendEmailTo = async (inv: IInvitation) => {
    if (!inv.email) {
      open?.({ type: "error", key: "no-email", message: "Tamu tidak memiliki email", description: "" });
      return;
    }
    setSendingEmailIds((prev) => {
      const next = new Set(prev);
      next.add(String(inv.id));
      return next;
    });
    const rsvpLink = `${APP_URL}/r/${requestId}?name=${encodeURIComponent(inv.name)}`;
    try {
      const { data, error } = await (supabaseClient as any).functions.invoke("send-invitation", {
        body: {
          invitations: [{ id: inv.id, name: inv.name, jabatan: inv.jabatan, email: inv.email, rsvpLink }],
          eventTitle: request?.title ?? "Acara",
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      const failed = (data?.results ?? []).filter((r: any) => !r.success);
      if (failed.length) throw new Error(failed[0]?.error ?? "Gagal kirim");

      const sentAt = new Date().toISOString();
      const { error: updateErr } = await (supabaseClient as any)
        .from("invitations")
        .update({ sent_email_at: sentAt })
        .eq("id", inv.id);
      if (updateErr) throw updateErr;

      // Update row lokal saja — jangan reload seluruh tabel
      setInvitations((prev) =>
        prev.map((x) => (x.id === inv.id ? { ...x, sent_email_at: sentAt } : x))
      );
      setStats((prev) =>
        prev
          ? {
              ...prev,
              emailSent: prev.emailSent + 1,
              emailUnsent: Math.max(0, prev.emailUnsent - 1),
            }
          : prev
      );
      open?.({ type: "success", key: `email-ok-${inv.id}`, message: `Email dikirim ke ${inv.email}`, description: "" });
    } catch (err: any) {
      const detail = err?.context?.error?.message ?? err?.message ?? String(err);
      open?.({
        type: "error",
        key: `email-err-${inv.id}`,
        message: "Gagal kirim email",
        description: detail,
      });
    } finally {
      setSendingEmailIds((prev) => {
        const next = new Set(prev);
        next.delete(String(inv.id));
        return next;
      });
    }
  };

  // --- Bulk send state (cancellable) ---
  const cancelSendRef = useRef(false);
  const [sendProgress, setSendProgress] = useState<{ done: number; total: number; failed: number }>({
    done: 0,
    total: 0,
    failed: 0,
  });

  const cancelSendAll = () => {
    cancelSendRef.current = true;
  };

  const sendAllEmails = async () => {
    const withEmail = invitations.filter((inv) => inv.email && !inv.sent_email_at);
    if (!withEmail.length) {
      open?.({ type: "error", key: "no-unsent", message: "Tidak ada email yang belum dikirim", description: "" });
      return;
    }
    cancelSendRef.current = false;
    setSendingEmail(true);
    setSendProgress({ done: 0, total: withEmail.length, failed: 0 });

    const BATCH_SIZE = 20;
    let totalSuccess = 0;
    let totalFailed = 0;

    try {
      for (let i = 0; i < withEmail.length; i += BATCH_SIZE) {
        if (cancelSendRef.current) break;

        const chunk = withEmail.slice(i, i + BATCH_SIZE);
        const payload = chunk.map((inv) => ({
          id: inv.id,
          name: inv.name,
          jabatan: inv.jabatan,
          email: inv.email,
          rsvpLink: `${APP_URL}/r/${requestId}?name=${encodeURIComponent(inv.name)}`,
        }));

        try {
          const { data, error } = await (supabaseClient as any).functions.invoke("send-invitation", {
            body: { invitations: payload, eventTitle: request?.title ?? "Acara" },
          });
          if (error) throw error;
          if (data?.error) throw new Error(data.error);

          const results = data?.results ?? [];
          const successIds = results.filter((r: any) => r.success).map((r: any) => r.id);
          const failedBatch = results.filter((r: any) => !r.success);

          if (successIds.length) {
            const sentAt = new Date().toISOString();
            await (supabaseClient as any)
              .from("invitations")
              .update({ sent_email_at: sentAt })
              .in("id", successIds);
          }

          totalSuccess += successIds.length;
          totalFailed += failedBatch.length;
        } catch (err: any) {
          totalFailed += chunk.length;
          // tetap lanjut ke batch berikutnya
        }

        setSendProgress({
          done: totalSuccess + totalFailed,
          total: withEmail.length,
          failed: totalFailed,
        });
      }

      await refetch();

      const wasCancelled = cancelSendRef.current;
      if (wasCancelled) {
        open?.({
          type: "error",
          key: "all-email-cancelled",
          message: "Pengiriman dibatalkan",
          description: `${totalSuccess} terkirim, ${totalFailed} gagal, sisanya tidak diproses.`,
        });
      } else if (totalFailed) {
        open?.({
          type: "error",
          key: "all-email-partial",
          message: `${totalSuccess}/${withEmail.length} email terkirim`,
          description: `${totalFailed} gagal`,
        });
      } else {
        open?.({ type: "success", key: "all-email-ok", message: `${totalSuccess} email dikirim`, description: "" });
      }
    } finally {
      cancelSendRef.current = false;
      setSendingEmail(false);
      setSendProgress({ done: 0, total: 0, failed: 0 });
    }
  };

  // --- Send WhatsApp ---
  const sendWA = async (inv: IInvitation) => {
    const rsvpLink = `${APP_URL}/r/${requestId}?name=${encodeURIComponent(inv.name)}`;
    const number = (inv.wa_number ?? "").replace(/[^0-9]/g, "");
    const msg = encodeURIComponent(
      `Assalamu'alaikum Wr. Wb.\n\nKepada Yth.\n*${inv.name}*${inv.jabatan ? `\n${inv.jabatan}` : ""}\n\nDengan hormat, kami mengundang Anda untuk hadir pada acara:\n*${request?.title ?? "Acara Kami"}*\n\nMohon konfirmasi kehadiran Anda melalui tautan berikut:\n${rsvpLink}\n\nTerima kasih.`
    );
    const url = number
      ? `https://wa.me/${number}?text=${msg}`
      : `https://wa.me/?text=${msg}`;
    window.open(url, "_blank");

    const sentAt = new Date().toISOString();
    const wasSent = !!inv.sent_wa_at;
    await (supabaseClient as any)
      .from("invitations")
      .update({ sent_wa_at: sentAt })
      .eq("id", inv.id);
    // Update row lokal saja — jangan reload seluruh tabel
    setInvitations((prev) =>
      prev.map((x) => (x.id === inv.id ? { ...x, sent_wa_at: sentAt } : x))
    );
    if (!wasSent) {
      setStats((prev) =>
        prev ? { ...prev, waSent: prev.waSent + 1 } : prev
      );
    }
  };

  // --- Delete confirmation ---
  const [deleteTarget, setDeleteTarget] = useState<IInvitation | null>(null);
  const confirmDelete = () => {
    if (!deleteTarget) return;
    deleteInvitation(
      { resource: "invitations", id: deleteTarget.id, successNotification: false },
      {
        onSuccess: () => {
          setDeleteTarget(null);
          refetch();
          open?.({ type: "success", key: "del-ok", message: "Tamu dihapus", description: "" });
        },
        onError: () => {
          open?.({ type: "error", key: "del-err", message: "Gagal menghapus", description: "" });
          setDeleteTarget(null);
        },
      }
    );
  };

  // --- Bulk delete + selection ---
  const [selection, setSelection] = useState<GridRowSelectionModel>([]);
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 50 });
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  const confirmBulkDelete = async () => {
    if (!selection.length) return;
    setBulkDeleting(true);
    const ids = selection.map(String);
    const BATCH = 200;
    let deleted = 0;
    let firstError: string | null = null;

    for (let i = 0; i < ids.length; i += BATCH) {
      const chunk = ids.slice(i, i + BATCH);
      const { data: deletedRows, error } = await (supabaseClient as any)
        .from("invitations")
        .delete()
        .in("id", chunk)
        .select("id");
      if (error) {
        if (!firstError) firstError = error.message;
      } else {
        deleted += (deletedRows?.length ?? 0);
      }
    }

    setBulkDeleting(false);
    setBulkDeleteOpen(false);
    setSelection([]);
    await reloadInvitations();

    if (deleted === 0) {
      open?.({
        type: "error",
        key: "bulk-del-blocked",
        message: "Tidak ada yang terhapus",
        description: firstError ?? "Kemungkinan RLS policy memblokir delete. Cek SQL policy untuk tabel invitations.",
      });
    } else if (deleted < ids.length) {
      open?.({
        type: "error",
        key: "bulk-del-partial",
        message: `${deleted}/${ids.length} tamu dihapus`,
        description: firstError ?? "Sebagian diblokir oleh RLS policy",
      });
    } else {
      open?.({ type: "success", key: "bulk-del-ok", message: `${deleted} tamu dihapus`, description: "" });
    }
  };

  // --- Search + status filter ---
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "email_sent" | "email_unsent" | "no_email" | "has_wa" | "no_wa"
  >("all");

  const filteredInvitations = useMemo(() => {
    const q = search.trim().toLowerCase();
    return invitations.filter((inv) => {
      // text search
      if (q) {
        const name = (inv.name ?? "").toLowerCase();
        const email = (inv.email ?? "").toLowerCase();
        const jabatan = (inv.jabatan ?? "").toLowerCase();
        if (!name.includes(q) && !email.includes(q) && !jabatan.includes(q)) return false;
      }
      // status filter
      switch (statusFilter) {
        case "email_sent":
          return !!inv.sent_email_at;
        case "email_unsent":
          return !!inv.email && !inv.sent_email_at;
        case "no_email":
          return !inv.email;
        case "has_wa":
          return !!inv.wa_number;
        case "no_wa":
          return !inv.wa_number;
        default:
          return true;
      }
    });
  }, [invitations, search, statusFilter]);

  // --- Columns ---
  const columns = useMemo<GridColDef[]>(
    () => [
      { field: "name", headerName: "Nama", flex: 1, minWidth: 150 },
      { field: "jabatan", headerName: "Jabatan", flex: 1, minWidth: 130 },
      { field: "email", headerName: "Email", flex: 1, minWidth: 180 },
      { field: "wa_number", headerName: "No. WA", minWidth: 130 },
      {
        field: "sent_email_at",
        headerName: "Email Terkirim",
        minWidth: 140,
        renderCell: ({ value }) =>
          value ? (
            <Chip label="Terkirim" size="small" color="success" />
          ) : (
            <Chip label="Belum" size="small" />
          ),
      },
      {
        field: "sent_wa_at",
        headerName: "WA Terkirim",
        minWidth: 120,
        renderCell: ({ value }) =>
          value ? (
            <Chip label="Terkirim" size="small" color="success" />
          ) : (
            <Chip label="Belum" size="small" />
          ),
      },
      {
        field: "actions",
        headerName: "AKSI",
        sortable: false,
        minWidth: 310,
        headerAlign: "center",
        align: "center",
        renderCell: ({ row }) => {
          const isSending = sendingEmailIds.has(String(row.id));
          return (
          <Stack direction="row" gap={0.5} alignItems="center">
            <Tooltip title={!row.email ? "Tamu tidak punya email" : isSending ? "Sedang mengirim..." : "Kirim Email ke tamu ini"}>
              <span>
                <Button
                  size="small"
                  variant="contained"
                  color="primary"
                  disabled={!row.email || isSending}
                  startIcon={
                    isSending ? (
                      <CircularProgress size={14} color="inherit" />
                    ) : (
                      <EmailIcon fontSize="small" />
                    )
                  }
                  onClick={() => sendEmailTo(row)}
                  sx={{ minWidth: 0, px: 1, textTransform: "none" }}
                >
                  {isSending ? "Kirim..." : "Email"}
                </Button>
              </span>
            </Tooltip>
            <Tooltip title="Kirim pesan via WhatsApp">
              <Button
                size="small"
                variant="contained"
                color="success"
                startIcon={<WhatsAppIcon fontSize="small" />}
                onClick={() => sendWA(row)}
                sx={{ minWidth: 0, px: 1, textTransform: "none" }}
              >
                WA
              </Button>
            </Tooltip>
            <Tooltip title="Edit tamu">
              <IconButton
                size="small"
                color="primary"
                onClick={() => openEditDialog(row)}
                sx={{ border: "1px solid", borderColor: "primary.main" }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Hapus tamu">
              <IconButton
                size="small"
                color="error"
                onClick={() => setDeleteTarget(row)}
                sx={{ border: "1px solid", borderColor: "error.main" }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
          );
        },
      },
    ],
    [request, requestId, refetch, sendingEmailIds]
  );

  const unsent = invitations.filter((i) => i.email && !i.sent_email_at).length;

  return (
    <List
      breadcrumb={false}
      headerButtons={() => null}
      title={
        <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap" sx={{ minWidth: 0 }}>
          <IconButton component={Link} to={`/requests/show/${requestId}`} size="small">
            <ArrowBackIcon />
          </IconButton>
          <Typography
            variant="h5"
            fontWeight="bold"
            sx={{
              fontSize: { xs: "1.1rem", sm: "1.5rem" },
              wordBreak: "break-word",
            }}
          >
            Daftar Undangan — {request?.title ?? ""}
          </Typography>
        </Stack>
      }
      wrapperProps={{ sx: { minWidth: 0, maxWidth: "100%", overflow: "hidden" } }}
      contentProps={{ sx: { minWidth: 0, overflowX: "hidden" } }}
    >

      {stats && stats.total > 0 && (
      <Box
        mb={2}
        p={2}
        sx={{
          bgcolor: "action.hover",
          borderRadius: 2,
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <Stack direction="row" alignItems="baseline" gap={1} mb={1.5} flexWrap="wrap">
          <Typography variant="h4" fontWeight="bold" color="primary">
            {stats.total}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            total tamu undangan
          </Typography>
          {totalCount !== null && totalCount > invitations.length && (
            <Chip
              label={`${invitations.length} dimuat di tabel`}
              size="small"
              color="info"
              variant="outlined"
              sx={{ ml: 1 }}
            />
          )}
        </Stack>

        {(
          <Stack gap={1.5}>
            {/* Email breakdown */}
            <Box>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.5}>
                <Typography variant="caption" fontWeight="bold">
                  Status Email
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  dari {stats.total} tamu
                </Typography>
              </Stack>
              <Stack
                direction="row"
                sx={{
                  width: "100%",
                  height: 10,
                  borderRadius: 1,
                  overflow: "hidden",
                  bgcolor: "action.disabledBackground",
                }}
              >
                <Tooltip title={`${stats.emailSent} sudah dikirim`}>
                  <Box
                    sx={{
                      width: `${(stats.emailSent / stats.total) * 100}%`,
                      bgcolor: "success.main",
                    }}
                  />
                </Tooltip>
                <Tooltip title={`${stats.emailUnsent} belum dikirim`}>
                  <Box
                    sx={{
                      width: `${(stats.emailUnsent / stats.total) * 100}%`,
                      bgcolor: "warning.main",
                    }}
                  />
                </Tooltip>
              </Stack>
              <Stack direction="row" gap={2} mt={0.5} flexWrap="wrap">
                <Stack direction="row" alignItems="center" gap={0.5}>
                  <Box sx={{ width: 10, height: 10, bgcolor: "success.main", borderRadius: 0.5 }} />
                  <Typography variant="caption">
                    {stats.emailSent} terkirim
                  </Typography>
                </Stack>
                <Stack direction="row" alignItems="center" gap={0.5}>
                  <Box sx={{ width: 10, height: 10, bgcolor: "warning.main", borderRadius: 0.5 }} />
                  <Typography variant="caption">
                    {stats.emailUnsent} belum dikirim
                  </Typography>
                </Stack>
                <Stack direction="row" alignItems="center" gap={0.5}>
                  <Box sx={{ width: 10, height: 10, bgcolor: "action.disabledBackground", borderRadius: 0.5, border: "1px solid", borderColor: "divider" }} />
                  <Typography variant="caption">
                    {Math.max(0, stats.total - stats.withEmail)} tanpa email
                  </Typography>
                </Stack>
              </Stack>
            </Box>

            {/* WA breakdown */}
            <Box>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.5}>
                <Typography variant="caption" fontWeight="bold">
                  Status WhatsApp
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  dari {stats.total} tamu
                </Typography>
              </Stack>
              <Stack
                direction="row"
                sx={{
                  width: "100%",
                  height: 10,
                  borderRadius: 1,
                  overflow: "hidden",
                  bgcolor: "action.disabledBackground",
                }}
              >
                <Tooltip title={`${stats.withWa} punya nomor WA`}>
                  <Box
                    sx={{
                      width: `${(stats.withWa / stats.total) * 100}%`,
                      bgcolor: "success.main",
                    }}
                  />
                </Tooltip>
              </Stack>
              <Stack direction="row" gap={2} mt={0.5} flexWrap="wrap">
                <Stack direction="row" alignItems="center" gap={0.5}>
                  <Box sx={{ width: 10, height: 10, bgcolor: "success.main", borderRadius: 0.5 }} />
                  <Typography variant="caption">
                    {stats.withWa} punya WA
                  </Typography>
                </Stack>
                <Stack direction="row" alignItems="center" gap={0.5}>
                  <Box sx={{ width: 10, height: 10, bgcolor: "action.disabledBackground", borderRadius: 0.5, border: "1px solid", borderColor: "divider" }} />
                  <Typography variant="caption">
                    {Math.max(0, stats.total - stats.withWa)} tanpa WA
                  </Typography>
                </Stack>
              </Stack>
            </Box>
          </Stack>
        )}
      </Box>
      )}

      {invitations.length > 0 && (
      <Alert severity="info" sx={{ mb: 2 }}>
        Format CSV: <strong>name, jabatan, email, wa_number</strong> (baris pertama boleh header). Maks 5.000 tamu.
      </Alert>
      )}

      {invitations.length > 0 && (
      <Stack direction="row" gap={1} mb={2} flexWrap="wrap">
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenAdd(true)}
        >
          Tambah Tamu
        </Button>
        <Button
          variant="outlined"
          startIcon={<DownloadIcon />}
          onClick={downloadTemplate}
        >
          Template CSV
        </Button>
        <Button
          variant="outlined"
          startIcon={<UploadFileIcon />}
          component="label"
          disabled={importing}
        >
          Import CSV
          <input ref={csvRef} type="file" hidden accept=".csv,text/csv" onChange={handleCSV} />
        </Button>
        {unsent > 0 && !sendingEmail && (
          <Button
            variant="contained"
            color="info"
            startIcon={<EmailIcon />}
            onClick={sendAllEmails}
          >
            {`Kirim ${unsent} Email`}
          </Button>
        )}
        {sendingEmail && (
          <Button
            variant="contained"
            color="warning"
            onClick={cancelSendAll}
          >
            Batalkan Pengiriman
          </Button>
        )}
        {selection.length > 0 && (
          <Button
            variant="contained"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={() => setBulkDeleteOpen(true)}
          >
            Hapus {selection.length} Terpilih
          </Button>
        )}
      </Stack>
      )}

      {invitations.length > 0 && (
      <Stack direction="row" gap={1} mb={2} alignItems="center" flexWrap="wrap">
        <TextField
          size="small"
          label="Cari tamu"
          placeholder="Nama, email, atau jabatan..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{
            flex: 1,
            width: { xs: "100%", sm: "auto" },
            minWidth: { xs: 0, sm: 280 },
            maxWidth: { xs: "100%", sm: 420 },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
            endAdornment: search ? (
              <InputAdornment position="end">
                <IconButton size="small" onClick={() => setSearch("")}>
                  <ClearIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ) : null,
          }}
        />
        <FormControl
          size="small"
          sx={{
            width: { xs: "100%", sm: "auto" },
            minWidth: { xs: 0, sm: 220 },
          }}
        >
          <InputLabel id="status-filter-label">
            <Stack direction="row" gap={0.5} alignItems="center">
              <FilterListIcon fontSize="small" />
              Filter status
            </Stack>
          </InputLabel>
          <Select
            labelId="status-filter-label"
            value={statusFilter}
            label="Filter status"
            onChange={(e) => setStatusFilter(e.target.value as any)}
          >
            <MenuItem value="all">Semua tamu</MenuItem>
            <MenuItem value="email_sent">Email: Sudah dikirim</MenuItem>
            <MenuItem value="email_unsent">Email: Belum dikirim</MenuItem>
            <MenuItem value="no_email">Tanpa email</MenuItem>
            <MenuItem value="has_wa">Punya nomor WA</MenuItem>
            <MenuItem value="no_wa">Tanpa nomor WA</MenuItem>
          </Select>
        </FormControl>
        {(search || statusFilter !== "all") && (
          <Chip
            size="small"
            label={`${filteredInvitations.length} dari ${invitations.length}`}
            color="info"
            variant="outlined"
            onDelete={() => {
              setSearch("");
              setStatusFilter("all");
            }}
          />
        )}
        <Box flex={1} />
        {filteredInvitations.length > 0 && selection.length < filteredInvitations.length && (
          <Button
            size="small"
            variant="outlined"
            onClick={() => setSelection(filteredInvitations.map((r) => r.id))}
          >
            Pilih Semua ({filteredInvitations.length})
          </Button>
        )}
        {selection.length > 0 && (
          <Button size="small" onClick={() => setSelection([])}>
            Batal Pilih
          </Button>
        )}
        <Button size="small" onClick={() => reloadInvitations()} disabled={isLoading}>
          Muat Ulang
        </Button>
      </Stack>
      )}

      {importing && invitations.length > 0 && <LinearProgress sx={{ mb: 1 }} />}
      {sendingEmail && sendProgress.total > 0 && (
        <Box mb={1}>
          <Stack direction="row" justifyContent="space-between" mb={0.5}>
            <Typography variant="caption">
              Mengirim email... {sendProgress.done} / {sendProgress.total}
              {sendProgress.failed > 0 && ` (${sendProgress.failed} gagal)`}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {Math.round((sendProgress.done / sendProgress.total) * 100)}%
            </Typography>
          </Stack>
          <LinearProgress
            variant="determinate"
            value={(sendProgress.done / sendProgress.total) * 100}
          />
        </Box>
      )}

      {isLoading ? (
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress />
        </Box>
      ) : invitations.length === 0 ? (
        <Box
          sx={{
            textAlign: "center",
            py: { xs: 5, sm: 8 },
            px: 2,
            border: "2px dashed",
            borderColor: "divider",
            borderRadius: 2,
            bgcolor: "action.hover",
          }}
        >
          <GroupAddOutlinedIcon
            sx={{ fontSize: { xs: 56, sm: 72 }, color: "text.secondary", mb: 1 }}
          />
          <Typography variant="h6" fontWeight="bold" mb={0.5}>
            Belum ada tamu undangan
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3} sx={{ maxWidth: 420, mx: "auto" }}>
            Tambahkan tamu satu per satu, atau unggah file CSV untuk mengisi daftar undangan sekaligus.
          </Typography>
          <Stack direction="row" gap={1} justifyContent="center" flexWrap="wrap">
            <Button
              variant="contained"
              startIcon={<PersonAddAlt1OutlinedIcon />}
              onClick={() => setOpenAdd(true)}
            >
              Tambah Tamu Pertama
            </Button>
            <Button
              variant="outlined"
              startIcon={<UploadFileIcon />}
              component="label"
              disabled={importing}
            >
              Import CSV
              <input ref={csvRef} type="file" hidden accept=".csv,text/csv" onChange={handleCSV} />
            </Button>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={downloadTemplate}
            >
              Unduh Template
            </Button>
          </Stack>
          {importing && <LinearProgress sx={{ mt: 2, maxWidth: 420, mx: "auto" }} />}
        </Box>
      ) : (
        <Box sx={{ width: 0, minWidth: "100%", overflowX: "auto" }}>
        <DataGrid
          rows={filteredInvitations}
          columns={columns}
          autoHeight
          pageSizeOptions={[25, 50, 100, 500]}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          slots={{ toolbar: CustomToolbar }}
          checkboxSelection
          disableRowSelectionOnClick
          keepNonExistentRowsSelected
          rowSelectionModel={selection}
          onRowSelectionModelChange={(incoming) => {
            const prev = new Set(selection.map(String));
            const next = new Set(incoming.map(String));
            const { page, pageSize } = paginationModel;
            const pageRows = filteredInvitations.slice(page * pageSize, (page + 1) * pageSize);
            const pageIds = pageRows.map((r) => String(r.id));
            const allPageSelected = pageIds.every((id) => prev.has(id));
            const allPageNowSelected = pageIds.every((id) => next.has(id));
            const sizeDelta = Math.abs(incoming.length - selection.length);
            // Header-checkbox event detected: delta equals a whole page toggle
            if (!allPageSelected && allPageNowSelected && sizeDelta >= pageIds.length) {
              // Header check: add only current page ids
              const merged = new Set(prev);
              pageIds.forEach((id) => merged.add(id));
              setSelection(Array.from(merged));
              return;
            }
            if (allPageSelected && !allPageNowSelected && sizeDelta >= pageIds.length) {
              // Header uncheck: remove only current page ids
              const merged = new Set(prev);
              pageIds.forEach((id) => merged.delete(id));
              setSelection(Array.from(merged));
              return;
            }
            setSelection(incoming);
          }}
        />
        </Box>
      )}

      {invitations.length > 0 && (
        <>
          <Divider sx={{ my: 3 }} />
          <Typography variant="caption" color="text.secondary">
            Link RSVP personal: {APP_URL}/r/{requestId}?name=NamaTamu — nama tamu akan terisi otomatis.
          </Typography>
        </>
      )}

      {/* Add Dialog */}
      <Dialog
        open={openAdd}
        onClose={() => {
          setOpenAdd(false);
          setFormData({ name: "", jabatan: "", email: "", wa_number: "" });
        }}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Tambah Tamu</DialogTitle>
        <DialogContent>
          <Stack gap={2} mt={1}>
            <TextField
              label="Nama *"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              fullWidth
              autoFocus
            />
            <TextField
              label="Jabatan"
              value={formData.jabatan}
              onChange={(e) => setFormData({ ...formData, jabatan: e.target.value })}
              fullWidth
            />
            <TextField
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              fullWidth
            />
            {(() => {
              const digits = normalizeWa(formData.wa_number);
              const waCheck = validateWa(formData.wa_number);
              const hasInput = digits.length > 0;
              const isError = hasInput && !waCheck.valid;
              const counterColor = isError
                ? "error.main"
                : digits.length >= WA_MIN
                ? "success.main"
                : "text.secondary";
              return (
                <TextField
                  label="No. WhatsApp"
                  placeholder="Contoh: 628123456789 atau 08123456789"
                  value={formData.wa_number}
                  onChange={(e) => {
                    // Hanya izinkan digit, auto-cap ke WA_MAX
                    const cleaned = normalizeWa(e.target.value).slice(0, WA_MAX);
                    setFormData({ ...formData, wa_number: cleaned });
                  }}
                  fullWidth
                  inputMode="numeric"
                  error={isError}
                  helperText={
                    <Box
                      component="span"
                      display="flex"
                      justifyContent="space-between"
                      width="100%"
                    >
                      <Box component="span" color={isError ? "error.main" : "text.secondary"}>
                        {isError
                          ? waCheck.error
                          : hasInput && waCheck.valid
                          ? "Format valid"
                          : "Opsional — format nomor Indonesia"}
                      </Box>
                      <Box component="span" color={counterColor} fontWeight="bold">
                        {digits.length}/{WA_MAX}
                      </Box>
                    </Box>
                  }
                />
              );
            })()}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setOpenAdd(false);
              setFormData({ name: "", jabatan: "", email: "", wa_number: "" });
            }}
          >
            Batal
          </Button>
          <Button variant="contained" onClick={handleAdd} disabled={addLoading}>
            {addLoading ? "Menyimpan..." : "Simpan"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog
        open={!!editTarget}
        onClose={() => closeEditDialog()}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Edit Tamu</DialogTitle>
        <DialogContent>
          <Stack gap={2} mt={1}>
            <TextField
              label="Nama *"
              value={editForm.name}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              fullWidth
              autoFocus
            />
            <TextField
              label="Jabatan"
              value={editForm.jabatan}
              onChange={(e) => setEditForm({ ...editForm, jabatan: e.target.value })}
              fullWidth
            />
            <TextField
              label="Email"
              type="email"
              value={editForm.email}
              onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
              fullWidth
            />
            {(() => {
              const digits = normalizeWa(editForm.wa_number);
              const waCheck = validateWa(editForm.wa_number);
              const hasInput = digits.length > 0;
              const isError = hasInput && !waCheck.valid;
              const counterColor = isError
                ? "error.main"
                : digits.length >= WA_MIN
                ? "success.main"
                : "text.secondary";
              return (
                <TextField
                  label="No. WhatsApp"
                  placeholder="Contoh: 628123456789 atau 08123456789"
                  value={editForm.wa_number}
                  onChange={(e) => {
                    const cleaned = normalizeWa(e.target.value).slice(0, WA_MAX);
                    setEditForm({ ...editForm, wa_number: cleaned });
                  }}
                  fullWidth
                  inputMode="numeric"
                  error={isError}
                  helperText={
                    <Box component="span" display="flex" justifyContent="space-between" width="100%">
                      <Box component="span" color={isError ? "error.main" : "text.secondary"}>
                        {isError
                          ? waCheck.error
                          : hasInput && waCheck.valid
                          ? "Format valid"
                          : "Opsional — format nomor Indonesia"}
                      </Box>
                      <Box component="span" color={counterColor} fontWeight="bold">
                        {digits.length}/{WA_MAX}
                      </Box>
                    </Box>
                  }
                />
              );
            })()}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => closeEditDialog()} disabled={editLoading}>
            Batal
          </Button>
          <Button variant="contained" onClick={handleUpdate} disabled={editLoading}>
            {editLoading ? "Menyimpan..." : "Simpan Perubahan"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Hapus Tamu?</DialogTitle>
        <DialogContent>
          <Typography>
            Hapus <strong>{deleteTarget?.name}</strong> dari daftar undangan? Tindakan ini tidak dapat dibatalkan.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)}>Batal</Button>
          <Button variant="contained" color="error" onClick={confirmDelete}>
            Hapus
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bulk Delete Confirmation */}
      <Dialog open={bulkDeleteOpen} onClose={() => setBulkDeleteOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Hapus {selection.length} Tamu?</DialogTitle>
        <DialogContent>
          <Typography>
            Hapus <strong>{selection.length}</strong> tamu yang dipilih? Tindakan ini tidak dapat dibatalkan.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBulkDeleteOpen(false)} disabled={bulkDeleting}>
            Batal
          </Button>
          <Button variant="contained" color="error" onClick={confirmBulkDelete} disabled={bulkDeleting}>
            {bulkDeleting ? "Menghapus..." : "Hapus Semua"}
          </Button>
        </DialogActions>
      </Dialog>
    </List>
  );
}
