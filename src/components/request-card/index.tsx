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
import { useCreate, useCreateMany, useNotification } from "@refinedev/core";
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
import { v4 as uuidv4 } from "uuid";

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
}) => {
  const {
    refineCore: { onFinish },
    register,
    setValue,
    watch,
    handleSubmit,
    formState: { errors },
  } = useForm<IResponse>();

  const {
    register: surveyRegister,
    handleSubmit: handleSurveySubmit,
    getValues: getSurveyValues,
  } = useForm<SurveyAnswer[]>();

  const { mutate } = useCreate<IResponse>();
  const { mutate: createAnswers } = useCreateMany<IAnswer>();
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

    const surveyAnswers = getSurveyValues()?.answers as IAnswer[];
    if (
      surveys &&
      surveyAnswers &&
      surveyAnswers.filter((a) => a.choice_id).length !== surveys.length &&
      accept
    ) {
      open?.({
        type: "error",
        key: "unanswered",
        description: "Harap lengkapi survei.",
        message: "Jawab semua pertanyaan untuk menyelesaikan konfirmasi.",
      });
      return;
    }

    const responseId = uuidv4();
    mutate(
      {
        resource: "responses",
        values: { ...data, id: responseId, request_id: requestId },
      },
      {
        onSuccess: () => {
          if (accept) {
            handleSurveySubmit(async (values) => {
              const answers = values.answers as SurveyAnswer[];
              createAnswers({
                resource: "answers",
                errorNotification: false,
                successNotification: false,
                values: answers.map((a) => ({ ...a, response_id: responseId })),
              });
            })();
          }
          navigate("/thank-you");
        },
      }
    );
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

  const closed = useMemo(
    () => dayjs().isAfter(dayjs(closeDate)) || confirmedAttendees >= limit,
    [closeDate, confirmedAttendees, limit]
  );

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
          background:
            style === "DEFAULT"
              ? secondary_gradient
                ? secondaryGradientColor
                : secondaryColor
              : "",
        }}
        color={defaultTextColor}
        width={800}
        maxWidth="md"
        component={Paper}
        elevation={4}
      >
        <Box
          px={4}
          pt={4}
          pb={style === "DEFAULT" ? 0 : 8}
          sx={{
            background:
              style === "DEFAULT"
                ? ""
                : secondary_gradient
                ? secondaryGradientColor
                : secondaryColor,
          }}
        >
          <Box display="flex" justifyContent="flex-end">
            <Typography color={primaryColor} fontWeight="bold">
              {confirmedAttendees} / {limit ? limit : 0}
            </Typography>
          </Box>
          <Typography
            fontSize={36}
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
          <Box mt={4}>
            <Typography
              fontSize={32}
              fontWeight="bold"
              textAlign="center"
              color={primaryColor}
            >
              {displayRsvpTitle}
              {closed ? " (DITUTUP)" : ""}
            </Typography>
            <Typography fontSize={24} textAlign="center" color={primaryColor}>
              {displayReplyPrefix} {dayjs(closeDate).format("Do MMMM YYYY")}
            </Typography>
          </Box>
        </Box>

        <Box
          component="form"
          onSubmit={handleSubmit(onSubmit, (err) => console.error(err))}
          px={4}
          pb={4}
        >
          <Box display="flex" flexDirection="column" alignItems="center">
            <Box my={2}>
              <TextField
                {...register("responder_name", {
                  required: "Nama harus diisi",
                })}
                error={!!(errors as any)?.responder_name}
                helperText={(errors as any)?.responder_name?.message}
                InputLabelProps={{ shrink: true }}
                type="text"
                label="Nama Anda"
                name="responder_name"
                variant="standard"
              />
            </Box>
            <FormControl error={!!(errors as any)?.accept}>
              <FormLabel
                sx={{ textAlign: "center", color: primaryColor }}
              >
                {displayQuestionLabel}
              </FormLabel>
              <RadioGroup name="radio-buttons-group">
                <Box display="flex" justifyContent="space-between" gap={4}>
                  <FormControlLabel
                    value={false}
                    {...register("accept", { required: "Harus dipilih" })}
                    control={<Radio />}
                    label={rejectionLabel}
                  />
                  <FormControlLabel
                    value={true}
                    {...register("accept", { required: "Harus dipilih" })}
                    control={<Radio />}
                    label={acceptanceLabel}
                  />
                </Box>
              </RadioGroup>
            </FormControl>
          </Box>

          {surveys && accept && surveys.length > 0 && (
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
                                {...surveyRegister(`answers.${index}.choice_id`, {
                                  required: "Harus dipilih",
                                })}
                                control={<Radio />}
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
            <Button variant="contained" type="submit" disabled={closed || !requestId}>
              Kirim Konfirmasi
            </Button>
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
};
