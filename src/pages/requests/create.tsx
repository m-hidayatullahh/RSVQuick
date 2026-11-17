import { Create } from "@refinedev/mui";
import {
  Box,
  Grid,
  TextField,
  Typography,
  InputLabel,
  Select,
  MenuItem,
  FormControl,
  Button,
  FormControlLabel,
  Switch,
  LinearProgress,
} from "@mui/material";
import { useForm } from "@refinedev/react-hook-form";
import { IResourceComponentsProps, useNotification } from "@refinedev/core";
import { useEffect, useState, useRef } from "react";
import { RequestCard } from "../../components/request-card";
import fonts from "../../utility/fonts";
import dayjs from "../../utility/dayjs";
import Background from "../../components/request-card/background";
import { useGetIdentity } from "@refinedev/core";
import { IUser } from "../../components/header";
import { supabaseClient } from "../../utility";
import { v4 as uuidv4 } from "uuid";

export const RequestCreate: React.FC<IResourceComponentsProps> = () => {
  const { data: user } = useGetIdentity<IUser>();
  const { open } = useNotification();
  const [uploadingImage, setUploadingImage] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    saveButtonProps,
    refineCore: { formLoading, onFinish },
    register,
    handleSubmit,
    setValue,
    clearErrors,
    watch,
    formState: { errors },
  } = useForm();

  const title = watch("title");
  const address = watch("address");
  const closeDate = watch("close_date");
  const limit = watch("limit");
  const acceptanceLabel = watch("acceptance_label");
  const rejectionLabel = watch("rejection_label");
  const secondaryColor = watch("secondary_color");
  const primaryColor = watch("primary_color");
  const fontFamily = watch("font_family");
  const backgroundColor = watch("background_color");
  const italicize = watch("italicize");
  const secondary_gradient = watch("secondary_gradient");
  const background_gradient = watch("background_gradient");
  const style = watch("style");
  const customMessage = watch("custom_message");
  const replyPrefix = watch("reply_prefix");
  const rsvpTitle = watch("rsvp_title");
  const questionLabel = watch("question_label");

  useEffect(() => {
    setValue("secondary_color", "#F9F4D7");
    setValue("primary_color", "#846C15");
    setValue("acceptance_label", "Hadir dengan Senang Hati");
    setValue("rejection_label", "Mohon Maaf Berhalangan");
    setValue("font_family", fonts[0]);
    setValue("close_date", dayjs().add(7, "day").format("YYYY-MM-DD"));
    setValue("background_color", "#EEE6B4");
    setValue("italicize", false);
    setValue("secondary_gradient", false);
    setValue("background_gradient", false);
    setValue("style", "DEFAULT");
    setValue("reply_prefix", "Konfirmasi Sebelum");
    setValue("rsvp_title", "RSVP");
    setValue("question_label", "Apakah Anda hadir?");
  }, [setValue]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) {
      open?.({
        type: "error",
        key: "img-type",
        message: "Format tidak didukung",
        description: "Gunakan file JPG, PNG, atau WebP.",
      });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      open?.({
        type: "error",
        key: "img-size",
        message: "File terlalu besar",
        description: "Ukuran maksimal adalah 5 MB.",
      });
      return;
    }

    setUploadingImage(true);
    try {
      const { data: authData } = await (supabaseClient as any).auth.getUser();
      const uid = authData?.user?.id;
      if (!uid) throw new Error("Sesi login tidak ditemukan. Silakan login ulang.");

      const ext = file.name.split(".").pop();
      const path = `${uid}/${uuidv4()}.${ext}`;
      const { error } = await (supabaseClient as any).storage
        .from("backgrounds")
        .upload(path, file, { upsert: true });

      if (error) throw error;

      const { data: urlData } = (supabaseClient as any).storage
        .from("backgrounds")
        .getPublicUrl(path);

      const publicUrl = urlData?.publicUrl as string;
      setValue("background_image", publicUrl);
      setPreviewImageUrl(publicUrl);
      open?.({
        type: "success",
        key: "img-ok",
        message: "Gambar berhasil diunggah",
        description: "Latar belakang telah diperbarui.",
      });
    } catch (err: any) {
      open?.({
        type: "error",
        key: "img-err",
        message: "Gagal mengunggah",
        description: err?.message ?? "Terjadi kesalahan.",
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveImage = () => {
    setValue("background_image", null);
    setPreviewImageUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <Create
      isLoading={formLoading}
      footerButtons={() => (
        <Button
          variant="contained"
          onClick={(e) => {
            e.preventDefault();
            if (user) {
              clearErrors();
              handleSubmit(async (values) => {
                await onFinish({ ...values, user_id: user.id });
              })();
            }
          }}
        >
          Buat Undangan
        </Button>
      )}
    >
      <Box marginBottom={4}>
        <Box mb={2}>
          <Typography component="h2" fontSize={24}>
            Preview
          </Typography>
        </Box>
        <Background
          backgroundColor={backgroundColor}
          backgroundImage={previewImageUrl}
          background_gradient={background_gradient}
        >
          <RequestCard
            backgroundColor={backgroundColor}
            title={title}
            address={address}
            acceptanceLabel={acceptanceLabel}
            rejectionLabel={rejectionLabel}
            closeDate={closeDate}
            secondaryColor={secondaryColor}
            primaryColor={primaryColor}
            limit={limit}
            fontFamily={fontFamily}
            italicize={italicize}
            secondary_gradient={secondary_gradient}
            background_gradient={background_gradient}
            style={style}
            customMessage={customMessage}
            replyPrefix={replyPrefix}
            rsvpTitle={rsvpTitle}
            questionLabel={questionLabel}
          />
        </Background>
      </Box>

      <Grid component="form" autoComplete="off" container spacing={2}>
        {/* General Info */}
        <Grid container item xs={12} md={6} spacing={2} flex={1}>
          <Grid item xs={12}>
            <Typography fontSize={24} fontWeight="semibold">
              Informasi Umum
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <TextField
              {...register("title", { required: "Harus diisi" })}
              error={!!(errors as any)?.title}
              helperText={(errors as any)?.title?.message}
              fullWidth
              InputLabelProps={{ shrink: true }}
              label="Judul Acara"
              name="title"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              {...register("address", { required: "Harus diisi" })}
              error={!!(errors as any)?.address}
              helperText={(errors as any)?.address?.message}
              fullWidth
              multiline
              rows={3}
              InputLabelProps={{ shrink: true }}
              label="Lokasi / Tempat"
              name="address"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              {...register("custom_message")}
              fullWidth
              multiline
              rows={3}
              InputLabelProps={{ shrink: true }}
              label="Pesan Tambahan (opsional)"
              name="custom_message"
              placeholder="Contoh: Dresscode putih. Acara dimulai pukul 09.00 WIB."
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              {...register("acceptance_label", { required: "Harus diisi" })}
              error={!!(errors as any)?.acceptance_label}
              helperText={(errors as any)?.acceptance_label?.message}
              fullWidth
              InputLabelProps={{ shrink: true }}
              label="Label Hadir"
              name="acceptance_label"
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              {...register("rejection_label", { required: "Harus diisi" })}
              error={!!(errors as any)?.rejection_label}
              helperText={(errors as any)?.rejection_label?.message}
              fullWidth
              InputLabelProps={{ shrink: true }}
              label="Label Tidak Hadir"
              name="rejection_label"
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              {...register("limit", { required: "Harus diisi", valueAsNumber: true })}
              error={!!(errors as any)?.limit}
              helperText={(errors as any)?.limit?.message}
              fullWidth
              InputLabelProps={{ shrink: true }}
              type="number"
              label="Batas Tamu"
              name="limit"
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              {...register("close_date", { required: "Harus diisi" })}
              error={!!(errors as any)?.close_date}
              helperText={(errors as any)?.close_date?.message}
              fullWidth
              InputLabelProps={{ shrink: true }}
              type="date"
              label="Batas RSVP"
              name="close_date"
            />
          </Grid>

          <Grid item xs={12}>
            <Typography fontSize={18} fontWeight="semibold" mt={1}>
              Teks Undangan
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <TextField
              {...register("rsvp_title")}
              fullWidth
              InputLabelProps={{ shrink: true }}
              label='Judul RSVP (default: "RSVP")'
              name="rsvp_title"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              {...register("reply_prefix")}
              fullWidth
              InputLabelProps={{ shrink: true }}
              label='Teks sebelum tanggal (default: "Kindly Reply Before")'
              name="reply_prefix"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              {...register("question_label")}
              fullWidth
              InputLabelProps={{ shrink: true }}
              label='Pertanyaan kehadiran (default: "Are you going?")'
              name="question_label"
            />
          </Grid>
        </Grid>

        {/* Visual */}
        <Grid container item xs={12} md={6} spacing={2} alignContent="flex-start">
          <Grid item xs={12}>
            <Typography fontSize={24} fontWeight="semibold">
              Tampilan
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <TextField
              {...register("primary_color", { required: "Harus diisi" })}
              error={!!(errors as any)?.primary_color}
              fullWidth
              InputLabelProps={{ shrink: true }}
              type="color"
              label="Warna Primer"
              name="primary_color"
            />
          </Grid>
          <Grid item xs={8}>
            <TextField
              {...register("secondary_color", { required: "Harus diisi" })}
              error={!!(errors as any)?.secondary_color}
              fullWidth
              InputLabelProps={{ shrink: true }}
              type="color"
              label="Warna Sekunder"
              name="secondary_color"
            />
          </Grid>
          <Grid item xs={4} display="flex" alignItems="center">
            <FormControlLabel
              control={<Switch {...register("secondary_gradient")} />}
              label="Gradien"
            />
          </Grid>
          <Grid item xs={8}>
            <TextField
              {...register("background_color", { required: "Harus diisi" })}
              error={!!(errors as any)?.background_color}
              fullWidth
              InputLabelProps={{ shrink: true }}
              type="color"
              label="Warna Latar"
              name="background_color"
            />
          </Grid>
          <Grid item xs={4} display="flex" alignItems="center">
            <FormControlLabel
              control={<Switch {...register("background_gradient")} />}
              label="Gradien"
            />
          </Grid>

          {/* Background Image Upload */}
          <Grid item xs={12}>
            <Typography fontSize={16} fontWeight="medium" mb={1}>
              Gambar Latar (JPG/PNG/WebP, maks 5 MB)
            </Typography>
            {uploadingImage && <LinearProgress sx={{ mb: 1 }} />}
            <Box display="flex" gap={1} alignItems="center" flexWrap="wrap">
              <Button
                variant="outlined"
                component="label"
                disabled={uploadingImage}
                size="small"
              >
                Pilih Gambar
                <input
                  ref={fileInputRef}
                  type="file"
                  hidden
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageUpload}
                />
              </Button>
              {previewImageUrl && (
                <Button
                  variant="text"
                  color="error"
                  size="small"
                  onClick={handleRemoveImage}
                >
                  Hapus Gambar
                </Button>
              )}
            </Box>
            {previewImageUrl && (
              <Box mt={1}>
                <img
                  src={previewImageUrl}
                  alt="preview"
                  style={{
                    maxWidth: "100%",
                    maxHeight: 120,
                    borderRadius: 8,
                    objectFit: "cover",
                  }}
                />
              </Box>
            )}
          </Grid>

          <Grid item xs={8}>
            <FormControl fullWidth>
              <InputLabel id="font_family">Font</InputLabel>
              <Select
                labelId="font_family"
                label="Font"
                error={!!(errors as any)?.font_family}
                {...register("font_family", { required: "Harus diisi" })}
                defaultValue={fonts[0]}
              >
                {fonts.map((font) => (
                  <MenuItem value={font} key={font}>
                    {font}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={4} display="flex" alignItems="center">
            <FormControlLabel
              control={<Switch {...register("italicize")} />}
              label="Miring"
            />
          </Grid>
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel id="style">Gaya Kartu</InputLabel>
              <Select
                labelId="style"
                label="Gaya Kartu"
                {...register("style", { required: "Harus diisi" })}
                defaultValue="DEFAULT"
              >
                <MenuItem value="DEFAULT">DEFAULT</MenuItem>
                <MenuItem value="FANCY">FANCY</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Grid>
    </Create>
  );
};
