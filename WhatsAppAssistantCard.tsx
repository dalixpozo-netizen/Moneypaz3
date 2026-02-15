import { useState } from "react";
import { motion } from "framer-motion";
import { MessageCircle, Mic, Shield, Bell, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WhatsAppLinkModal } from "./WhatsAppLinkModal";

export const WhatsAppAssistantCard = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const benefits = [
    {
      icon: <Mic className="w-5 h-5" />,
      text: "Anota gastos por voz o texto en 3 segundos",
    },
    {
      icon: <Shield className="w-5 h-5" />,
      text: "Sin compartir tus claves bancarias",
    },
    {
      icon: <Bell className="w-5 h-5" />,
      text: "Recordatorios diarios para tu paz financiera",
    },
  ];

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-50 via-teal-50 to-green-50 border border-emerald-100/50 shadow-lg shadow-emerald-100/20"
      >
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-emerald-100/40 to-transparent rounded-full blur-2xl" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-teal-100/40 to-transparent rounded-full blur-2xl" />

        <div className="relative p-6 space-y-5">
          {/* Header with WhatsApp branding */}
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-emerald-400 to-green-500 rounded-2xl shadow-lg shadow-emerald-200/50">
              <MessageCircle className="w-6 h-6 text-white" fill="white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-foreground">
                  Asistente Inteligente
                </h3>
                <Sparkles className="w-4 h-4 text-amber-400" />
              </div>
              <p className="text-sm text-muted-foreground">
                Activa tu Asistente Personal
              </p>
            </div>
          </div>

          {/* Benefits list */}
          <div className="space-y-3">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.3 + index * 0.1 }}
                className="flex items-center gap-3 p-3 bg-white/60 backdrop-blur-sm rounded-xl border border-white/80"
              >
                <div className="p-2 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-xl text-emerald-600">
                  {benefit.icon}
                </div>
                <p className="text-sm text-foreground/80 font-medium leading-tight">
                  {benefit.text}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Security badge */}
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Shield className="w-3.5 h-3.5 text-emerald-500" />
            <span>Tus datos siempre seguros y privados</span>
          </div>

          {/* CTA Button */}
          <Button
            onClick={() => setIsModalOpen(true)}
            className="w-full py-6 text-base font-semibold bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white rounded-2xl shadow-lg shadow-emerald-200/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-emerald-200/60"
          >
            <MessageCircle className="w-5 h-5 mr-2" />
            Vincular con WhatsApp
          </Button>
        </div>
      </motion.div>

      <WhatsAppLinkModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </>
  );
};
