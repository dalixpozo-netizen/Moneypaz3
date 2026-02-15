import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Lock, Mail } from "lucide-react";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast({
        title: "¡Bienvenido de nuevo!",
        description: "Has iniciado sesión correctamente.",
      });
      navigate("/dashboard");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error de acceso",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1A1F2C] text-white flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Elemento decorativo de fondo */}
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-orange-600/10 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-orange-600/5 rounded-full blur-[120px]"></div>

      {/* Botón Volver */}
      <Link to="/" className="absolute top-8 left-8 text-gray-400 hover:text-orange-500 transition-colors flex items-center gap-2 group">
        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        <span>Volver al inicio</span>
      </Link>

      <div className="w-full max-w-md z-10">
        <div className="text-center mb-10">
          <div className="flex justify-center mb-4">
            <svg width="50" height="50" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 32V8L20 22L32 8V32" stroke="#F97316" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M8 32H14M26 32H32" stroke="#F97316" strokeWidth="5" strokeLinecap="round"/>
            </svg>
          </div>
          <h1 className="text-4xl font-black tracking-tight mb-2">Bienvenido</h1>
          <p className="text-gray-400 italic">"Tus cuentas claras, tu mente en calma."</p>
        </div>

        <div className="bg-[#141821] p-8 rounded-[2.5rem] border border-gray-800 shadow-2xl">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300 ml-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <Input
                  type="email"
                  placeholder="tu@email.com"
                  className="bg-[#1A1F2C] border-gray-800 focus:border-orange-500 focus:ring-orange-500 rounded-xl py-6 pl-12 text-white placeholder:text-gray-600"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300 ml-1">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <Input
                  type="password"
                  placeholder="••••••••"
                  className="bg-[#1A1F2C] border-gray-800 focus:border-orange-500 focus:ring-orange-500 rounded-xl py-6 pl-12 text-white placeholder:text-gray-600"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-7 rounded-2xl shadow-lg shadow-orange-900/20 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {loading ? "Iniciando sesión..." : "Acceder ahora"}
            </Button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-500">
              ¿No tienes cuenta?{" "}
              <Link to="/registro" className="text-orange-500 hover:text-orange-400 font-bold transition-colors">
                Regístrate gratis
              </Link>
            </p>
          </div>
        </div>
      </div>

      <footer className="mt-12 text-gray-600 text-sm">
        © 2026 Moneypaz — Tu paz financiera comienza aquí.
      </footer>
    </div>
  );
};

export default LoginPage;