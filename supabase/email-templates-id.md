# Supabase Email Templates — Bahasa Indonesia

Paste template ini ke **Supabase Dashboard → Authentication → Email Templates**
di tab yang sesuai, lalu klik **Save**.

Variable Supabase yang tersedia:
- `{{ .ConfirmationURL }}` — link konfirmasi/aksi
- `{{ .Token }}` — kode OTP
- `{{ .TokenHash }}` — hash token
- `{{ .SiteURL }}` — base URL situs
- `{{ .Email }}` — email user
- `{{ .NewEmail }}` — email baru (untuk Change Email)

---

## 1. Confirm Signup (saat register)

**Subject:** `Konfirmasi Akun RSVQuick Anda`

```html
<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;">
  <h2 style="color:#1976d2;">Selamat Datang di RSVQuick!</h2>
  <p>Halo,</p>
  <p>Terima kasih telah mendaftar. Satu langkah lagi — silakan konfirmasi alamat email Anda dengan menekan tombol di bawah:</p>
  <p style="text-align:center;margin:24px 0;">
    <a href="{{ .ConfirmationURL }}"
       style="background:#1976d2;color:white;padding:12px 28px;text-decoration:none;border-radius:4px;display:inline-block;font-weight:bold;">
      Konfirmasi Email Saya
    </a>
  </p>
  <p style="color:#666;font-size:13px;">
    Atau salin tautan ini ke browser Anda:<br>
    <a href="{{ .ConfirmationURL }}" style="word-break:break-all;">{{ .ConfirmationURL }}</a>
  </p>
  <p style="color:#666;font-size:13px;">Link berlaku 24 jam. Jika Anda tidak merasa mendaftar, abaikan email ini.</p>
  <hr style="border:none;border-top:1px solid #eee;margin:24px 0;">
  <p style="color:#999;font-size:12px;text-align:center;">Terima kasih,<br>Tim RSVQuick</p>
</div>
```

---

## 2. Reset Password

**Subject:** `Reset Password RSVQuick`

```html
<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;">
  <h2 style="color:#1976d2;">Reset Password</h2>
  <p>Halo,</p>
  <p>Kami menerima permintaan untuk mereset password akun Anda. Klik tombol di bawah untuk membuat password baru:</p>
  <p style="text-align:center;margin:24px 0;">
    <a href="{{ .ConfirmationURL }}"
       style="background:#1976d2;color:white;padding:12px 28px;text-decoration:none;border-radius:4px;display:inline-block;font-weight:bold;">
      Reset Password Saya
    </a>
  </p>
  <p style="color:#666;font-size:13px;">
    Atau salin tautan ini ke browser Anda:<br>
    <a href="{{ .ConfirmationURL }}" style="word-break:break-all;">{{ .ConfirmationURL }}</a>
  </p>
  <p style="color:#666;font-size:13px;">
    <strong>Link berlaku 60 menit.</strong> Jika Anda tidak meminta reset password, abaikan email ini — password Anda tidak akan berubah.
  </p>
  <hr style="border:none;border-top:1px solid #eee;margin:24px 0;">
  <p style="color:#999;font-size:12px;text-align:center;">Terima kasih,<br>Tim RSVQuick</p>
</div>
```

---

## 3. Magic Link (login tanpa password)

**Subject:** `Link Login RSVQuick`

```html
<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;">
  <h2 style="color:#1976d2;">Login ke RSVQuick</h2>
  <p>Halo,</p>
  <p>Klik tombol di bawah untuk masuk ke akun Anda tanpa password:</p>
  <p style="text-align:center;margin:24px 0;">
    <a href="{{ .ConfirmationURL }}"
       style="background:#1976d2;color:white;padding:12px 28px;text-decoration:none;border-radius:4px;display:inline-block;font-weight:bold;">
      Masuk Sekarang
    </a>
  </p>
  <p style="color:#666;font-size:13px;">
    Atau salin tautan ini ke browser Anda:<br>
    <a href="{{ .ConfirmationURL }}" style="word-break:break-all;">{{ .ConfirmationURL }}</a>
  </p>
  <p style="color:#666;font-size:13px;">
    <strong>Link berlaku 60 menit</strong> dan hanya bisa digunakan satu kali. Jika Anda tidak meminta login, abaikan email ini.
  </p>
  <hr style="border:none;border-top:1px solid #eee;margin:24px 0;">
  <p style="color:#999;font-size:12px;text-align:center;">Terima kasih,<br>Tim RSVQuick</p>
</div>
```

---

## 4. Change Email Address

