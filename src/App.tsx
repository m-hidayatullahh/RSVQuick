import { Authenticated, Refine, AccessControlProvider } from "@refinedev/core";
import { RefineKbar, RefineKbarProvider } from "@refinedev/kbar";
import { LocalizationProvider } from "@mui/x-date-pickers";
import RsvpIcon from "@mui/icons-material/Rsvp";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

import {
  ErrorComponent,
  notificationProvider,
  RefineSnackbarProvider,
  ThemedLayoutV2,
} from "@refinedev/mui";

import CssBaseline from "@mui/material/CssBaseline";
import GlobalStyles from "@mui/material/GlobalStyles";
import routerBindings, {
  CatchAllNavigate,
  DocumentTitleHandler,
  NavigateToResource,
  UnsavedChangesNotifier,
} from "@refinedev/react-router-v6";
import { dataProvider, liveProvider } from "@refinedev/supabase";
import { BrowserRouter, Outlet, Route, Routes } from "react-router-dom";
import { useEffect, useState } from "react";
import authProvider from "./authProvider";
import { Header } from "./components/header";
import { ColorModeContextProvider } from "./contexts/color-mode";
import { supabaseClient, getCachedRole } from "./utility";

const accessControlProvider: AccessControlProvider = {
  can: async ({ resource }) => {
    if (resource === "admin-users") {
      const role = await getCachedRole();
      return { can: role === "admin" };
    }
    return { can: true };
  },
};
import { RequestList } from "./pages/requests/list";
import { RequestCreate } from "./pages/requests/create";
import { RequestEdit } from "./pages/requests/edit";
import { RequestShow } from "./pages/requests/show";
import { ResponseCreate } from "./pages/responses/create";
import { AppIcon } from "./components/app-icon";
import customTitleHandler from "./utility/customTitleHandler";
import ThankYouPage from "./pages/responses/thank-you";
import LandingPage from "./pages/landing";
import InvitationListPage from "./pages/invitations";
import ProfilePage from "./pages/profile";
import AdminUsersPage from "./pages/admin/users";
import LoginPage from "./pages/auth/login";
import RegisterPage from "./pages/auth/register";
import ForgotPasswordPage from "./pages/auth/forgot-password";
import UpdatePasswordPage from "./pages/auth/update-password";
import i18nProvider, { getLocale } from "./i18n";

function App() {
  // Re-mount Refine subtree on locale change so all translations refresh.
  const [locale, setLocale] = useState(getLocale());
  useEffect(() => {
    const handler = () => setLocale(getLocale());
    window.addEventListener("locale-change", handler);
    return () => window.removeEventListener("locale-change", handler);
  }, []);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <BrowserRouter>
        <RefineKbarProvider>
          <ColorModeContextProvider>
            <CssBaseline />
            <GlobalStyles styles={{ html: { WebkitFontSmoothing: "auto" } }} />
            <RefineSnackbarProvider>
              <Refine
                key={locale}
                dataProvider={dataProvider(supabaseClient)}
                liveProvider={liveProvider(supabaseClient)}
                authProvider={authProvider}
                routerProvider={routerBindings}
                notificationProvider={notificationProvider}
                i18nProvider={i18nProvider}
                accessControlProvider={accessControlProvider}
                resources={[
                  {
                    name: "requests",
                    list: "/requests",
                    create: "/requests/create",
                    edit: "/requests/edit/:id",
                    show: "/requests/show/:id",
                    icon: <RsvpIcon />,
                    meta: {
                      canDelete: true,
                    },
                  },
                  {
                    name: "admin-users",
                    list: "/admin/users",
                    icon: <AdminPanelSettingsIcon />,
                  },
                ]}
                options={{
                  syncWithLocation: true,
                  warnWhenUnsavedChanges: true,
                  liveMode: "auto",
                }}
              >
                <Routes>
                  <Route index element={<LandingPage />} />

                  <Route path="/r">
                    <Route path=":id" element={<ResponseCreate />} />
                  </Route>
                  <Route path="/thank-you" element={<ThankYouPage />} />

                  <Route
                    element={
                      <Authenticated fallback={<CatchAllNavigate to="/login" />}>
                        <ThemedLayoutV2
                          Header={() => <Header sticky />}
                          Title={({ collapsed }) => (
                            <AppIcon collapsed={collapsed} />
                          )}
                        >
                          <Outlet />
                        </ThemedLayoutV2>
                      </Authenticated>
                    }
                  >
                    <Route path="/requests">
                      <Route index element={<RequestList />} />
                      <Route path="create" element={<RequestCreate />} />
                      <Route path="edit/:id" element={<RequestEdit />} />
                      <Route path="show/:id" element={<RequestShow />} />
                      <Route path=":id/invitations" element={<InvitationListPage />} />
                    </Route>
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/admin">
                      <Route path="users" element={<AdminUsersPage />} />
                    </Route>
                    <Route path="*" element={<ErrorComponent />} />
                  </Route>

                  <Route
                    element={
                      <Authenticated fallback={<Outlet />}>
                        <NavigateToResource />
                      </Authenticated>
                    }
                  >
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                  </Route>

                  {/* Update password route — accessible both saat recovery session dari email link maupun user yang sudah login */}
                  <Route path="/update-password" element={<UpdatePasswordPage />} />
                </Routes>

                <RefineKbar />
                <UnsavedChangesNotifier />
                <DocumentTitleHandler handler={customTitleHandler} />
              </Refine>
            </RefineSnackbarProvider>
          </ColorModeContextProvider>
        </RefineKbarProvider>
      </BrowserRouter>
    </LocalizationProvider>
  );
}

export default App;
