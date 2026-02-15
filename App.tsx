import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
import { ProtectedAdminRoute } from "./components/auth/ProtectedAdminRoute";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ContactPage from "./pages/ContactPage";
import HomePage from "./pages/HomePage";
import ExpensesPage from "./pages/ExpensesPage";
import WhispersPage from "./pages/WhispersPage";
import ProfilePage from "./pages/ProfilePage";
import AdminPage from "./pages/AdminPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Rutas Públicas de Moneypaz */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/registro" element={<RegisterPage />} />
          <Route path="/contacto" element={<ContactPage />} />

          {/* Rutas de la App (Protegidas por Layout) */}
          {/* El dashboard principal vive en /app */}
          <Route path="/app" element={<AppLayout />}>
            <Route index element={<HomePage />} />
            <Route path="gastos" element={<ExpensesPage />} />
            <Route path="avisos" element={<WhispersPage />} />
            <Route path="perfil" element={<ProfilePage />} />

            {/* Ruta de Admin DENTRO del layout */}
            <Route
              path="admin"
              element={
                <ProtectedAdminRoute>
                  <AdminPage />
                </ProtectedAdminRoute>
              }
            />
          </Route>

          {/* --- REDIRECCIONES ESTRATÉGICAS --- */}
          
          {/* Si el login te manda a /dashboard, lo llevamos a /app */}
          <Route path="/dashboard" element={<Navigate to="/app" replace />} />
          
          {/* Si alguien escribe /admin a secas, lo llevamos a la ruta protegida */}
          <Route path="/admin" element={<Navigate to="/app/admin" replace />} />

          {/* Página no encontrada */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;