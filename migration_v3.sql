-- Migration v3: Server-side RSVP enforcement
-- Jalankan di Supabase SQL Editor.
-- Migration ini AMAN untuk data production — duplikat lama akan dibersihkan
-- otomatis (keep response paling awal; answers ikut via ON DELETE CASCADE).
--
-- DRY-RUN opsional (lihat yang akan dihapus sebelum jalanin migration):
--   SELECT request_id, lower(responder_name), count(*) AS n
--   FROM public.responses
--   GROUP BY 1,2 HAVING count(*) > 1
--   ORDER BY n DESC;

-- 0a. Rapikan spasi di nama lama supaya match dengan trim() di RPC
UPDATE public.responses
SET responder_name = trim(responder_name)
WHERE responder_name IS DISTINCT FROM trim(responder_name);

-- 0b. Hapus duplikat (request_id, lower(responder_name)).
--     KEEP yang paling awal: accepted_at ASC → id ASC sebagai tiebreaker.
--     Row answers yang terkait ikut terhapus via FK ON DELETE CASCADE.
WITH ranked AS (
  SELECT id,
         row_number() OVER (
           PARTITION BY request_id, lower(responder_name)
           ORDER BY accepted_at ASC NULLS LAST, id ASC
         ) AS rn
  FROM public.responses
)
DELETE FROM public.responses r
USING ranked
WHERE ranked.id = r.id AND ranked.rn > 1;

-- 1. Case-insensitive UNIQUE: satu nama per request
CREATE UNIQUE INDEX IF NOT EXISTS idx_responses_unique_name
  ON public.responses (request_id, lower(responder_name));

-- 2. RPC: satu-satunya jalan masuk untuk submit RSVP + answers.
--    SECURITY DEFINER = jalan sebagai owner, bypass RLS → kita yang kontrol.
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

  -- current_date > close_date → tanggal lewat total (strictly after)
  IF v_close_date IS NOT NULL AND current_date > v_close_date THEN
    RAISE EXCEPTION 'deadline_passed' USING ERRCODE = 'P0001';
  END IF;

  IF p_accept THEN
    -- Advisory lock per request → serialize concurrent accept submits,
    -- cegah race condition yang bisa tembus limit.
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

  -- Insert answers hanya kalau hadir + ada payload valid
  IF p_accept AND jsonb_typeof(p_answers) = 'array' THEN
    FOR v_answer IN SELECT * FROM jsonb_array_elements(p_answers)
    LOOP
      IF (v_answer ? 'question_id') AND (v_answer ? 'choice_id') THEN
        -- Verifikasi question+choice memang milik request ini
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

REVOKE ALL ON FUNCTION public.submit_response(uuid, text, boolean, jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.submit_response(uuid, text, boolean, jsonb) TO anon, authenticated;

-- 3. Cabut akses INSERT langsung dari public pada responses & answers.
--    Setelah ini, satu-satunya jalan nulis adalah lewat submit_response().
DROP POLICY IF EXISTS "Anyone can submit response" ON public.responses;
DROP POLICY IF EXISTS "Anyone can submit answers" ON public.answers;
