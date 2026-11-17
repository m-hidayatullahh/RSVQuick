export interface IQuestion {
  id: string;
  question_text: string;
  request_id: string;
}

export interface IChoice {
  id: string;
  choice_text: string;
  question_id: string;
}

export interface IAnswer {
  id: string;
  question_id: string;
  response_id: string;
  choice_id: string;
}

export interface IInvitation {
  id: string;
  request_id: string;
  name: string;
  jabatan: string | null;
  email: string | null;
  wa_number: string | null;
  sent_email_at: string | null;
  sent_wa_at: string | null;
  created_at: string;
}

export interface IProfile {
  id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  role: "admin" | "user";
  created_at: string;
  updated_at: string;
}

export type Nullable<T> = {
  [P in keyof T]: T[P] | null;
};
