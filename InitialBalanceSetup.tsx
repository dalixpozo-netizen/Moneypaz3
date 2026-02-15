import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight, Shield, HelpCircle, Headphones } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HelpPanel } from "@/components/help/HelpPanel";

interface InitialBalanceSetupProps {
  onComplete: (balance: number) => void;
}

export const InitialBalanceSetup = ({ onComplete }: InitialBalanceSetupProps) => {
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const handleNumberClick = (num: string) => {
    if (num === "." && amount.includes(".")) return;
    if (num === "delete") {
      setAmount(prev => prev.slice(0, -1));
      return;
    }
    // Limit decimal places to 2
    if (amount.includes(".") && amount.split(".")[1]?.length >= 2) return;
    setAmount(prev => prev + num);
  };

  const handleComplete = () => {
    const value = parseFloat(amount);
    if (value > 0) {
      setIsLoading(true);
      // Simulate a brief loading for transition
      setTimeout(() => {
        onComplete(value);
      }, 2000);
    }
  };

  const numbers = ["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "delete"];

  // Loading state view
  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen flex flex-col items-center justify-center p-6 bg-background"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", duration: 0.6 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-6"
          >
            <Sparkles className="w-8 h-8 text-primary" strokeWidth={1.5} />
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-xl font-medium text-foreground mb-2"
          >
            Configurando tu panel de paz mental...
          </motion.p>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-muted-foreground"
          >
            Solo un momento ✨
          </motion.p>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen flex flex-col items-center justify-center p-6 bg-background relative"
      >
        {/* Help Button - Top Right */}
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          onClick={() => setShowHelp(true)}
          className="absolute top-4 right-4 w-10 h-10 rounded-full bg-muted/50 hover:bg-accent flex items-center justify-center transition-colors"
          aria-label="Ayuda"
        >
          <HelpCircle className="w-5 h-5 text-muted-foreground" strokeWidth={1.5} />
        </motion.button>

        {/* Welcome Message */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-8"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring" }}
            className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-6"
          >
            <Sparkles className="w-8 h-8 text-primary" strokeWidth={1.5} />
          </motion.div>
          <h1 className="text-2xl font-semibold text-foreground mb-3">
            Bienvenido a Moneypaz
          </h1>
          <p className="text-muted-foreground text-lg">
            ¿Con cuánto dinero empezamos hoy?
          </p>
        </motion.div>

        {/* Amount Display */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="w-full max-w-sm"
        >
          <div className="bg-card rounded-3xl shadow-card p-8 mb-6 text-center">
            <span className="text-5xl font-light text-foreground">
              {amount || "0"}
            </span>
            <span className="text-3xl font-light text-muted-foreground ml-2">€</span>
          </div>

          {/* Number Pad */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {numbers.map((num) => (
              <motion.button
                key={num}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleNumberClick(num)}
                className={`h-14 rounded-2xl text-xl font-medium transition-colors ${
                  num === "delete"
                    ? "bg-destructive/10 text-destructive"
                    : "bg-muted/50 hover:bg-accent text-foreground"
                }`}
              >
                {num === "delete" ? "←" : num}
              </motion.button>
            ))}
          </div>

          {/* Continue Button */}
          <Button
            onClick={handleComplete}
            disabled={!amount || parseFloat(amount) <= 0}
            className="w-full h-14 rounded-3xl text-lg font-medium"
            variant="peaceful"
          >
            Empezar mi camino
            <ArrowRight className="w-5 h-5 ml-2" strokeWidth={1.5} />
          </Button>
        </motion.div>

        {/* Trust & Security Message */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-8 max-w-sm space-y-4"
        >
          {/* Security Block */}
          <div className="bg-muted/30 rounded-2xl p-4 border border-border/50">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  <span className="font-medium text-foreground/80">Tu seguridad es lo primero:</span>{" "}
                  Nunca te pediremos conectar tu banco ni compartir datos bancarios reales. 
                  Esta información es solo para que la herramienta pueda calcular tus ahorros 
                  y avisarte de tus gastos. Tú tienes el control total.
                </p>
              </div>
            </div>
          </div>

          {/* Support Block */}
          <div className="flex items-center gap-3 px-4 py-3">
            <Headphones className="w-4 h-4 text-muted-foreground/70 flex-shrink-0" strokeWidth={1.5} />
            <p className="text-xs text-muted-foreground/80 leading-relaxed">
              Si tienes cualquier duda sobre cómo empezar, recuerda que dentro tendrás una{" "}
              <span className="font-medium">Guía de Ayuda</span> y nuestro{" "}
              <span className="font-medium">Soporte 24/7</span> a tu disposición.
            </p>
          </div>
        </motion.div>
      </motion.div>

      {/* Help Panel */}
      <HelpPanel isOpen={showHelp} onClose={() => setShowHelp(false)} showTrigger={false} />
    </>
  );
};
