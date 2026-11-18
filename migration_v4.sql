-- Migration v4: Konfirmasi hanya untuk nama yang terdaftar di invitations
-- Jalankan di Supabase SQL Editor (setelah v3 sudah diterapkan).

-- 0. Normalisasi: trim spasi di invitations.name supaya match konsisten
UPDATE public.invitations
SET name = trim(name)
WHERE name IS DISTINCT FROM trim(name);

-- 1. Index pendukung untuk lookup case-insensitive by request
CREATE INDEX IF NOT EXISTS idx_invitations_name_lookup
  ON public.invitations (request_id, lower(name));

-- 2. Update RPC: enforce invitation match.
--    Gate: hanya enforce kalau request punya >= 1 invitation (open-RSVP tetap
--    berfungsi untuk request yang belum isi guest list).
CREATE OR REPLACE FUNCTION public.submit_response(
  p_request_id uuid,
  p_responder_name text,
  p_accept boolean,
  p_answers jsonb DEFAULT '[]'::jsonb
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_response_id uuid;
  v_close_date date;
  v_limit smallint;
  v_count int;
  v_name text;
  v_answer jsonb;
  v_invited boolean;
BEGIN
  v_name := trim(coalesce(p_responder_name, ''));
  IF v_name = '' THEN
    RAISE EXCEPTION 'name_required' USING ERRCODE = 'P0001';
  END IF;

  SELECT close_date, "limit" INTO v_close_date, v_limit
  FROM public.requests
  WHERE id = p_request_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'request_not_found' USING ERRCODE = 'P0001';
  END IF;

  IF v_close_date IS NOT NULL AND current_date > v_close_date THEN
    RAISE EXCEPTION 'deadline_passed' USING ERRCODE = 'P0001';
  END IF;

  -- Selalu enforce: responder harus terdaftar di invitations untuk request ini.
  -- Kalau invitations kosong, tidak ada yang bisa konfirmasi (by design).
  SELECT EXISTS (
    SELECT 1 FROM public.invitations
    WHERE request_id = p_request_id
      AND lower(name) = lower(v_name)
  ) INTO v_invited;

  IF NOT v_invited THEN
    RAISE EXCEPTION 'not_invited' USING ERRCODE = 'P0001';
  END IF;

  IF p_accept THEN
    PERFORM pg_advisory_xact_lock(hashtext(p_request_id::text));

    SELECT count(*) INTO v_count
    FROM public.responses
    WHERE request_id = p_request_id AND accept = true;

    IF v_limit IS NOT NULL AND v_limit > 0 AND v_count >= v_limit THEN
      RAISE EXCEPTION 'capacity_full' USING ERRCODE = 'P0001';
    END IF;
  END IF;

  BEGIN
    INSERT INTO public.responses (request_id, responder_name, accept)
    VALUES (p_request_id, v_name, p_accept)
    RETURNING id INTO v_response_id;
  EXCEPTION WHEN unique_violation THEN
    RAISE EXCEPTION 'duplicate_name' USING ERRCODE = 'P0001';
  END;

  IF p_accept AND jsonb_typeof(p_answers) = 'array' THEN
    FOR v_answer IN SELECT * FROM jsonb_array_elements(p_answers)
    LOOP
      IF (v_answer ? 'question_id') AND (v_answer ? 'choice_id') THEN
        IF EXISTS (
          SELECT 1
          FROM public.questions q
          JOIN public.choices c ON c.question_id = q.id
          WHERE q.request_id = p_request_id
            AND q.id = (v_answer->>'question_id')::bigint
            AND c.id = (v_answer->>'choice_id')::bigint
        ) THEN
          INSERT INTO public.answers (response_id, question_id, choice_id)
          VALUES (
            v_response_id,
            (v_answer->>'question_id')::bigint,
            (v_answer->>'choice_id')::bigint
          );
        END IF;
      END IF;
    END LOOP;
  END IF;

  RETURN v_response_id;
END;
$$;
