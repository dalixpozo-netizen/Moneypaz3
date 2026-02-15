import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShoppingCart, MapPin, Wine, Package, TrendingUp, TrendingDown, X,
  Zap, Droplets, Smartphone, Home, Shield, CreditCard, Wallet, Briefcase,
  RefreshCw, ChevronDown, ChevronUp
} from "lucide-react";
import { useFinanceStore, Movement } from "@/hooks/use-finance-store";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Category configuration with icons and colors
const getCategoryConfig = (categoryId: string) => {
  const configs: Record<string, { label: string; icon: typeof Package; color: string }> = {
    alimentacion: { label: "Alimentación", icon: ShoppingCart, color: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400" },
    movilidad: { label: "Movilidad", icon: MapPin, color: "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400" },
    transporte: { label: "Movilidad", icon: MapPin, color: "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400" }, // Legacy alias
    ocio: { label: "Ocio", icon: Wine, color: "bg-accent text-accent-foreground" },
    varios: { label: "Varios", icon: Package, color: "bg-muted/50 text-muted-foreground" },
    luz: { label: "Luz", icon: Zap, color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" },
    agua: { label: "Agua", icon: Droplets, color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
    movil: { label: "Móvil", icon: Smartphone, color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" },
    vivienda: { label: "Hipoteca/Alquiler", icon: Home, color: "bg-mint-soft text-primary" },
    seguros: { label: "Seguros", icon: Shield, color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" },
    suscripciones: { label: "Suscripciones", icon: CreditCard, color: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400" },
    // Income categories
    nomina: { label: "Nómina", icon: Briefcase, color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" },
    bizum: { label: "Bizum", icon: Wallet, color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
    ingreso: { label: "Ingreso", icon: TrendingUp, color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" },
    // Legacy categories for backward compatibility
    comida: { label: "Comida", icon: ShoppingCart, color: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400" },
    casa: { label: "Casa", icon: Home, color: "bg-mint-soft text-primary" },
  };
  
  return configs[categoryId] || { 
    label: categoryId.replace('ingreso_', '').charAt(0).toUpperCase() + categoryId.replace('ingreso_', '').slice(1), 
    icon: Package, 
    color: "bg-muted/50 text-muted-foreground" 
  };
};

// Time grouping helper
const groupMovementsByTime = (movements: Movement[]) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const groups: { label: string; movements: Movement[] }[] = [
    { label: "Hoy", movements: [] },
    { label: "Ayer", movements: [] },
    { label: "Anteriores este mes", movements: [] },
  ];

  movements.forEach((m) => {
    const date = new Date(m.timestamp);
    const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    if (dayStart.getTime() === today.getTime()) {
      groups[0].movements.push(m);
    } else if (dayStart.getTime() === yesterday.getTime()) {
      groups[1].movements.push(m);
    } else if (m.timestamp >= startOfMonth.getTime()) {
      groups[2].movements.push(m);
    }
  });

  return groups.filter((g) => g.movements.length > 0);
};

const ExpensesPage = () => {
  const { movements, formatRelativeDate, deleteMovement, committedMoney, recurringExpenses } = useFinanceStore();
  const [movementToDelete, setMovementToDelete] = useState<Movement | null>(null);
  const [showCommittedDetails, setShowCommittedDetails] = useState(false);
  
  // Calculate monthly totals for summary with progress bars - DYNAMIC
  const { categoryTotals, totalIncome, totalSpent, maxCategorySpent } = useMemo(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    
    const catTotals: Record<string, number> = {};
    let incomeTotal = 0;
    let spentTotal = 0;
    
    movements
      .filter(m => m.timestamp >= startOfMonth)
      .forEach(m => {
        if (m.type === 'income') {
          incomeTotal += m.amount;
        } else {
          spentTotal += m.amount;
          // Normalize category names (handle legacy aliases)
          let normalizedCategory = m.category;
          if (m.category === 'comida') normalizedCategory = 'alimentacion';
          if (m.category === 'transporte') normalizedCategory = 'movilidad';
          
          catTotals[normalizedCategory] = (catTotals[normalizedCategory] || 0) + m.amount;
        }
      });
    
    // Max for progress bar scaling
    const max = Math.max(...Object.values(catTotals), 1);
    
    return { 
      categoryTotals: catTotals,
      totalIncome: incomeTotal,
      totalSpent: spentTotal,
      maxCategorySpent: max
    };
  }, [movements]);

  // Sort categories by amount (highest first)
  const sortedCategories = useMemo(() => {
    return Object.entries(categoryTotals)
      .sort(([, a], [, b]) => b - a);
  }, [categoryTotals]);

  // Group movements by time (only this month's movements)
  const groupedMovements = useMemo(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    const thisMonthMovements = movements.filter(m => m.timestamp >= startOfMonth);
    return groupMovementsByTime(thisMonthMovements);
  }, [movements]);

  const handleDeleteConfirm = () => {
    if (movementToDelete) {
      deleteMovement(movementToDelete.id);
      setMovementToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-semibold text-foreground mb-1">
          Tus movimientos
        </h1>
        <p className="text-muted-foreground text-sm">
          Este mes llevas gastado {totalSpent.toFixed(2)}€
        </p>
      </motion.div>

      {/* NEW: Committed Money Panel */}
      {committedMoney > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-orange-50 dark:bg-orange-900/20 rounded-3xl p-4 border border-orange-200/50 dark:border-orange-800/30"
        >
          <button
            onClick={() => setShowCommittedDetails(!showCommittedDetails)}
            className="w-full"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-orange-100 dark:bg-orange-900/40 flex items-center justify-center">
                  <RefreshCw className="w-5 h-5 text-orange-600 dark:text-orange-400" strokeWidth={1.5} />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-orange-700 dark:text-orange-400">Dinero comprometido</p>
                  <p className="text-xs text-orange-600/70 dark:text-orange-400/70">Gastos recurrentes este mes</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-semibold text-orange-700 dark:text-orange-400">
                  {committedMoney.toFixed(0)}€
                </span>
                {showCommittedDetails ? (
                  <ChevronUp className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                )}
              </div>
            </div>
          </button>
          
          <AnimatePresence>
            {showCommittedDetails && recurringExpenses.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-4 pt-4 border-t border-orange-200/50 dark:border-orange-800/30 space-y-2">
                  {recurringExpenses.map((m) => {
                    const config = getCategoryConfig(m.category);
                    return (
                      <div key={m.id} className="flex items-center justify-between py-2">
                        <div className="flex items-center gap-2">
                          <config.icon className="w-4 h-4 text-orange-600/70 dark:text-orange-400/70" strokeWidth={1.5} />
                          <span className="text-sm text-orange-700 dark:text-orange-400">
                            {m.concept || m.description}
                          </span>
                        </div>
                        <span className="text-sm font-medium text-orange-700 dark:text-orange-400">
                          {m.amount.toFixed(2)}€
                        </span>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Quick Summary Card with Progress Bars */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-card rounded-3xl p-5 space-y-5"
      >
        <h3 className="text-sm font-medium text-muted-foreground">Resumen del mes</h3>
        
        {/* Dynamic Categories with progress */}
        {sortedCategories.length > 0 ? (
          sortedCategories.map(([categoryId, amount], index) => {
            const config = getCategoryConfig(categoryId);
            const Icon = config.icon;
            
            return (
              <motion.div 
                key={categoryId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.05 }}
                className="space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${config.color.split(' ').slice(0, 2).join(' ')}`}>
                      <Icon className={`w-4 h-4 ${config.color.split(' ').slice(2).join(' ')}`} strokeWidth={1.5} />
                    </div>
                    <span className="text-sm font-medium text-foreground">{config.label}</span>
                  </div>
                  <span className="text-lg font-semibold text-foreground">{amount.toFixed(0)}€</span>
                </div>
                <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(amount / maxCategorySpent) * 100}%` }}
                    transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 + index * 0.05 }}
                    className="h-full bg-gradient-to-r from-primary/70 to-primary rounded-full"
                  />
                </div>
              </motion.div>
            );
          })
        ) : (
          <p className="text-sm text-muted-foreground text-center py-2">
            Aún no hay gastos este mes
          </p>
        )}

        {/* Total Income */}
        {totalIncome > 0 && (
          <div className="pt-2 border-t border-border/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" strokeWidth={1.5} />
                </div>
                <span className="text-sm font-medium text-foreground">Ingresos totales</span>
              </div>
              <span className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">+{totalIncome.toFixed(0)}€</span>
            </div>
          </div>
        )}
      </motion.div>

      {/* Grouped Movements */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-5"
      >
        {groupedMovements.length === 0 ? (
          <div className="bg-card rounded-3xl p-8 text-center">
            <p className="text-muted-foreground">Aún no hay movimientos este mes</p>
            <p className="text-sm text-muted-foreground mt-1">Pulsa el + para añadir uno</p>
          </div>
        ) : (
          groupedMovements.map((group, groupIndex) => (
            <div key={group.label} className="space-y-3">
              {/* Time Group Header */}
              <motion.h3
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.25 + groupIndex * 0.05 }}
                className="text-sm font-medium text-muted-foreground px-1"
              >
                {group.label}
              </motion.h3>

              {/* Movements in this group */}
              <div className="bg-card rounded-3xl overflow-hidden">
                <AnimatePresence mode="popLayout">
                  {group.movements.map((movement) => {
                    const isIncome = movement.type === 'income';
                    const config = getCategoryConfig(movement.category);
                    const Icon = isIncome ? TrendingUp : config.icon;
                    const displayName = movement.concept || movement.description;
                    
                    return (
                      <motion.div
                        key={movement.id}
                        layout
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="flex items-center justify-between p-4"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className={`p-2.5 rounded-2xl shrink-0 ${
                            isIncome 
                              ? 'bg-emerald-100 dark:bg-emerald-900/30' 
                              : 'bg-orange-100 dark:bg-orange-900/30'
                          }`}>
                            <Icon 
                              className={`w-5 h-5 ${isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-orange-600 dark:text-orange-400'}`} 
                              strokeWidth={1.5} 
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-foreground truncate text-base">{displayName}</p>
                              {movement.isRecurring && (
                                <RefreshCw className="w-3.5 h-3.5 text-orange-500/70 shrink-0" strokeWidth={2} />
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground/80 mt-0.5">
                              {config.label} · {formatRelativeDate(movement.date)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className={`text-lg font-semibold ${
                            isIncome 
                              ? 'text-emerald-600 dark:text-emerald-400' 
                              : 'text-orange-600 dark:text-orange-400'
                          }`}>
                            {isIncome ? '+' : '-'}{movement.amount.toFixed(2)}€
                          </span>
                          <button
                            onClick={() => setMovementToDelete(movement)}
                            className="p-1.5 rounded-full hover:bg-muted/80 transition-colors text-muted-foreground hover:text-destructive"
                            aria-label="Eliminar movimiento"
                          >
                            <X className="w-4 h-4" strokeWidth={1.5} />
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </div>
          ))
        )}
      </motion.div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!movementToDelete} onOpenChange={(open) => !open && setMovementToDelete(null)}>
        <AlertDialogContent className="rounded-3xl max-w-sm mx-auto">
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar este movimiento?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              {movementToDelete && (
                <>
                  <span className="block">
                    {movementToDelete.concept || movementToDelete.description}: {movementToDelete.type === 'income' ? '+' : '-'}{movementToDelete.amount.toFixed(2)}€
                  </span>
                  <span className="block text-sm">
                    {movementToDelete.type === 'expense' 
                      ? `Se sumarán ${movementToDelete.amount.toFixed(2)}€ a tu saldo.`
                      : `Se restarán ${movementToDelete.amount.toFixed(2)}€ de tu saldo.`
                    }
                  </span>
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-2xl">Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfirm}
              className="rounded-2xl bg-destructive hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ExpensesPage;
