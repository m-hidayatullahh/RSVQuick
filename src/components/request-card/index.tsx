import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Divider from "@mui/material/Divider";
import TextField from "@mui/material/TextField";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import Radio from "@mui/material/Radio";
import Paper from "@mui/material/Paper";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Typography from "@mui/material/Typography";
import { useNotification } from "@refinedev/core";
import { useNavigate } from "react-router-dom";
import React, { useMemo } from "react";
import tc from "tinycolor2";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import dayjs from "../../utility/dayjs";
import { Button } from "@mui/material";
import { useForm } from "@refinedev/react-hook-form";
import { FieldValues } from "react-hook-form";
import { IResponse } from "../../pages/requests/list";
import { IAnswer, IChoice, IQuestion } from "../../utility/types";
import CardImageOverlay, { CardImagePosition } from "./card-image-overlay";
import { supabaseClient } from "../../utility";

interface Survey {
  question: IQuestion;
  choices: IChoice[];
}

interface SurveyAnswer {
  question_id: string;
  choice_id: string;
}

interface RequestCardProps {
  title: string;
  address: string;
  rejectionLabel: string;
  acceptanceLabel: string;
  closeDate: string;
  secondaryColor: string;
  primaryColor: string;
  fontFamily: string;
  limit: number;
  backgroundColor: string;
  italicize: boolean;
  secondary_gradient?: boolean;
  background_gradient?: boolean;
  requestId?: string;
  responses?: IResponse[];
  surveys?: Survey[];
  style?: string;
  customMessage?: string | null;
  replyPrefix?: string | null;
  rsvpTitle?: string | null;
  questionLabel?: string | null;
  prefillName?: string;
  cardImage?: string | null;
  cardImageX?: number | null;
  cardImageY?: number | null;
  cardImageWidth?: number | null;
  editableImage?: boolean;
  onCardImageChange?: (pos: CardImagePosition) => void;
}

