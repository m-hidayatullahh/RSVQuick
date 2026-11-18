-- Migration v5: Rate limiting untuk cegah brute-force / spam
-- Jalankan di Supabase SQL Editor (setelah v4 sudah diterapkan).

-- 1. Tabel penampung counter (RLS enabled, tanpa policy → tertutup untuk anon,
--    hanya diakses via SECURITY DEFINER functions).
CREATE TABLE IF NOT EXISTS public.rate_limits (
  ip text NOT NULL,
  action text NOT NULL,
  window_start timestamptz NOT NULL,
  count int NOT NULL DEFAULT 1,
  PRIMARY KEY (ip, action, window_start)
);

ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_rate_limits_window
  ON public.rate_limits (window_start);

-- 2. Helper: ambil IP client dari header X-Forwarded-For yang di-forward PostgREST
CREATE OR REPLACE FUNCTION public.client_ip()
RETURNS text
LANGUAGE sql
STABLE
AS $$
  SELECT COALESCE(
    split_part(
      current_setting('request.headers', true)::json->>'x-forwarded-for',
      ',', 1
    ),
    'unknown'
  );
$$;

-- 3. Helper: cek + increment counter secara atomik.
--    Window = per-menit (date_trunc). Max N per window.
--    Opportunistic GC (1% chance) untuk hapus bucket > 1 jam.
CREATE OR REPLACE FUNCTION public.rate_limit_check(
  p_action text,
  p_max int
) RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  v_ip text;
  v_window timestamptz;
  v_count int;
BEGIN
  v_ip := public.client_ip();
  v_window := date_trunc('minute', now());

  IF random() < 0.01 THEN
    DELETE FROM public.rate_limits
    WHERE window_start < now() - interval '1 hour';
  END IF;

  INSERT INTO public.rate_limits (ip, action, window_start, count)
  VALUES (v_ip, p_action, v_window, 1)
  ON CONFLICT (ip, action, window_start)
  DO UPDATE SET count = public.rate_limits.count + 1
  RETURNING count INTO v_count;

  IF v_count > p_max THEN
    RAISE EXCEPTION 'rate_limited' USING ERRCODE = 'P0001';
  END IF;
END;
$$;

-- 4. Update submit_response: panggil rate_limit_check di awal (20/menit per IP)
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
  PERFORM public.rate_limit_check('submit_response', 20);

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
