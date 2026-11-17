import {
  useShow,
  IResourceComponentsProps,
  useNotification,
  HttpError,
  useTable,
} from "@refinedev/core";
import { DateField, Show, useDataGrid, EditButton } from "@refinedev/mui";
import QRCode from "react-qr-code";

import {
  Typography,
  Stack,
  Grid,
  Button,
  Divider,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import PeopleAltOutlined from "@mui/icons-material/PeopleAltOutlined";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import Background from "../../components/request-card/background";
import { RequestCard } from "../../components/request-card";
import Box from "@mui/material/Box";
import ValueDisplay from "../../components/common/valueDisplay";
import { useMemo, useRef } from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { IRequest, IResponse } from "./list";
import html2canvas from "html2canvas";
import { IAnswer, IChoice, IQuestion } from "../../utility/types";
import QuestionShow from "../../components/questions/show";
import EmptyResourceMessage from "../../components/common/empty-resource-message";
import { Link } from "react-router-dom";
import { useState } from "react";
import { supabaseClient } from "../../utility";

export const RequestShow: React.FC<IResourceComponentsProps> = () => {
  const { open } = useNotification();
  const [isDeletingResponse, setIsDeletingResponse] = useState(false);
  const qrCodeRef = useRef<HTMLDivElement>(null);
  const [deleteResponseTarget, setDeleteResponseTarget] = useState<IResponse | null>(null);

  const appUrl = window.location.origin;

  const copyQRCodeAsImage = async () => {
    try {
      if (qrCodeRef.current) {
        const canvas = await html2canvas(qrCodeRef.current);
        canvas.toBlob((blob) => {
          if (blob) {
            navigator.clipboard.write([
              new ClipboardItem({ "image/png": blob }),
            ]);
          }
        });
      }
      open?.({
        type: "success",
        key: "copy-qr",
        message: "Berhasil",
        description: "QR Code disalin ke clipboard.",
      });
    } catch (error) {
      open?.({
        type: "error",
        key: "copy-qr-err",
        message: "Gagal",
        description: "Tidak dapat menyalin QR Code.",
      });
    }
  };

  const copyLinkToClipboard = () => {
    if (request) {
      navigator.clipboard.writeText(`${appUrl}/r/${request.id}`);
      open?.({
        type: "success",
        key: "copy-link",
        description: "Link berhasil disalin",
        message: "Bagikan link RSVP ini ke tamu undangan.",
      });
    }
  };

  const shareWhatsApp = () => {
    if (!request) return;
    const link = `${appUrl}/r/${request.id}`;
    const msg = encodeURIComponent(
      `Anda diundang ke acara: *${request.title}*\n\nKonfirmasi kehadiran Anda di:\n${link}`
    );
    window.open(`https://wa.me/?text=${msg}`, "_blank");
  };

  const responseColumns = useMemo<GridColDef[]>(
    () => [
      { field: "id", headerName: "ID", minWidth: 80 },
      {
        field: "accepted_at",
        flex: 1,
        headerName: "Waktu",
        minWidth: 140,
        renderCell: ({ value }) => (
          <DateField value={value} format="DD MMM YYYY HH:mm" />
        ),
      },
      {
        field: "responder_name",
        flex: 1,
        headerName: "Nama",
        minWidth: 150,
      },
      {
        field: "accept",
        flex: 1,
        headerName: "Hadir",
        type: "boolean",
        minWidth: 80,
      },
      {
        field: "actions",
        headerName: "Aksi",
        sortable: false,
        renderCell: ({ row }) => (
          <Button
            variant="contained"
            color="error"
            size="small"
            onClick={() => setDeleteResponseTarget(row)}
          >
            Hapus
          </Button>
        ),
        align: "center",
        headerAlign: "center",
        minWidth: 100,
      },
    ],
    []
  );

  const { queryResult } = useShow<IRequest>();
  const { data, isLoading } = queryResult;
  const request = data?.data;

  const { dataGridProps: responseDataGridProps, tableQueryResult: responseTableQueryResult } = useDataGrid<IResponse>({
    resource: "responses",
    queryOptions: { enabled: !!request },
    filters: {
      permanent: [{ field: "request_id", operator: "eq", value: request?.id ?? "" }],
    },
    pagination: { pageSize: 100 },
  });

  const { tableQueryResult: questionQueryResult } = useTable<IQuestion, HttpError>({
    resource: "questions",
    queryOptions: { enabled: !!request },
    filters: {
      permanent: [{ field: "request_id", operator: "eq", value: request?.id }],
    },
  });
  const questions = questionQueryResult.data?.data;

  const { tableQueryResult: choicesQueryResult } = useTable<IChoice, HttpError>({
    resource: "choices",
    queryOptions: { enabled: !!questions },
    filters: {
      permanent: [
        { field: "question_id", operator: "in", value: questions?.map((q) => q.id) },
      ],
    },
  });
  const choices = choicesQueryResult.data?.data;

  const { tableQueryResult: answerQueryResult } = useTable<IAnswer, HttpError>({
    resource: "answers",
    queryOptions: { enabled: !!questions },
    filters: {
      permanent: [
        { field: "question_id", operator: "in", value: questions?.map((q) => q.id) },
      ],
    },
  });
  const answers = answerQueryResult.data?.data;

  const confirmedAttendeeResponses: IResponse[] = useMemo(
    () => responseDataGridProps.rows.filter((res) => res.accept),
    [responseDataGridProps]
  );

  const confirmedAttendeeAnswers = useMemo(
    () =>
      answers?.filter((a) =>
        confirmedAttendeeResponses.map((r) => r.id).includes(a.response_id)
      ),
    [answers, confirmedAttendeeResponses]
  );

  return (
    <Show
      isLoading={isLoading}
      headerButtons={() => null}
    >
      {request && (
        <Box>
          <Stack
            direction="row"
            gap={1}
            flexWrap="wrap"
            mb={2}
            sx={{ width: "100%" }}
          >
            <Button
              component={Link}
              to={`/requests/${request.id}/invitations`}
              variant="outlined"
              startIcon={<PeopleAltOutlined />}
              size="small"
              sx={{ whiteSpace: "nowrap" }}
            >
              Daftar Undangan
            </Button>
            <Button
              onClick={copyLinkToClipboard}
              variant="contained"
              size="small"
              sx={{ whiteSpace: "nowrap" }}
            >
              Salin Link
            </Button>
            <Button
              onClick={shareWhatsApp}
              variant="contained"
              color="success"
              startIcon={<WhatsAppIcon />}
              size="small"
              sx={{ whiteSpace: "nowrap" }}
            >
              WhatsApp
            </Button>
          </Stack>
          <Background
            backgroundColor={request.background_color}
            backgroundImage={request.background_image}
            background_gradient={request.background_gradient}
          >
            <RequestCard
              backgroundColor={request.background_color}
              title={request.title}
              address={request.address}
              acceptanceLabel={request.acceptance_label}
              rejectionLabel={request.rejection_label}
              closeDate={request.close_date}
              secondaryColor={request.secondary_color}
              secondary_gradient={request.secondary_gradient}
              primaryColor={request.primary_color}
              limit={request.limit}
              fontFamily={request.font_family}
              italicize={request.italicize}
              responses={responseDataGridProps.rows as IResponse[]}
              style={request.style}
              customMessage={request.custom_message}
              replyPrefix={request.reply_prefix}
              rsvpTitle={request.rsvp_title}
              questionLabel={request.question_label}
              cardImage={request.card_image}
              cardImageX={request.card_image_x}
              cardImageY={request.card_image_y}
              cardImageWidth={request.card_image_width}
            />
          </Background>

          <Grid container spacing={2} mt={4}>
            <Grid item xs={12} lg={6}>
              <Stack spacing={2}>
                <Typography fontWeight={600} fontSize={24}>
                  QR Code
                </Typography>
                {request.id && (
                  <Stack gap={2}>
                    <Box ref={qrCodeRef} width="min-content" bgcolor="white" p={1} borderRadius={1}>
                      <QRCode value={`${appUrl}/r/${request.id}`} />
                    </Box>
                    <Stack direction="row" gap={2} flexWrap="wrap">
                      <Button onClick={copyQRCodeAsImage} variant="outlined" size="small">
                        Salin QR Code
                      </Button>
                      <Button onClick={copyLinkToClipboard} variant="outlined" size="small">
                        Salin Link RSVP
                      </Button>
                    </Stack>
                    <Typography variant="caption" color="text.secondary" sx={{ wordBreak: "break-all" }}>
                      {appUrl}/r/{request.id}
                    </Typography>
                  </Stack>
                )}
              </Stack>
            </Grid>
            <Grid item xs={12} lg={6}>
              <Box mb={2}>
                <Typography fontWeight={600} fontSize={24}>Info</Typography>
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}><ValueDisplay label="Judul" value={request.title} /></Grid>
                <Grid item xs={12} md={6}><ValueDisplay label="Lokasi" value={request.address} /></Grid>
                <Grid item xs={12} md={6}><ValueDisplay label="Label Hadir" value={request.acceptance_label} /></Grid>
                <Grid item xs={12} md={6}><ValueDisplay label="Label Tidak Hadir" value={request.rejection_label} /></Grid>
                <Grid item xs={12} md={6}><ValueDisplay label="Batas Tamu" value={request.limit} /></Grid>
                <Grid item xs={12} md={6}><ValueDisplay label="Batas RSVP" value={request.close_date} isDate /></Grid>
                <Grid item xs={12} md={6}><ValueDisplay label="Warna Sekunder" value={request.secondary_color} isColor /></Grid>
                <Grid item xs={12} md={6}><ValueDisplay label="Warna Primer" value={request.primary_color} isColor /></Grid>
                <Grid item xs={12} md={6}><ValueDisplay label="Warna Latar" value={request.background_color} isColor /></Grid>
                <Grid item xs={12} md={6}><ValueDisplay label="Font" value={request.font_family} /></Grid>
              </Grid>
            </Grid>
          </Grid>

          <Divider sx={{ my: 4 }} />

          <Stack gap={2}>
            <Stack justifyContent="space-between" alignItems="center" direction="row">
              <Typography fontSize={24}>Pertanyaan Survey</Typography>
              <EditButton recordItemId={request.id} variant="outlined">
                Kelola Pertanyaan
              </EditButton>
            </Stack>
            {questions && questions.length ? (
              <Stack gap={2}>
                {questions.map((q) => (
                  <QuestionShow
                    key={q.id}
                    question={q}
                    readOnly
                    answers={confirmedAttendeeAnswers?.filter((a) => a.question_id === q.id)}
                    responses={confirmedAttendeeResponses}
                    choices={choices?.filter((c) => c.question_id === q.id)}
                  />
                ))}
              </Stack>
            ) : (
              <EmptyResourceMessage message="Belum ada pertanyaan. Tambahkan di halaman Edit." />
            )}
          </Stack>

          <Divider sx={{ my: 4 }} />

          <Stack gap={2}>
            <Stack direction="row" alignItems="center" gap={2}>
              <Typography fontWeight="bold" fontSize={24}>
                Respon Tamu
              </Typography>
              <Chip
                label={`${responseDataGridProps.rows.filter((r) => r.accept).length} Hadir / ${request.limit ?? 0} Kapasitas`}
                color="primary"
              />
            </Stack>
            <DataGrid
              columns={responseColumns}
              {...responseDataGridProps}
              autoHeight
              pageSizeOptions={[25, 50, 100]}
            />
          </Stack>

          <Dialog
            open={!!deleteResponseTarget}
            onClose={() => setDeleteResponseTarget(null)}
            maxWidth="xs"
            fullWidth
          >
            <DialogTitle>Hapus Respon?</DialogTitle>
            <DialogContent>
              <Typography>
                Hapus respon dari <strong>{deleteResponseTarget?.responder_name}</strong>?
                Tindakan ini tidak dapat dibatalkan.
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button
                onClick={() => setDeleteResponseTarget(null)}
                disabled={isDeletingResponse}
              >
                Batal
              </Button>
              <Button
                variant="contained"
                color="error"
                disabled={isDeletingResponse}
                onClick={async () => {
                  if (!deleteResponseTarget) return;
                  const target = deleteResponseTarget;
                  const name = target.responder_name;
                  setIsDeletingResponse(true);
                  try {
                    // Delete answers linked to this response first (if any) — avoids FK
                    // violation if a trigger / policy didn't cascade.
                    await (supabaseClient as any)
                      .from("answers")
                      .delete()
                      .eq("response_id", target.id);

                    const { data: deleted, error } = await (supabaseClient as any)
                      .from("responses")
                      .delete()
                      .eq("id", target.id)
                      .select("id");

                    if (error) throw error;
                    if (!deleted || deleted.length === 0) {
                      throw new Error(
                        "Data tidak ikut terhapus — kemungkinan RLS policy memblokir. Cek policy DELETE tabel 'responses'."
                      );
                    }

                    setDeleteResponseTarget(null);
                    await responseTableQueryResult.refetch();
                    open?.({
                      type: "success",
                      key: "del-response-ok",
                      message: "Respon dihapus",
                      description: `Respon dari ${name} berhasil dihapus.`,
                    });
                  } catch (err: any) {
                    console.error("[delete-response] failed:", err);
                    open?.({
                      type: "error",
                      key: "del-response-err",
                      message: "Gagal menghapus respon",
                      description:
                        err?.message ??
                        err?.error?.message ??
                        "Coba lagi atau hubungi admin.",
                    });
                  } finally {
                    setIsDeletingResponse(false);
                  }
                }}
              >
                {isDeletingResponse ? "Menghapus..." : "Hapus"}
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      )}
    </Show>
  );
};
