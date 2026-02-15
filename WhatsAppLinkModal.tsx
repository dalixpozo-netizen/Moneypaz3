import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle2, Smartphone, Shield, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface WhatsAppLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WhatsAppLinkModal = ({ isOpen, onClose }: WhatsAppLinkModalProps) => {
  const [isLinked, setIsLinked] = useState(false);
  const [isLinking, setIsLinking] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      // Reset state when modal closes
      setTimeout(() => {
        setIsLinked(false);
        setIsLinking(false);
      }, 300);
    }
  }, [isOpen]);

  const handleSimulateLink = () => {
    setIsLinking(true);
    // Simulate linking process
    setTimeout(() => {
      setIsLinking(false);
      setIsLinked(true);
    }, 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm mx-auto rounded-3xl border-0 bg-gradient-to-b from-white to-emerald-50/50 shadow-2xl">
        <DialogHeader className="text-center pb-2">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-gradient-to-br from-emerald-400 to-green-500 rounded-2xl shadow-lg shadow-emerald-200/50">
              <MessageCircle className="w-8 h-8 text-white" fill="white" />
            </div>
          </div>
          <DialogTitle className="text-xl font-semibold text-center">
            {isLinked ? "¡Vinculación Exitosa!" : "Vincular con WhatsApp"}
          </DialogTitle>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {!isLinked ? (
            <motion.div
              key="qr-step"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-5 py-4"
            >
              {/* Fake QR Code */}
              <div className="flex justify-center">
                <div className="relative p-4 bg-white rounded-2xl shadow-inner border border-emerald-100">
                  <div className="w-48 h-48 bg-gradient-to-br from-gray-100 to-gray-50 rounded-xl flex items-center justify-center relative overflow-hidden">
                    {/* Simulated QR pattern */}
                    <div className="absolute inset-4 grid grid-cols-8 gap-1">
                      {Array.from({ length: 64 }).map((_, i) => (
                        <div
                          key={i}
                          className={`rounded-sm ${
                            Math.random() > 0.5 ? "bg-gray-800" : "bg-transparent"
                          }`}
                        />
                      ))}
                    </div>
                    {/* Corner markers */}
                    <div className="absolute top-4 left-4 w-8 h-8 border-4 border-gray-800 rounded-lg" />
                    <div className="absolute top-4 right-4 w-8 h-8 border-4 border-gray-800 rounded-lg" />
                    <div className="absolute bottom-4 left-4 w-8 h-8 border-4 border-gray-800 rounded-lg" />
                    {/* Center logo */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="p-2 bg-white rounded-lg shadow-sm">
                        <MessageCircle className="w-6 h-6 text-emerald-500" />
                      </div>
                    </div>
                  </div>
                  {isLinking && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-2xl flex items-center justify-center"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full"
                        />
                        <span className="text-sm text-emerald-600 font-medium">
                          Conectando...
                        </span>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Instructions */}
              <div className="text-center space-y-2">
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Smartphone className="w-4 h-4" />
                  <span>Escanea con tu cámara de WhatsApp</span>
                </div>
                <p className="text-xs text-muted-foreground/70">
                  Abre WhatsApp → Dispositivos vinculados → Vincular dispositivo
                </p>
              </div>

              {/* Security note */}
              <div className="flex items-center justify-center gap-2 p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                <Shield className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <p className="text-xs text-emerald-700">
                  Conexión cifrada de extremo a extremo
                </p>
              </div>

              {/* Simulate button (for demo purposes) */}
              <Button
                onClick={handleSimulateLink}
                disabled={isLinking}
                variant="outline"
                className="w-full py-5 rounded-xl border-emerald-200 text-emerald-600 hover:bg-emerald-50"
              >
                {isLinking ? "Vinculando..." : "Simular vinculación (Demo)"}
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="success-step"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-5 py-4 text-center"
            >
              {/* Success animation */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.1 }}
                className="flex justify-center"
              >
                <div className="p-4 bg-gradient-to-br from-emerald-100 to-green-100 rounded-full">
                  <CheckCircle2 className="w-16 h-16 text-emerald-500" />
                </div>
              </motion.div>

              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-foreground">
                  Tu asistente está listo para escucharte
                </h3>
                <p className="text-sm text-muted-foreground">
                  Ya puedes enviar tus gastos por mensaje o nota de voz a cualquier hora.
                </p>
              </div>

              {/* Quick tips */}
              <div className="space-y-2 p-4 bg-white/80 rounded-2xl border border-emerald-100">
                <p className="text-xs font-medium text-foreground/70 uppercase tracking-wide">
                  Prueba a decir:
                </p>
                <div className="space-y-1.5">
                  <p className="text-sm text-emerald-600 italic">
                    "Gasté 15€ en el supermercado"
                  </p>
                  <p className="text-sm text-emerald-600 italic">
                    "¿Cuánto llevo gastado hoy?"
                  </p>
                </div>
              </div>

              <Button
                onClick={onClose}
                className="w-full py-5 text-base font-semibold bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white rounded-xl"
              >
                ¡Entendido!
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};