**Subject:** `Konfirmasi Perubahan Email RSVQuick`

```html
<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;">
  <h2 style="color:#1976d2;">Konfirmasi Perubahan Email</h2>
  <p>Halo,</p>
  <p>Anda meminta untuk mengubah alamat email akun RSVQuick dari:</p>
  <p style="background:#f5f5f5;padding:12px;border-radius:4px;">
    <strong>Email lama:</strong> {{ .Email }}<br>
    <strong>Email baru:</strong> {{ .NewEmail }}
  </p>
  <p>Konfirmasi perubahan ini dengan menekan tombol di bawah:</p>
  <p style="text-align:center;margin:24px 0;">
    <a href="{{ .ConfirmationURL }}"
       style="background:#1976d2;color:white;padding:12px 28px;text-decoration:none;border-radius:4px;display:inline-block;font-weight:bold;">
      Konfirmasi Perubahan Email
    </a>
  </p>
  <p style="color:#666;font-size:13px;">
    Atau salin tautan ini ke browser Anda:<br>
    <a href="{{ .ConfirmationURL }}" style="word-break:break-all;">{{ .ConfirmationURL }}</a>
  </p>
  <p style="color:#666;font-size:13px;">
    <strong>Link berlaku 24 jam.</strong> Jika Anda tidak meminta perubahan ini, segera login dan ubah password Anda — akun Anda mungkin disusupi.
  </p>
  <hr style="border:none;border-top:1px solid #eee;margin:24px 0;">
  <p style="color:#999;font-size:12px;text-align:center;">Terima kasih,<br>Tim RSVQuick</p>
</div>
```

---

## 5. Invite User (undang user baru)

**Subject:** `Anda Diundang Bergabung ke RSVQuick`

```html
<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;">
  <h2 style="color:#1976d2;">Anda Diundang!</h2>
  <p>Halo,</p>
  <p>Anda telah diundang untuk bergabung di <strong>RSVQuick</strong> — platform untuk mengelola undangan & RSVP acara dengan mudah.</p>
  <p>Klik tombol di bawah untuk menerima undangan dan membuat akun Anda:</p>
  <p style="text-align:center;margin:24px 0;">
    <a href="{{ .ConfirmationURL }}"
       style="background:#1976d2;color:white;padding:12px 28px;text-decoration:none;border-radius:4px;display:inline-block;font-weight:bold;">
      Terima Undangan
    </a>
  </p>
  <p style="color:#666;font-size:13px;">
    Atau salin tautan ini ke browser Anda:<br>
    <a href="{{ .ConfirmationURL }}" style="word-break:break-all;">{{ .ConfirmationURL }}</a>
  </p>
  <p style="color:#666;font-size:13px;">Link berlaku 7 hari. Jika Anda tidak mengharapkan undangan ini, abaikan email ini.</p>
  <hr style="border:none;border-top:1px solid #eee;margin:24px 0;">
  <p style="color:#999;font-size:12px;text-align:center;">Terima kasih,<br>Tim RSVQuick</p>
</div>
```

---

## 6. Reauthentication (verifikasi ulang untuk aksi sensitif)

**Subject:** `Verifikasi Ulang — Kode: {{ .Token }}`

```html
<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;">
  <h2 style="color:#1976d2;">Kode Verifikasi</h2>
  <p>Halo,</p>
  <p>Gunakan kode berikut untuk menyelesaikan aksi Anda di RSVQuick:</p>
  <p style="text-align:center;margin:24px 0;">
    <span style="font-size:32px;font-weight:bold;letter-spacing:4px;background:#f5f5f5;padding:16px 32px;border-radius:8px;display:inline-block;color:#1976d2;">
      {{ .Token }}
    </span>
  </p>
  <p style="color:#666;font-size:13px;">
    <strong>Kode berlaku 60 menit.</strong> Jika Anda tidak meminta kode ini, abaikan email ini.
  </p>
  <hr style="border:none;border-top:1px solid #eee;margin:24px 0;">
  <p style="color:#999;font-size:12px;text-align:center;">Terima kasih,<br>Tim RSVQuick</p>
</div>
```

---

## Cara Apply di Dashboard

1. Buka https://supabase.com/dashboard/project/`<project-ref>`/auth/templates
2. Pilih template dari dropdown (Confirm signup / Reset Password / dll)
3. Ganti **Subject heading** dengan subject bahasa Indonesia di atas
4. Paste HTML template ke body
5. Klik **Save template**
6. Ulangi untuk semua template

**Tips:** Test kirim ke email pribadi dulu sebelum deploy ke production.
