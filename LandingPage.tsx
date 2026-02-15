import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, PieChart, Shield, Zap } from "lucide-react";

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-[#1A1F2C] text-white overflow-x-hidden">
      {/* Navegación */}
      <nav className="border-b border-gray-800 bg-[#1A1F2C]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            {/* Logo Oficial Moneypaz */}
            <svg width="35" height="35" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path 
                d="M8 32V8L20 22L32 8V32" 
                stroke="#F97316" 
                strokeWidth="5" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
              <path d="M8 32H14M26 32H32" stroke="#F97316" strokeWidth="5" strokeLinecap="round"/>
            </svg>
            <span className="text-2xl font-bold tracking-tight text-white">Moneypaz</span>
          </div>
          <Link to="/login">
            <Button 
              className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-5 text-md font-bold rounded-xl shadow-lg shadow-orange-900/20 transition-all transform hover:scale-105 active:scale-95"
            >
              Iniciar sesión
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 pb-12 px-4 text-center">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-6 bg-gradient-to-b from-orange-400 to-orange-600 bg-clip-text text-transparent">
            Moneypaz
          </h1>
          <p className="text-3xl md:text-4xl font-bold mb-6 text-gray-100 italic leading-tight">
            "Tus cuentas claras, tu mente en calma."
          </p>
          <p className="text-gray-400 text-xl mb-10 max-w-2xl mx-auto leading-relaxed">
            La forma más sencilla y visual de tomar el control de tus finanzas personales. Sin complicaciones, directo al grano.
          </p>
          <div className="mb-16">
            <Link to="/registro">
              <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white px-10 py-8 text-xl rounded-2xl shadow-2xl shadow-orange-900/40 transition-all transform hover:scale-105 active:scale-95">
                Empezar ahora <ArrowRight className="ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Sección de la Imagen (Impacto Visual) */}
      <section className="relative max-w-5xl mx-auto px-4 mb-24">
        <div className="relative group">
          {/* Aura de luz naranja detrás de la imagen */}
          <div className="absolute -inset-4 bg-orange-600/20 rounded-[4rem] blur-3xl opacity-50 group-hover:opacity-80 transition duration-1000"></div>
          
          <div className="relative bg-[#1A1F2C] rounded-[3rem] overflow-hidden border border-gray-800 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
            <img 
              src="/chica-moneypaz.png" 
              alt="Confianza y tranquilidad con Moneypaz" 
              className="w-full h-auto object-cover"
              style={{ maxHeight: '600px' }}
              onError={(e) => {
                console.error("Imagen no encontrada. Revisa el nombre en la carpeta public.");
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
        </div>
      </section>

      {/* Características */}
      <section className="py-24 bg-[#141821] border-t border-gray-800">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            {/* Visualización */}
            <div className="p-10 bg-[#1A1F2C] rounded-[2.5rem] border border-gray-800 hover:border-orange-500/40 transition-all group">
              <div className="w-16 h-16 bg-orange-500/10 rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:bg-orange-500/20 transition-colors">
                <PieChart className="text-orange-500 w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-white">Visualización Clara</h3>
              <p className="text-gray-400 leading-relaxed">Entiende tu flujo de dinero con gráficos diseñados para darte paz mental.</p>
            </div>
            
            {/* Rapidez */}
            <div className="p-10 bg-[#1A1F2C] rounded-[2.5rem] border border-gray-800 hover:border-orange-500/40 transition-all group">
              <div className="w-16 h-16 bg-orange-500/10 rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:bg-orange-500/20 transition-colors">
                <Zap className="text-orange-500 w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-white">Registro Rápido</h3>
              <p className="text-gray-400 leading-relaxed">Añade cualquier gasto en segundos. Sin fricciones, sin esperas.</p>
            </div>

            {/* Seguridad */}
            <div className="p-10 bg-[#1A1F2C] rounded-[2.5rem] border border-gray-800 hover:border-orange-500/40 transition-all group">
              <div className="w-16 h-16 bg-orange-500/10 rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:bg-orange-500/20 transition-colors">
                <Shield className="text-orange-500 w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-white">Seguridad Total</h3>
              <p className="text-gray-400 leading-relaxed">Tu privacidad es nuestra prioridad. Tus datos están siempre blindados.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 text-center text-gray-600 text-sm border-t border-gray-800">
        <p className="mb-2">© 2026 Moneypaz — Liderando tu tranquilidad financiera.</p>
      </footer>
    </div>
  );
};

export default LandingPage;