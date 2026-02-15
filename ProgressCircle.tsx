import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Check } from "lucide-react";

interface ProgressCircleProps {
  available: number;
  total: number;
  spent: number;
  todayStatus: {
    hasBigExpense: boolean;
    hasAnyExpense: boolean;
    todayExpensesCount: number;
  };
  lastMovementTime: number | null;
}

export const ProgressCircle = ({ 
  available, 
  total, 
  spent, 
  todayStatus,
  lastMovementTime 
}: ProgressCircleProps) => {
  const [showSavedMessage, setShowSavedMessage] = useState(false);
  const [prevMovementTime, setPrevMovementTime] = useState<number | null>(null);

  // Detect when a new movement was just added
  useEffect(() => {
    if (lastMovementTime && prevMovementTime && lastMovementTime > prevMovementTime) {
      setShowSavedMessage(true);
      const timer = setTimeout(() => setShowSavedMessage(false), 3000);
      return () => clearTimeout(timer);
    }
    setPrevMovementTime(lastMovementTime);
  }, [lastMovementTime, prevMovementTime]);

  // Prevent division by zero and handle edge cases
  const safeTotal = total > 0 ? total : 1;
  const percentage = Math.max(0, Math.min(100, Math.round((available / safeTotal) * 100)));
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  // Status message logic
  const getStatusMessage = () => {
    if (showSavedMessage) {
      return { text: "Gasto registrado correctamente", icon: Check, color: "text-emerald-600 dark:text-emerald-400" };
    }
    if (todayStatus.hasBigExpense) {
      return { text: "Día activo en gastos", icon: null, color: "text-muted-foreground" };
    }
    return { text: "Todo en orden por aquí", icon: Sparkles, color: "text-muted-foreground" };
  };

  const status = getStatusMessage();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.2 }}
      className="bg-card rounded-[2rem] shadow-card p-8 text-center"
    >
      <div className="relative w-48 h-48 mx-auto mb-4">
        {/* Background Circle */}
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth="6"
          />
          <motion.circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
          />
        </svg>
        
        {/* Center Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-3xl font-semibold text-foreground"
          >
            {available.toLocaleString("es-ES")}€
          </motion.span>
          <span className="text-sm text-muted-foreground mt-1">disponible</span>
        </div>
      </div>

      {/* Status Message */}
      <AnimatePresence mode="wait">
        <motion.div
          key={status.text}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          className={`flex items-center justify-center gap-2 mb-4 text-sm ${status.color}`}
        >
          {status.icon && <status.icon className="w-4 h-4" strokeWidth={1.5} />}
          <span>{status.text}</span>
        </motion.div>
      </AnimatePresence>

      <div className="flex justify-center gap-8 text-sm">
        <div>
          <span className="text-muted-foreground">Llevas gastado</span>
          <p className="font-semibold text-foreground mt-1">{spent.toLocaleString("es-ES")}€</p>
        </div>
        <div className="w-px bg-border" />
        <div>
          <span className="text-muted-foreground">De un total de</span>
          <p className="font-semibold text-foreground mt-1">{total.toLocaleString("es-ES")}€</p>
        </div>
      </div>
    </motion.div>
  );
};

export default ProgressCircle;