export const RequestCard: React.FC<RequestCardProps> = ({
  title,
  address,
  fontFamily,
  limit,
  rejectionLabel,
  acceptanceLabel,
  closeDate,
  secondaryColor,
  primaryColor,
  secondary_gradient = false,
  requestId,
  italicize,
  responses,
  surveys,
  style = "DEFAULT",
  customMessage,
  replyPrefix,
  rsvpTitle,
  questionLabel,
  prefillName = "",
  cardImage,
  cardImageX,
  cardImageY,
  cardImageWidth,
  editableImage = false,
  onCardImageChange,
}) => {
  const {
    register,
    setValue,
    watch,
    handleSubmit,
    formState: { errors },
  } = useForm<IResponse>();

  const {
    register: surveyRegister,
    getValues: getSurveyValues,
  } = useForm<SurveyAnswer[]>();

  const navigate = useNavigate();
  const { open } = useNotification();

  React.useEffect(() => {
    if (prefillName) {
      setValue("responder_name", prefillName);
    }
  }, [prefillName, setValue]);

  const defaultTextColor = tc(secondaryColor || "#fff").isLight()
    ? "black"
    : "white";
  const responseAnswer = watch("accept");
  const accept = responseAnswer === "true";

  const onSubmit = async (data: FieldValues) => {
    if (!requestId) return;

    const surveyAnswers = (getSurveyValues()?.answers as IAnswer[] | undefined) ?? [];
    if (
      surveys &&
      accept &&
      surveyAnswers.filter((a) => a.choice_id).length !== surveys.length
    ) {
      open?.({
        type: "error",
        key: "unanswered",
        description: "Harap lengkapi survei.",
        message: "Jawab semua pertanyaan untuk menyelesaikan konfirmasi.",
      });
      return;
    }

    const payloadAnswers = accept
      ? surveyAnswers
          .filter((a) => a?.question_id && a?.choice_id)
          .map((a) => ({
            question_id: Number(a.question_id),
            choice_id: Number(a.choice_id),
          }))
      : [];

    const { error } = await (supabaseClient as any).rpc("submit_response", {
      p_request_id: requestId,
      p_responder_name: data.responder_name,
      p_accept: accept,
      p_answers: payloadAnswers,
    });

    if (error) {
      const code = (error.message ?? "").trim();
      const map: Record<string, { message: string; description: string }> = {
        name_required: { message: "Nama harus diisi", description: "" },
        request_not_found: {
          message: "Undangan tidak ditemukan",
          description: "",
        },
        deadline_passed: {
          message: "Konfirmasi sudah ditutup",
          description: `Batas konfirmasi (${dayjs(closeDate).format(
            "Do MMMM YYYY"
          )}) telah lewat.`,
        },
        capacity_full: {
          message: "Kuota Penuh",
          description: "Maaf, kuota tamu yang hadir sudah penuh.",
        },
        duplicate_name: {
          message: "Nama sudah terdaftar",
          description:
            "Nama ini sudah mengirim konfirmasi. Gunakan nama lain.",
        },
        not_invited: {
          message: "Nama tidak terdaftar",
          description:
            "Nama Anda tidak ada di daftar tamu undangan. Pastikan sesuai dengan nama pada undangan yang diterima.",
        },
        rate_limited: {
          message: "Terlalu banyak permintaan",
          description:
            "Silakan tunggu beberapa saat sebelum mencoba lagi.",
        },
      };
      const mapped = map[code] ?? {
        message: "Gagal menyimpan konfirmasi",
        description: code || "Terjadi kesalahan tidak diketahui.",
      };
      if (code === "deadline_passed") setEventClosed(true);
      open?.({ type: "error", key: code || "submit-err", ...mapped });
      return;
    }

    navigate("/thank-you");
  };

  const theme = createTheme({
    typography: { fontFamily },
    components: {
      MuiFilledInput: {
        styleOverrides: {
          root: { ":before": { borderColor: defaultTextColor }, color: defaultTextColor },
        },
      },
      MuiFormLabel: { styleOverrides: { root: { color: defaultTextColor } } },
      MuiRadio: { styleOverrides: { root: { color: defaultTextColor } } },
    },
    palette: { primary: { main: primaryColor || "#000" } },
  });

  const confirmedAttendees = useMemo(
    () => responses?.filter((r) => r.accept)?.length || 0,
    [responses]
  );

  const [eventClosed, setEventClosed] = React.useState(() =>
    dayjs().isAfter(dayjs(closeDate))
  );
  React.useEffect(() => {
    setEventClosed(dayjs().isAfter(dayjs(closeDate)));
    if (eventClosed) return;
    const tick = () => {
      if (dayjs().isAfter(dayjs(closeDate))) {
        setEventClosed(true);
      }
    };
    const interval = setInterval(tick, 30_000);
    const diff = dayjs(closeDate).diff(dayjs());
    let timeout: ReturnType<typeof setTimeout> | undefined;
    if (diff > 0 && diff < 2_147_483_647) {
      timeout = setTimeout(() => setEventClosed(true), diff + 500);
    }
    return () => {
      clearInterval(interval);
      if (timeout) clearTimeout(timeout);
    };
  }, [closeDate, eventClosed]);
  const capacityFull = useMemo(
    () => confirmedAttendees >= limit,
    [confirmedAttendees, limit]
  );
  const submitDisabled = eventClosed || !requestId || (accept && capacityFull);

  const secondaryGradientColor = useMemo(
    () =>
      `linear-gradient(${tc(secondaryColor || "#fff")
        .analogous()
        .slice(1)
        .reverse()
        .toString()})`,
    [secondaryColor]
  );

  const displayRsvpTitle = rsvpTitle || "RSVP";
  const displayReplyPrefix = replyPrefix || "Kindly Reply Before";
  const displayQuestionLabel = questionLabel || "Are you going?";

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          borderRadius: 2,
          overflow: "hidden",
          fontFamily,
          fontStyle: italicize ? "italic" : "normal",
          position: "relative",
          background:
            style === "DEFAULT"
              ? secondary_gradient
                ? secondaryGradientColor
                : secondaryColor
              : "",
        }}
        color={defaultTextColor}
        width="100%"
        maxWidth={800}
        component={Paper}
        elevation={4}
      >
        <CardImageOverlay
          src={cardImage}
          x={cardImageX ?? 50}
          y={cardImageY ?? 15}
          width={cardImageWidth ?? 35}
          editable={editableImage}
          onChange={onCardImageChange}
        />
        <Box
          px={{ xs: 2, sm: 4 }}
          pt={{ xs: 2, sm: 4 }}
          pb={style === "DEFAULT" ? 0 : { xs: 4, sm: 8 }}
          sx={{
            background:
              style === "DEFAULT"
                ? ""
                : secondary_gradient
                ? secondaryGradientColor
                : secondaryColor,
            wordBreak: "break-word",
          }}
        >
          <Box display="flex" justifyContent="flex-end">
            <Typography color={primaryColor} fontWeight="bold">
              {confirmedAttendees} / {limit ? limit : 0}
            </Typography>
          </Box>
          <Typography
            sx={{ fontSize: { xs: 24, sm: 36 } }}
            textAlign="center"
            fontWeight="bold"
            color={primaryColor}
          >
            {title || "Please Join Us!"}
          </Typography>
          <Typography textAlign="center" color={primaryColor}>
            {address}
          </Typography>
          {customMessage && (
            <Typography
              textAlign="center"
              color={primaryColor}
              mt={2}
              sx={{ whiteSpace: "pre-wrap" }}
            >
              {customMessage}
            </Typography>
          )}
          <Box mt={{ xs: 2, sm: 4 }}>
            <Typography
              sx={{ fontSize: { xs: 22, sm: 32 } }}
              fontWeight="bold"
              textAlign="center"
              color={primaryColor}
            >
              {displayRsvpTitle}
              {eventClosed ? " (DITUTUP)" : capacityFull ? " (PENUH)" : ""}
            </Typography>
            <Typography
              sx={{ fontSize: { xs: 16, sm: 24 } }}
              textAlign="center"
              color={primaryColor}
            >
              {displayReplyPrefix} {dayjs(closeDate).format("Do MMMM YYYY")}
            </Typography>
          </Box>
        </Box>

        <Box
          component="form"
          onSubmit={handleSubmit(onSubmit, (err) => console.error(err))}
          px={{ xs: 2, sm: 4 }}
          pb={{ xs: 2, sm: 4 }}
        >
          {!(eventClosed || capacityFull) && (
            <Box display="flex" flexDirection="column" alignItems="center">
              <Box my={2}>
                <TextField
                  {...register("responder_name", {
                    required: "Nama harus diisi",
                  })}
                  error={!!(errors as any)?.responder_name}
                  helperText={
                    (errors as any)?.responder_name?.message ||
                    (prefillName
                      ? "Nama sesuai undangan (terkunci)"
                      : "Masukkan nama persis seperti pada undangan Anda")
                  }
                  InputLabelProps={{ shrink: true }}
                  type="text"
                  label="Nama Anda"
                  name="responder_name"
                  variant="standard"
                  InputProps={{ readOnly: !!prefillName }}
                />
              </Box>
              <FormControl error={!!(errors as any)?.accept}>
                <FormLabel
                  sx={{ textAlign: "center", color: primaryColor }}
                >
                  {displayQuestionLabel}
                </FormLabel>
                <RadioGroup name="radio-buttons-group">
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    gap={{ xs: 2, sm: 4 }}
                    flexWrap="wrap"
                  >
                    <FormControlLabel
                      value="false"
                      control={<Radio {...register("accept", { required: "Harus dipilih" })} />}
                      label={rejectionLabel}
                    />
                    <FormControlLabel
                      value="true"
                      control={<Radio {...register("accept", { required: "Harus dipilih" })} />}
                      label={acceptanceLabel}
                    />
                  </Box>
                </RadioGroup>
              </FormControl>
            </Box>
          )}

          {!(eventClosed || capacityFull) && surveys && accept && surveys.length > 0 && (
            <>
              <Divider sx={{ my: 4 }} />
              <Stack gap={2}>
                <Typography
                  fontSize={24}
                  fontWeight="bold"
                  color="primary.main"
                  textAlign="center"
                >
                  Pertanyaan
                </Typography>
                <Box display="flex" flexWrap="wrap" gap={4} justifyContent="center">
                  {surveys.map((survey, index) => (
                    <Box
                      border={2}
                      borderRadius={1}
                      borderColor="primary.main"
                      padding={2}
                      key={survey.question.id}
                    >
                      <TextField
                        {...surveyRegister(`answers.${index}.question_id`)}
                        type="text"
                        defaultValue={survey.question.id}
                        sx={{ display: "none" }}
                      />
                      <FormControl fullWidth>
                        <FormLabel sx={{ textAlign: "left", color: primaryColor }}>
                          {survey.question.question_text}
                        </FormLabel>
                        <RadioGroup key={survey.question.id} name="radio-buttons-group">
                          <Stack justifyContent="center" alignItems="flex-start">
                            {survey.choices.map((choice) => (
                              <FormControlLabel
                                key={choice.id}
                                value={choice.id}
                                control={
                                  <Radio
                                    {...surveyRegister(`answers.${index}.choice_id`, {
                                      required: "Harus dipilih",
                                    })}
                                  />
                                }
                                label={choice.choice_text}
                              />
                            ))}
                          </Stack>
                        </RadioGroup>
                      </FormControl>
                    </Box>
                  ))}
                </Box>
              </Stack>
            </>
          )}

          <Box mt={4} textAlign="center">
            {eventClosed || capacityFull ? (
              <Typography color={primaryColor} fontWeight="bold">
                {eventClosed
                  ? "Konfirmasi sudah ditutup."
                  : "Kuota tamu sudah penuh."}
              </Typography>
            ) : (
              <Button variant="contained" type="submit" disabled={submitDisabled}>
                Kirim Konfirmasi
              </Button>
            )}
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
};
