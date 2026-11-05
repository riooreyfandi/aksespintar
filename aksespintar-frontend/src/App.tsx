import { Route, Routes } from "react-router-dom";
import { RequireAuth } from "./auth";
import { Layout } from "./components/Layout";
import { Home } from "./pages/Home";
import { MaterialDetail } from "./pages/MaterialDetail";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { Admin } from "./pages/Admin";
import { Leaderboard } from "./pages/Leaderboard";
import { Chat } from "./pages/Chat";
import { Profile } from "./pages/Profile";
import { ChangePassword } from "./pages/ChangePassword";
import { ForgotPassword } from "./pages/ForgotPassword";
import { ResetPassword } from "./pages/ResetPassword";
import { VerifyEmail } from "./pages/VerifyEmail";
import { ResendVerification } from "./pages/ResendVerification";
import { NotFound } from "./pages/NotFound";

export function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route
          index
          element={
            <RequireAuth>
              <Home />
            </RequireAuth>
          }
        />
        <Route
          path="materi/:slug"
          element={
            <RequireAuth>
              <MaterialDetail />
            </RequireAuth>
          }
        />
        <Route
          path="peringkat"
          element={
            <RequireAuth>
              <Leaderboard />
            </RequireAuth>
          }
        />
        <Route
          path="diskusi"
          element={
            <RequireAuth>
              <Chat />
            </RequireAuth>
          }
        />
        <Route
          path="profil"
          element={
            <RequireAuth>
              <Profile />
            </RequireAuth>
          }
        />
        <Route
          path="ganti-sandi"
          element={
            <RequireAuth>
              <ChangePassword />
            </RequireAuth>
          }
        />
        <Route path="masuk" element={<Login />} />
        <Route path="daftar" element={<Register />} />
        <Route path="lupa-sandi" element={<ForgotPassword />} />
        <Route path="reset-sandi" element={<ResetPassword />} />
        <Route path="verifikasi-email" element={<VerifyEmail />} />
        <Route path="kirim-ulang-verifikasi" element={<ResendVerification />} />
        <Route path="admin" element={<Admin />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
