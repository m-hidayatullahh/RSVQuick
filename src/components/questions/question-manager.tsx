import React, { useEffect, useMemo, useState } from "react";
import { useNotification } from "@refinedev/core";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Tooltip from "@mui/material/Tooltip";
import CircularProgress from "@mui/material/CircularProgress";
import Paper from "@mui/material/Paper";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import AddIcon from "@mui/icons-material/Add";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import { IChoice, IQuestion } from "../../utility/types";
import EmptyResourceMessage from "../common/empty-resource-message";
import { supabaseClient } from "../../utility";

interface Props {
  requestId: string;
}

export default function QuestionManager({ requestId }: Props) {
  const { open } = useNotification();

  const [questions, setQuestions] = useState<IQuestion[]>([]);
  const [choices, setChoices] = useState<IChoice[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);

  const [addingQuestion, setAddingQuestion] = useState(false);
  const [addingChoiceFor, setAddingChoiceFor] = useState<string | null>(null);
  const [deletingQuestion, setDeletingQuestion] = useState<string | null>(null);
  const [deletingChoice, setDeletingChoice] = useState<string | null>(null);

  const [draftQuestions, setDraftQuestions] = useState<Record<string, string>>({});
  const [draftChoices, setDraftChoices] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!requestId) return;
    (async () => {
      setInitialLoading(true);
      const { data: qs } = await (supabaseClient as any)
        .from("questions")
        .select("*")
        .eq("request_id", requestId)
        .order("id", { ascending: true });
      const qList = (qs ?? []) as IQuestion[];
      setQuestions(qList);
      setDraftQuestions(
        Object.fromEntries(qList.map((q) => [String(q.id), q.question_text ?? ""]))
      );

      if (qList.length) {
        const { data: cs } = await (supabaseClient as any)
          .from("choices")
          .select("*")
          .in(
            "question_id",
            qList.map((q) => q.id)
          )
          .order("id", { ascending: true });
        const cList = (cs ?? []) as IChoice[];
        setChoices(cList);
        setDraftChoices(
          Object.fromEntries(cList.map((c) => [String(c.id), c.choice_text ?? ""]))
        );
      }
      setInitialLoading(false);
    })();
  }, [requestId]);

  const handleAddQuestion = async () => {
    setAddingQuestion(true);
    const { data, error } = await (supabaseClient as any)
      .from("questions")
      .insert({ request_id: requestId, question_text: "Pertanyaan baru" })
      .select()
      .single();
    setAddingQuestion(false);
    if (error) {
      open?.({
        type: "error",
        key: "q-add",
        message: "Gagal menambah pertanyaan",
        description: error.message,
      });
      return;
    }
    const q = data as IQuestion;
    setQuestions((prev) => [...prev, q]);
    setDraftQuestions((prev) => ({ ...prev, [String(q.id)]: q.question_text }));
  };

  const handleQuestionBlur = async (q: IQuestion) => {
    const text = (draftQuestions[String(q.id)] ?? "").trim();
    if (!text || text === q.question_text) return;
    setQuestions((prev) =>
      prev.map((x) => (x.id === q.id ? { ...x, question_text: text } : x))
    );
    const { error } = await (supabaseClient as any)
      .from("questions")
      .update({ question_text: text })
      .eq("id", q.id);
    if (error) {
      open?.({
        type: "error",
        key: `q-update-${q.id}`,
        message: "Gagal menyimpan pertanyaan",
        description: error.message,
      });
    }
  };

  const handleDeleteQuestion = async (q: IQuestion) => {
    if (!window.confirm(`Hapus pertanyaan "${q.question_text}"?`)) return;
    setDeletingQuestion(String(q.id));
    const { error: ce } = await (supabaseClient as any)
      .from("choices")
      .delete()
      .eq("question_id", q.id);
    if (ce) {
      setDeletingQuestion(null);
      open?.({
        type: "error",
        key: `c-del-cascade-${q.id}`,
        message: "Gagal hapus opsi",
        description: ce.message,
      });
      return;
    }
    const { error } = await (supabaseClient as any)
      .from("questions")
      .delete()
      .eq("id", q.id);
    setDeletingQuestion(null);
    if (error) {
      open?.({
        type: "error",
        key: `q-del-${q.id}`,
        message: "Gagal hapus pertanyaan",
        description: error.message,
      });
      return;
    }
    setQuestions((prev) => prev.filter((x) => x.id !== q.id));
    setChoices((prev) => prev.filter((c) => c.question_id !== q.id));
    setDraftQuestions((prev) => {
      const next = { ...prev };
      delete next[String(q.id)];
      return next;
    });
  };

  const handleAddChoice = async (questionId: string | number) => {
    setAddingChoiceFor(String(questionId));
    const { data, error } = await (supabaseClient as any)
      .from("choices")
      .insert({ question_id: questionId, choice_text: "Opsi baru" })
      .select()
      .single();
    setAddingChoiceFor(null);
    if (error) {
      open?.({
        type: "error",
        key: "c-add",
        message: "Gagal menambah opsi",
        description: error.message,
      });
      return;
    }
    const c = data as IChoice;
    setChoices((prev) => [...prev, c]);
    setDraftChoices((prev) => ({ ...prev, [String(c.id)]: c.choice_text }));
  };

  const handleChoiceBlur = async (c: IChoice) => {
    const text = (draftChoices[String(c.id)] ?? "").trim();
    if (!text || text === c.choice_text) return;
    setChoices((prev) =>
      prev.map((x) => (x.id === c.id ? { ...x, choice_text: text } : x))
    );
    const { error } = await (supabaseClient as any)
      .from("choices")
      .update({ choice_text: text })
      .eq("id", c.id);
    if (error) {
      open?.({
        type: "error",
        key: `c-update-${c.id}`,
        message: "Gagal menyimpan opsi",
        description: error.message,
      });
    }
  };

  const handleDeleteChoice = async (c: IChoice) => {
    setDeletingChoice(String(c.id));
    const { error } = await (supabaseClient as any)
      .from("choices")
      .delete()
      .eq("id", c.id);
    setDeletingChoice(null);
    if (error) {
      open?.({
        type: "error",
        key: `c-del-${c.id}`,
        message: "Gagal hapus opsi",
        description: error.message,
      });
      return;
    }
    setChoices((prev) => prev.filter((x) => x.id !== c.id));
    setDraftChoices((prev) => {
      const next = { ...prev };
      delete next[String(c.id)];
      return next;
    });
  };

  if (initialLoading) {
    return (
      <Stack alignItems="center" py={4}>
        <CircularProgress size={28} />
      </Stack>
    );
  }

  return (
    <Stack gap={2}>
      {questions.length === 0 && !addingQuestion && (
        <EmptyResourceMessage message="Belum ada pertanyaan. Klik 'Tambah Pertanyaan' untuk mulai." />
      )}
      {questions.map((q, idx) => {
        const qChoices = choices.filter((c) => c.question_id === q.id);
        const isAddingHere = addingChoiceFor === String(q.id);
        const isDeletingThis = deletingQuestion === String(q.id);
        return (
          <Paper
            key={q.id}
            variant="outlined"
            sx={{
              p: 2,
              borderRadius: 2,
              borderLeft: 6,
              borderLeftColor: "primary.main",
              opacity: isDeletingThis ? 0.5 : 1,
              transition: "opacity 0.2s",
            }}
          >
            <Stack direction="row" gap={1} alignItems="flex-start">
              <Typography fontWeight="bold" color="primary.main" mt={1.25}>
                {idx + 1}.
              </Typography>
              <TextField
                fullWidth
                variant="standard"
                value={draftQuestions[String(q.id)] ?? ""}
                onChange={(e) =>
                  setDraftQuestions((prev) => ({
                    ...prev,
                    [String(q.id)]: e.target.value,
                  }))
                }
                onBlur={() => handleQuestionBlur(q)}
                placeholder="Tulis pertanyaan..."
                InputProps={{ sx: { fontSize: 18, fontWeight: 500 } }}
                disabled={isDeletingThis}
              />
              <Tooltip title="Hapus pertanyaan">
                <span>
                  <IconButton
                    color="error"
                    size="small"
                    onClick={() => handleDeleteQuestion(q)}
                    disabled={isDeletingThis}
                  >
                    {isDeletingThis ? (
                      <CircularProgress size={18} color="error" />
                    ) : (
                      <DeleteOutlineIcon />
                    )}
                  </IconButton>
                </span>
              </Tooltip>
            </Stack>

            <Stack gap={1.25} mt={2.5} pl={3.5}>
              {qChoices.map((c) => {
                const isDeletingThisChoice = deletingChoice === String(c.id);
                return (
                  <Stack
                    key={c.id}
                    direction="row"
                    gap={1.5}
                    alignItems="center"
                    sx={{
                      opacity: isDeletingThisChoice ? 0.5 : 1,
                      transition: "opacity 0.15s",
                    }}
                  >
                    <RadioButtonUncheckedIcon sx={{ color: "text.disabled" }} />
                    <TextField
                      fullWidth
                      variant="standard"
                      value={draftChoices[String(c.id)] ?? ""}
                      onChange={(e) =>
                        setDraftChoices((prev) => ({
                          ...prev,
                          [String(c.id)]: e.target.value,
                        }))
                      }
                      onBlur={() => handleChoiceBlur(c)}
                      placeholder="Tulis opsi jawaban..."
                      InputProps={{ sx: { fontSize: 15 } }}
                      disabled={isDeletingThisChoice}
                    />
                    <Tooltip title="Hapus opsi">
                      <span>
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteChoice(c)}
                          disabled={isDeletingThisChoice}
                        >
                          {isDeletingThisChoice ? (
                            <CircularProgress size={16} />
                          ) : (
                            <DeleteOutlineIcon fontSize="small" />
                          )}
                        </IconButton>
                      </span>
                    </Tooltip>
                  </Stack>
                );
              })}

              {isAddingHere && (
                <Stack direction="row" gap={1.5} alignItems="center" sx={{ opacity: 0.7 }}>
                  <CircularProgress size={16} />
                  <Typography variant="body2" color="text.secondary">
                    Menambahkan opsi...
                  </Typography>
                </Stack>
              )}

              <Button
                size="small"
                startIcon={
                  isAddingHere ? <CircularProgress size={14} /> : <AddIcon />
                }
                onClick={() => handleAddChoice(q.id)}
                sx={{ alignSelf: "flex-start", textTransform: "none", mt: 0.5 }}
                disabled={isAddingHere || isDeletingThis}
              >
                {isAddingHere ? "Menambahkan..." : "Tambah Opsi Jawaban"}
              </Button>
            </Stack>
          </Paper>
        );
      })}

      {addingQuestion && (
        <Paper
          variant="outlined"
          sx={{
            p: 2,
            borderRadius: 2,
            borderLeft: 6,
            borderLeftColor: "primary.main",
            opacity: 0.7,
          }}
        >
          <Stack direction="row" gap={1.5} alignItems="center">
            <CircularProgress size={18} />
            <Typography color="text.secondary">
              Menambahkan pertanyaan baru...
            </Typography>
          </Stack>
        </Paper>
      )}

      <Box>
        <Button
          variant="contained"
          startIcon={
            addingQuestion ? (
              <CircularProgress size={16} color="inherit" />
            ) : (
              <AddIcon />
            )
          }
          onClick={handleAddQuestion}
          disabled={addingQuestion}
        >
          {addingQuestion ? "Menambahkan..." : "Tambah Pertanyaan"}
        </Button>
      </Box>
    </Stack>
  );
}
