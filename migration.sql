-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- requests table
CREATE TABLE IF NOT EXISTS requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id),
    title CHARACTER VARYING NOT NULL,
    address TEXT,
    acceptance_label CHARACTER VARYING,
    rejection_label CHARACTER VARYING,
    "limit" SMALLINT,
    close_date DATE,
    primary_color CHARACTER VARYING,
    secondary_color CHARACTER VARYING,
    background_color CHARACTER VARYING,
    italicize BOOLEAN DEFAULT FALSE,
    font_family CHARACTER VARYING,
    background_gradient BOOLEAN DEFAULT FALSE,
    secondary_gradient BOOLEAN DEFAULT FALSE,
    style CHARACTER VARYING,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- questions table
CREATE TABLE IF NOT EXISTS questions (
    id BIGSERIAL PRIMARY KEY,
    request_id UUID REFERENCES requests(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL
);

-- choices table
CREATE TABLE IF NOT EXISTS choices (
    id BIGSERIAL PRIMARY KEY,
    question_id BIGINT REFERENCES questions(id) ON DELETE CASCADE,
    choice_text TEXT NOT NULL
);

-- responses table
CREATE TABLE IF NOT EXISTS responses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_id UUID REFERENCES requests(id) ON DELETE CASCADE,
    responder_name CHARACTER VARYING NOT NULL,
    accept BOOLEAN NOT NULL DEFAULT FALSE,
    accepted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- answers table
CREATE TABLE IF NOT EXISTS answers (
    id BIGSERIAL PRIMARY KEY,
    response_id UUID REFERENCES responses(id) ON DELETE CASCADE,
    question_id BIGINT REFERENCES questions(id) ON DELETE CASCADE,
    choice_id BIGINT REFERENCES choices(id) ON DELETE SET NULL
);

-- RLS Policies (enable row level security)
ALTER TABLE requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE choices ENABLE ROW LEVEL SECURITY;
ALTER TABLE responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE answers ENABLE ROW LEVEL SECURITY;

-- requests: owner can do all, public can read
CREATE POLICY "Users can manage own requests" ON requests
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Anyone can read requests" ON requests
    FOR SELECT USING (true);

-- questions: public read, owner write
CREATE POLICY "Anyone can read questions" ON questions
    FOR SELECT USING (true);

CREATE POLICY "Owner can manage questions" ON questions
    FOR ALL USING (
        EXISTS (SELECT 1 FROM requests WHERE requests.id = questions.request_id AND requests.user_id = auth.uid())
    );

-- choices: public read, owner write
CREATE POLICY "Anyone can read choices" ON choices
    FOR SELECT USING (true);

CREATE POLICY "Owner can manage choices" ON choices
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM questions q
            JOIN requests r ON r.id = q.request_id
            WHERE q.id = choices.question_id AND r.user_id = auth.uid()
        )
    );

-- responses: anyone can insert, owner can read
CREATE POLICY "Anyone can submit response" ON responses
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Owner can read responses" ON responses
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM requests WHERE requests.id = responses.request_id AND requests.user_id = auth.uid())
    );

-- answers: anyone can insert, owner can read
CREATE POLICY "Anyone can submit answers" ON answers
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Owner can read answers" ON answers
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM responses res
            JOIN requests r ON r.id = res.request_id
            WHERE res.id = answers.response_id AND r.user_id = auth.uid()
        )
    );
