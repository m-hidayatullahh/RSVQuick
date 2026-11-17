import { AuthBindings } from "@refinedev/core";
import { supabaseClient, clearRoleCache, getCachedRole } from "./utility";

const authProvider: AuthBindings = {
  login: async ({ email, password, providerName }) => {
    clearRoleCache();
    try {
      if (providerName) {
        const { data, error } = await supabaseClient.auth.signInWithOAuth({
          provider: providerName,
        });
        if (error) return { success: false, error };
        if (data?.url) return { success: true, redirectTo: "/requests" };
      }

      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email,
        password,
      });

      if (error) return { success: false, error };
      if (data?.user) return { success: true, redirectTo: "/requests" };
    } catch (error: any) {
      return { success: false, error };
    }

    return {
      success: false,
      error: { message: "Login gagal", name: "Email atau password salah" },
    };
  },

  register: async ({ email, password }) => {
    try {
      const { data, error } = await supabaseClient.auth.signUp({
        email,
        password,
      });
      if (error) return { success: false, error };
      if (data) return { success: true, redirectTo: "/login" };
    } catch (error: any) {
      return { success: false, error };
    }
    return {
      success: false,
      error: { message: "Registrasi gagal", name: "Email atau password tidak valid" },
    };
  },

  forgotPassword: async ({ email }) => {
    const trimmed = (email ?? "").trim();
    const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!trimmed) {
      return {
        success: false,
        error: { message: "Email harus diisi", name: "Email kosong" },
      };
    }
    if (!EMAIL_RE.test(trimmed)) {
      return {
        success: false,
        error: {
          message: "Format email tidak valid",
          name: "Contoh: nama@domain.com",
        },
      };
    }

    try {
      const { error } = await supabaseClient.auth.resetPasswordForEmail(
        trimmed,
        { redirectTo: `${window.location.origin}/update-password` }
      );
      // Rate limit atau error server — tampilkan ke user supaya ga bingung
      if (error) {
        const status = (error as any)?.status;
        if (status === 429) {
          return {
            success: false,
            error: {
              message: "Terlalu banyak permintaan",
              name: "Coba lagi dalam beberapa menit.",
            },
          };
        }
        return { success: false, error };
      }
      // Keamanan: jangan reveal apakah email terdaftar (enumeration attack).
      // Pesan netral — kalau email ada, link bakal masuk ke inbox.
      return {
        success: true,
        successNotification: {
          message: "Cek inbox email Anda",
          description: `Jika ${trimmed} terdaftar, link reset password sudah dikirim. Cek folder Spam/Promosi juga jika tidak ada di Inbox.`,
        },
      };
    } catch (error: any) {
      return {
        success: false,
        error: {
          message: "Gagal mengirim email reset",
          name: error?.message ?? "Coba lagi atau hubungi admin.",
        },
      };
    }
  },

  updatePassword: async ({ password }) => {
    const pw = (password ?? "").trim();
    if (!pw) {
      return {
        success: false,
        error: { message: "Password harus diisi", name: "Password kosong" },
      };
    }
    if (pw.length < 6) {
      return {
        success: false,
        error: {
          message: "Password terlalu pendek",
          name: "Minimal 6 karakter.",
        },
      };
    }
    try {
      const { data, error } = await supabaseClient.auth.updateUser({ password: pw });
      if (error) return { success: false, error };
      if (data) {
        return {
          success: true,
          redirectTo: "/login",
          successNotification: {
            message: "Password berhasil diperbarui",
            description: "Silakan login dengan password baru Anda.",
          },
        };
      }
    } catch (error: any) {
      return {
        success: false,
        error: {
          message: "Gagal update password",
          name: error?.message ?? "Coba lagi atau hubungi admin.",
        },
      };
    }
    return {
      success: false,
      error: { message: "Update password gagal", name: "Password tidak valid" },
    };
  },

  logout: async () => {
    clearRoleCache();
    const { error } = await supabaseClient.auth.signOut();
    if (error) return { success: false, error };
    return { success: true, redirectTo: "/" };
  },

  onError: async (error) => {
    console.error(error);
    return { error };
  },

  check: async () => {
    try {
      const { data } = await supabaseClient.auth.getSession();
      if (!data.session) {
        clearRoleCache();
        return {
          authenticated: false,
          error: { message: "Sesi tidak ditemukan", name: "Check failed" },
          logout: true,
          redirectTo: "/login",
        };
      }
    } catch (error: any) {
      clearRoleCache();
      return {
        authenticated: false,
        error: error || { message: "Check failed", name: "Not authenticated" },
        logout: true,
        redirectTo: "/login",
      };
    }
    return { authenticated: true };
  },

  getPermissions: async () => {
    const role = await getCachedRole();
    return role ?? "user";
  },

  getIdentity: async () => {
    const { data } = await supabaseClient.auth.getUser();
    if (!data?.user) return null;

    try {
      const { data: profile } = await (supabaseClient as any)
        .from("profiles")
        .select("full_name, avatar_url, role")
        .eq("id", data.user.id)
        .single();

      return {
        ...data.user,
        name: profile?.full_name || data.user.email,
        avatar: profile?.avatar_url || null,
        role: profile?.role ?? "user",
      };
    } catch {
      return {
        ...data.user,
        name: data.user.email,
        avatar: null,
        role: "user",
      };
    }
  },
};

export default authProvider;
