import { motion } from "framer-motion";
import { RefreshCw, ChevronDown, ChevronUp, Wallet } from "lucide-react";
import { useState } from "react";
import { Movement } from "@/hooks/use-finance-store";

interface CommittedExpensesProps {
  committedMoney: number;
  recurringExpenses: Movement[];
}

export const CommittedExpenses = ({ committedMoney, recurringExpenses }: CommittedExpensesProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (recurringExpenses.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.5 }}
      className="bg-white/90 backdrop-blur-sm rounded-3xl p-5 shadow-soft border border-orange-100/30"
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-orange-100 flex items-center justify-center">
            <Wallet className="w-5 h-5 text-orange-500" strokeWidth={1.5} />
          </div>
          <div className="text-left">
            <h3 className="font-medium text-foreground text-sm">Gastos Fijos</h3>
            <p className="text-xs text-muted-foreground">
              {recurringExpenses.length} factura{recurringExpenses.length !== 1 ? "s" : ""} este mes
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <span className="font-semibold text-orange-600 text-lg">
            {committedMoney.toFixed(2)}€
          </span>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          )}
        </div>
      </button>
      
      {isExpanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="mt-4 pt-4 border-t border-orange-100/30 space-y-2"
        >
          {recurringExpenses.map((expense, index) => (
            <motion.div
              key={expense.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center justify-between py-2 px-3 rounded-xl bg-cream-warm/50"
            >
              <div className="flex items-center gap-2">
                <RefreshCw className="w-3 h-3 text-orange-400" strokeWidth={2} />
                <span className="text-sm font-medium text-foreground capitalize">
                  {expense.concept || expense.description}
                </span>
              </div>
              <span className="text-sm text-orange-600 font-medium">
                {expense.amount.toFixed(2)}€
              </span>
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
};
