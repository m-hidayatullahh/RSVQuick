export default {
  // Buttons / common
  "buttons.create": "Buat",
  "buttons.save": "Simpan",
  "buttons.edit": "Edit",
  "buttons.delete": "Hapus",
  "buttons.cancel": "Batal",
  "buttons.show": "Lihat",
  "buttons.list": "Daftar",
  "buttons.back": "Kembali",
  "buttons.confirm": "Konfirmasi",
  "buttons.refresh": "Muat Ulang",
  "buttons.clone": "Duplikat",
  "buttons.notAccessTitle": "Anda tidak punya akses",
  "buttons.logout": "Keluar",
  "buttons.undo": "Batalkan",
  "buttons.import": "Impor",
  "buttons.export": "Ekspor",
  "buttons.filter": "Filter",
  "buttons.clear": "Bersihkan",
  "buttons.search": "Cari",

  // Login page
  "pages.login.title": "Masuk ke akun Anda",
  "pages.login.signin": "Masuk",
  "pages.login.signup": "Daftar",
  "pages.login.divider": "atau",
  "pages.login.fields.email": "Email",
  "pages.login.fields.password": "Password",
  "pages.login.errors.validEmail": "Email tidak valid",
  "pages.login.errors.requiredEmail": "Email wajib diisi",
  "pages.login.errors.requiredPassword": "Password wajib diisi",
  "pages.login.buttons.submit": "Masuk",
  "pages.login.buttons.forgotPassword": "Lupa password?",
  "pages.login.buttons.noAccount": "Belum punya akun?",
  "pages.login.buttons.rememberMe": "Ingat saya",

  // Register page
  "pages.register.title": "Daftar akun baru",
  "pages.register.signup": "Daftar",
  "pages.register.signin": "Masuk",
  "pages.register.fields.email": "Email",
  "pages.register.fields.password": "Password",
  "pages.register.errors.validEmail": "Email tidak valid",
  "pages.register.errors.requiredEmail": "Email wajib diisi",
  "pages.register.errors.requiredPassword": "Password wajib diisi",
  "pages.register.buttons.submit": "Daftar",
  "pages.register.buttons.haveAccount": "Sudah punya akun?",

  // Forgot password
  "pages.forgotPassword.title": "Lupa password?",
  "pages.forgotPassword.fields.email": "Email",
  "pages.forgotPassword.errors.validEmail": "Email tidak valid",
  "pages.forgotPassword.errors.requiredEmail": "Email wajib diisi",
  "pages.forgotPassword.buttons.submit": "Kirim instruksi reset",
  "pages.forgotPassword.buttons.haveAccount": "Sudah punya akun?",
  "pages.forgotPassword.signin": "Masuk",

  // Update password
  "pages.updatePassword.title": "Ubah password",
  "pages.updatePassword.fields.password": "Password baru",
  "pages.updatePassword.fields.confirmPassword": "Konfirmasi password baru",
  "pages.updatePassword.errors.confirmPasswordNotMatch": "Konfirmasi password tidak cocok",
  "pages.updatePassword.errors.requiredPassword": "Password wajib diisi",
  "pages.updatePassword.errors.requiredConfirmPassword": "Konfirmasi password wajib diisi",
  "pages.updatePassword.buttons.submit": "Ubah password",

  // Error pages
  "pages.error.info": "Kesalahan",
  "pages.error.404": "Halaman tidak ditemukan",
  "pages.error.resource404": "Pastikan Anda sudah membuat resource",
  "pages.error.backHome": "Kembali ke beranda",

  // Notifications
  "notifications.success": "Berhasil",
  "notifications.error": "Terjadi kesalahan `{{action}}` pada resource `{{resource}}`",
  "notifications.createSuccess": "{{resource}} berhasil dibuat",
  "notifications.createError": "Gagal membuat {{resource}}",
  "notifications.deleteSuccess": "{{resource}} berhasil dihapus",
  "notifications.deleteError": "Gagal menghapus {{resource}}",
  "notifications.editSuccess": "{{resource}} berhasil diperbarui",
  "notifications.editError": "Gagal memperbarui {{resource}}",
  "notifications.undoable": "Dibatalkan dalam {{seconds}} detik",
  "notifications.importProgress": "Mengimpor: {{processed}}/{{total}}",
  "notifications.autoSave": "Tersimpan otomatis",
  "notifications.autoSaveError": "Gagal menyimpan otomatis",

  // Table
  "table.actions": "Aksi",
  "table.noData": "Tidak ada data",

  // Document title
  "documentTitle.default": "RSVQuick",
  "documentTitle.suffix": "RSVQuick",

  // Unsaved changes
  "warnWhenUnsavedChanges": "Perubahan belum disimpan akan hilang. Lanjutkan?",

  // Resources — titles
  "requests.titles.list": "Daftar Undangan",
  "requests.titles.create": "Buat Undangan",
  "requests.titles.show": "Detail Undangan",
  "requests.titles.edit": "Edit Undangan",
  "admin-users.titles.list": "Kelola Pengguna",

  // Resource names (dipakai di notifikasi via {{resource}})
  "requests.requests": "Undangan",
  "responses.responses": "Respon",
  "invitations.invitations": "Tamu Undangan",
  "profiles.profiles": "Profil",
  "admin-users.admin-users": "Pengguna",
  "questions.questions": "Pertanyaan",
  "choices.choices": "Pilihan",
  "answers.answers": "Jawaban",

  // Misc
  "loading": "Memuat...",
} as const;
