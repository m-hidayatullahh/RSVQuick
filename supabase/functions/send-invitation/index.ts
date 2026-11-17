// Deploy: supabase functions deploy send-invitation
// Secrets wajib: SMTP_USER, SMTP_PASS (+ opsional SMTP_HOST, SMTP_PORT)
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import nodemailer from "npm:nodemailer@6.9.13";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface Invitation {
  id: string;
  name: string;
  jabatan?: string;
  email: string;
  rsvpLink: string;
}

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  let payload: { invitations: Invitation[]; eventTitle: string; fromName?: string };
  try {
    payload = await req.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON body" }, 400);
  }

  const { invitations, eventTitle, fromName } = payload;
  if (!Array.isArray(invitations) || !invitations.length) {
    return jsonResponse({ error: "invitations kosong" }, 400);
  }

  const SMTP_HOST = Deno.env.get("SMTP_HOST") ?? "smtp.gmail.com";
  const SMTP_PORT = parseInt(Deno.env.get("SMTP_PORT") ?? "465");
  const SMTP_USER = Deno.env.get("SMTP_USER") ?? "";
  const SMTP_PASS = (Deno.env.get("SMTP_PASS") ?? "").replace(/\s/g, "");

  if (!SMTP_USER || !SMTP_PASS) {
    return jsonResponse(
      { error: "SMTP_USER / SMTP_PASS belum di-set di Edge Function Secrets" },
      500
    );
  }

  let transporter: ReturnType<typeof nodemailer.createTransport>;
  try {
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });
  } catch (err) {
    return jsonResponse({ error: `SMTP init error: ${String(err)}` }, 500);
  }

  const results: { id: string; success: boolean; error?: string }[] = [];

  for (const inv of invitations) {
    try {
      const html = `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;">
          <h2 style="color:#1976d2;">Undangan RSVP</h2>
          <p>Kepada Yth.</p>
          <p><strong>${inv.name}</strong>${inv.jabatan ? ` &mdash; ${inv.jabatan}` : ""}</p>
          <p>Dengan hormat, kami mengundang Anda untuk hadir pada acara:</p>
          <h3 style="color:#333;">${eventTitle}</h3>
          <p>Mohon konfirmasi kehadiran Anda melalui tautan berikut:</p>
          <a href="${inv.rsvpLink}"
             style="background:#1976d2;color:white;padding:12px 24px;text-decoration:none;border-radius:4px;display:inline-block;margin:8px 0;">
            Konfirmasi Kehadiran
          </a>
          <p style="margin-top:16px;color:#666;font-size:13px;">
            Atau salin tautan ini: <a href="${inv.rsvpLink}">${inv.rsvpLink}</a>
          </p>
        </div>`;

      await transporter.sendMail({
        from: `"${fromName ?? "RSVQuick"}" <${SMTP_USER}>`,
        to: inv.email,
        subject: `Undangan: ${eventTitle}`,
        html,
      });
      results.push({ id: inv.id, success: true });
    } catch (err: any) {
      results.push({ id: inv.id, success: false, error: err?.message ?? String(err) });
    }
  }

  try {
    transporter.close();
  } catch {
    // ignore
  }

  return jsonResponse({ results });
});
