import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, ShoppingCart, MapPin, Wine, Package, ArrowRight, Check, 
  Plus, Minus, Search, ChevronDown, ChevronUp,
  Zap, Droplets, Smartphone, Home, Shield, CreditCard,
  Briefcase, Wallet, Gift, Coins, RefreshCw, AlertTriangle, CheckCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (
    type: 'expense' | 'income',
    amount: number,
    category: string,
    description: string,
    concept?: string,
    isRecurring?: boolean
  ) => void;
  customCategories?: string[];
  frequentCategories?: string[];
  suggestedConcepts?: string[];
  onAddCustomCategory?: (name: string) => string;
  compareRecurringExpense?: (amount: number, concept: string, category: string) => { 
    type: 'stable' | 'increased' | 'decreased' | 'new' | 'silent'; 
    difference?: number 
  };
}

// Main 4 categories - "Las 4 Grandes" (updated: Transporte -> Movilidad)
const mainCategories = [
  { id: "alimentacion", label: "Alimentación", icon: ShoppingCart },
  { id: "movilidad", label: "Movilidad", icon: MapPin },
  { id: "ocio", label: "Ocio", icon: Wine },
  { id: "varios", label: "Varios", icon: Package },
];

// Bills/Facturas categories
const billCategories = [
  { id: "luz", label: "Luz", icon: Zap },
  { id: "agua", label: "Agua", icon: Droplets },
  { id: "movil", label: "Móvil", icon: Smartphone },
  { id: "vivienda", label: "Hipoteca/Alquiler", icon: Home },
  { id: "seguros", label: "Seguros", icon: Shield },
  { id: "suscripciones", label: "Suscripciones", icon: CreditCard },
];

// Income categories
const incomeCategories = [
  { id: "nomina", label: "Nómina", icon: Briefcase },
  { id: "bizum", label: "Bizum", icon: Wallet },
  { id: "regalo", label: "Regalo", icon: Gift },
  { id: "otros_ingresos", label: "Otros ingresos", icon: Coins },
];

// Get icon for a category
const getCategoryIcon = (categoryId: string) => {
  const allPredefined = [...mainCategories, ...billCategories, ...incomeCategories];
  const found = allPredefined.find(c => c.id === categoryId);
  return found?.icon || Package;
};

export const AddExpenseModal = ({ 
  isOpen, 
  onClose, 
  onSave,
  customCategories = [],
  frequentCategories = [],
  suggestedConcepts = [],
  onAddCustomCategory,
  compareRecurringExpense
}: AddExpenseModalProps) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [movementType, setMovementType] = useState<'expense' | 'income'>('expense');
  const [amount, setAmount] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("varios");
  const [concept, setConcept] = useState(""); // New: concept/name field
  const [isRecurring, setIsRecurring] = useState(false); // New: recurring toggle
  const [saved, setSaved] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showBills, setShowBills] = useState(false);
  const [conceptSearchFocused, setConceptSearchFocused] = useState(false);
  const [recurringAlert, setRecurringAlert] = useState<{ 
    type: 'stable' | 'increased' | 'decreased' | 'new' | 'silent'; 
    difference?: number 
  } | null>(null);

  // Filter concept suggestions based on input
  const filteredConcepts = useMemo(() => {
    if (!concept.trim()) return suggestedConcepts.slice(0, 5);
    const query = concept.toLowerCase();
    return suggestedConcepts
      .filter(c => c.toLowerCase().includes(query))
      .slice(0, 5);
  }, [concept, suggestedConcepts]);

  // Smart suggestions: frequently used categories first
  const smartSuggestions = useMemo(() => {
    const predefinedIds = [...mainCategories, ...billCategories, ...incomeCategories].map(c => c.id);
    
    // Filter frequent categories by type
    const relevantFrequent = frequentCategories.filter(cat => {
      if (movementType === 'income') {
        return cat.startsWith('ingreso_') || incomeCategories.some(ic => ic.id === cat);
      }
      return !cat.startsWith('ingreso_');
    });

    // Get custom categories that are frequently used
    const frequentCustom = relevantFrequent
      .filter(cat => !predefinedIds.includes(cat) && customCategories.includes(cat))
      .slice(0, 4);

    return frequentCustom;
  }, [frequentCategories, customCategories, movementType]);

  // All available categories for search (based on movement type)
  const allCategories = useMemo(() => {
    if (movementType === 'income') {
      const custom = customCategories
        .filter(c => c.startsWith('ingreso_'))
        .map(c => ({
          id: c,
          label: c.replace('ingreso_', '').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
          icon: Coins,
        }));
      return [...incomeCategories, ...custom];
    }
    
    const base = [...mainCategories, ...billCategories];
    const custom = customCategories
      .filter(c => !c.startsWith('ingreso_'))
      .map(c => ({
        id: c,
        label: c.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
        icon: Package,
      }));
    return [...base, ...custom];
  }, [customCategories, movementType]);

  // Filter categories based on search
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    return allCategories.filter(c => 
      c.label.toLowerCase().includes(query) || c.id.toLowerCase().includes(query)
    );
  }, [searchQuery, allCategories]);

  // Check if search query is a new category
  const canCreateCategory = useMemo(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) return false;
    const query = searchQuery.toLowerCase().trim();
    return !allCategories.some(c => 
      c.id.toLowerCase() === query || c.label.toLowerCase() === query
    );
  }, [searchQuery, allCategories]);

  // Check recurring comparison when isRecurring changes or amount/concept changes
  useEffect(() => {
    if (isRecurring && compareRecurringExpense && amount && (concept || selectedCategory)) {
      const result = compareRecurringExpense(
        parseFloat(amount),
        concept || selectedCategory,
        selectedCategory
      );
      setRecurringAlert(result);
    } else {
      setRecurringAlert(null);
    }
  }, [isRecurring, amount, concept, selectedCategory, compareRecurringExpense]);

  const handleNumberClick = (num: string) => {
    if (num === "." && amount.includes(".")) return;
    if (num === "delete") {
      setAmount(prev => prev.slice(0, -1));
      return;
    }
    if (amount.includes(".") && amount.split(".")[1]?.length >= 2) return;
    setAmount(prev => prev + num);
  };

  const getCategoryLabel = (catId: string) => {
    const found = allCategories.find(c => c.id === catId);
    if (found) return found.label;
    // Also check income categories
    const incomeFound = incomeCategories.find(c => c.id === catId);
    if (incomeFound) return incomeFound.label;
    // Format custom category name
    const cleanId = catId.replace('ingreso_', '');
    return cleanId.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  const handleSave = () => {
    const parsedAmount = parseFloat(amount);
    if (parsedAmount > 0 && onSave) {
      // Use concept as description if provided, otherwise use category label
      const description = concept.trim() || getCategoryLabel(selectedCategory);
      onSave(movementType, parsedAmount, selectedCategory, description, concept.trim() || undefined, isRecurring);
    }
    setSaved(true);
    setTimeout(() => {
      handleClose();
    }, 1200);
  };

  const handleClose = () => {
    setStep(1);
    setMovementType('expense');
    setAmount("");
    setSelectedCategory("varios");
    setConcept("");
    setIsRecurring(false);
    setSaved(false);
    setSearchQuery("");
    setShowBills(false);
    setRecurringAlert(null);
    onClose();
  };

  const handleNext = () => {
    if (!amount) return;
    setStep(2);
    // Set default category based on type
    if (movementType === 'income') {
      setSelectedCategory("nomina");
    } else {
      setSelectedCategory("varios");
    }
  };

  const handleSelectCategory = (catId: string) => {
    setSelectedCategory(catId);
    setSearchQuery("");
  };

  const handleCreateCategory = () => {
    if (!canCreateCategory || !onAddCustomCategory) return;
    const prefix = movementType === 'income' ? 'ingreso_' : '';
    const newCatId = onAddCustomCategory(prefix + searchQuery.trim().toLowerCase());
    setSelectedCategory(newCatId);
    setSearchQuery("");
  };

  const handleSelectConcept = (c: string) => {
    setConcept(c.charAt(0).toUpperCase() + c.slice(1));
    setConceptSearchFocused(false);
  };

  const numbers = ["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "delete"];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-background/80 backdrop-blur-md z-50 flex items-end justify-center"
          onClick={(e) => e.target === e.currentTarget && handleClose()}
        >
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="w-full max-w-md bg-card rounded-t-[2.5rem] shadow-float p-6 pb-safe max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-foreground">
                {saved ? "¡Guardado!" : step === 1 ? "¿Cuánto fue?" : movementType === 'income' ? "¿De dónde viene?" : "¿En qué lo usaste?"}
              </h2>
              <button
                onClick={handleClose}
                className="p-2 rounded-full hover:bg-muted transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" strokeWidth={1.5} />
              </button>
            </div>

            <AnimatePresence mode="wait">
              {saved ? (
                <motion.div
                  key="saved"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center py-12"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.1, type: "spring" }}
                    className="w-20 h-20 rounded-full bg-primary flex items-center justify-center mb-4"
                  >
                    <Check className="w-10 h-10 text-primary-foreground" strokeWidth={1.5} />
                  </motion.div>
                  
                  {/* Show recurring alert after save */}
                  {recurringAlert && recurringAlert.type !== 'silent' && recurringAlert.type !== 'new' && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className={`mt-4 px-4 py-2 rounded-2xl text-sm font-medium ${
                        recurringAlert.type === 'stable' 
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                          : recurringAlert.type === 'increased'
                          ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                          : 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400'
                      }`}
                    >
                      {recurringAlert.type === 'stable' && (
                        <span className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4" /> Factura estable, como siempre ✅
                        </span>
                      )}
                      {recurringAlert.type === 'increased' && (
                        <span className="flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4" /> Ojo, ha subido {recurringAlert.difference?.toFixed(2)}€ ⚠️
                        </span>
                      )}
                      {recurringAlert.type === 'decreased' && (
                        <span className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4" /> ¡Bien! Ha bajado {recurringAlert.difference?.toFixed(2)}€ 🎉
                        </span>
                      )}
                    </motion.div>
                  )}
                  
                  <p className="text-muted-foreground mt-2">Todo bajo control</p>
                </motion.div>
              ) : step === 1 ? (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  {/* Movement Type Toggle */}
                  <div className="flex gap-3 mb-6">
                    <button
                      onClick={() => setMovementType('expense')}
                      className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-2xl transition-all ${
                        movementType === 'expense'
                          ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400'
                          : 'bg-muted/50 text-muted-foreground'
                      }`}
                    >
                      <Minus className="w-5 h-5" strokeWidth={2} />
                      <span className="font-medium">Gasto</span>
                    </button>
                    <button
                      onClick={() => setMovementType('income')}
                      className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-2xl transition-all ${
                        movementType === 'income'
                          ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
                          : 'bg-muted/50 text-muted-foreground'
                      }`}
                    >
                      <Plus className="w-5 h-5" strokeWidth={2} />
                      <span className="font-medium">Ingreso</span>
                    </button>
                  </div>

                  {/* Amount Display */}
                  <div className={`rounded-3xl p-6 mb-6 text-center transition-colors ${
                    movementType === 'income' 
                      ? 'bg-emerald-50 dark:bg-emerald-900/20' 
                      : 'bg-orange-50 dark:bg-orange-900/20'
                  }`}>
                    <span className={`text-4xl font-light ${
                      movementType === 'income' 
                        ? 'text-emerald-600 dark:text-emerald-400' 
                        : 'text-orange-600 dark:text-orange-400'
                    }`}>
                      {movementType === 'income' ? '+' : '-'}{amount || "0"}
                    </span>
                    <span className="text-2xl font-light text-muted-foreground ml-2">€</span>
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

                  {/* Next Button */}
                  <Button
                    onClick={handleNext}
                    disabled={!amount || parseFloat(amount) <= 0}
                    className="w-full h-14 rounded-3xl text-lg font-medium"
                    variant="peaceful"
                  >
                    Siguiente
                    <ArrowRight className="w-5 h-5 ml-2" strokeWidth={1.5} />
                  </Button>
                </motion.div>
              ) : (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  {/* Amount Summary */}
                  <div className="text-center mb-4">
                    <span className={`text-3xl font-light ${
                      movementType === 'income'
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-orange-600 dark:text-orange-400'
                    }`}>
                      {movementType === 'income' ? '+' : '-'}{amount}€
                    </span>
                  </div>

                  {/* Concept/Name Field - REQUIRED */}
                  <div className="mb-4 relative">
                    <label className="text-xs text-muted-foreground mb-1 block px-1">
                      Concepto / Nombre <span className="text-orange-500">*</span>
                    </label>
                    <Input
                      type="text"
                      placeholder="ej: Netflix, Mercadona, Nómina..."
                      value={concept}
                      onChange={(e) => setConcept(e.target.value)}
                      onFocus={() => setConceptSearchFocused(true)}
                      onBlur={() => setTimeout(() => setConceptSearchFocused(false), 200)}
                      className="h-12 rounded-2xl border-muted/50 bg-cream-warm/50 dark:bg-muted/30 focus:ring-orange-200"
                    />
                    
                    {/* Concept suggestions dropdown */}
                    <AnimatePresence>
                      {conceptSearchFocused && filteredConcepts.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
                          className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-2xl shadow-lg z-10 overflow-hidden"
                        >
                          {filteredConcepts.map((c) => (
                            <button
                              key={c}
                              onClick={() => handleSelectConcept(c)}
                              className="w-full px-4 py-2.5 text-left text-sm hover:bg-muted/50 transition-colors capitalize"
                            >
                              {c}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* NEW: Recurring Expense Toggle */}
                  {movementType === 'expense' && (
                    <div className="mb-4 p-4 rounded-2xl bg-muted/30">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <RefreshCw className="w-5 h-5 text-muted-foreground" strokeWidth={1.5} />
                          <div>
                            <p className="text-sm font-medium text-foreground">¿Es un gasto recurrente?</p>
                            <p className="text-xs text-muted-foreground">Facturas, suscripciones...</p>
                          </div>
                        </div>
                        <Switch
                          checked={isRecurring}
                          onCheckedChange={setIsRecurring}
                        />
                      </div>
                      
                      {/* Recurring alert preview */}
                      <AnimatePresence>
                        {isRecurring && recurringAlert && recurringAlert.type !== 'silent' && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-3 overflow-hidden"
                          >
                            <div className={`px-3 py-2 rounded-xl text-sm ${
                              recurringAlert.type === 'stable' 
                                ? 'bg-emerald-100/50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400'
                                : recurringAlert.type === 'increased'
                                ? 'bg-orange-100/50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400'
                                : recurringAlert.type === 'decreased'
                                ? 'bg-sky-100/50 text-sky-700 dark:bg-sky-900/20 dark:text-sky-400'
                                : 'bg-muted/50 text-muted-foreground'
                            }`}>
                              {recurringAlert.type === 'stable' && "✅ Factura estable, como siempre"}
                              {recurringAlert.type === 'increased' && `⚠️ Ojo, ha subido ${recurringAlert.difference?.toFixed(2)}€`}
                              {recurringAlert.type === 'decreased' && `🎉 ¡Bien! Ha bajado ${recurringAlert.difference?.toFixed(2)}€`}
                              {recurringAlert.type === 'new' && "📝 Primera vez que registras esto"}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}

                  {/* Smart Suggestions (frequently used custom categories) */}
                  {smartSuggestions.length > 0 && !searchQuery.trim() && (
                    <div className="mb-4">
                      <p className="text-xs text-muted-foreground mb-2 px-1">Usadas recientemente</p>
                      <div className="flex flex-wrap gap-2">
                        {smartSuggestions.map((catId) => {
                          const isSelected = selectedCategory === catId;
                          const displayName = catId.replace('ingreso_', '');
                          const Icon = getCategoryIcon(catId);
                          return (
                            <motion.button
                              key={catId}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleSelectCategory(catId)}
                              className={`flex items-center gap-2 px-4 py-2 rounded-2xl transition-all ${
                                isSelected
                                  ? movementType === 'income'
                                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 ring-2 ring-emerald-300"
                                    : "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300 ring-2 ring-orange-300"
                                  : "bg-muted/50 text-foreground hover:bg-orange-50 dark:hover:bg-orange-900/20"
                              }`}
                            >
                              <Icon className="w-4 h-4" strokeWidth={1.5} />
                              <span className="text-sm font-medium capitalize">{displayName}</span>
                            </motion.button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Category Selection - depends on movement type */}
                  {movementType === 'expense' ? (
                    <>
                      {/* Las 4 Grandes - Main Categories */}
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        {mainCategories.map((cat) => {
                          const Icon = cat.icon;
                          const isSelected = selectedCategory === cat.id;
                          return (
                            <motion.button
                              key={cat.id}
                              whileTap={{ scale: 0.97 }}
                              onClick={() => handleSelectCategory(cat.id)}
                              className={`flex items-center gap-3 p-4 rounded-3xl transition-all min-h-[72px] ${
                                isSelected
                                  ? "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300 ring-2 ring-orange-300 dark:ring-orange-600"
                                  : "bg-cream-warm dark:bg-muted/50 text-foreground hover:bg-orange-50 dark:hover:bg-orange-900/20"
                              }`}
                            >
                              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                                isSelected 
                                  ? "bg-orange-200 dark:bg-orange-800" 
                                  : "bg-orange-100/50 dark:bg-muted"
                              }`}>
                                <Icon className="w-6 h-6" strokeWidth={1.5} />
                              </div>
                              <span className="font-medium text-sm">{cat.label}</span>
                            </motion.button>
                          );
                        })}
                      </div>

                      {/* Bills Section - Collapsible */}
                      <div className="mb-4">
                        <button
                          onClick={() => setShowBills(!showBills)}
                          className="w-full flex items-center justify-between p-3 rounded-2xl bg-muted/30 hover:bg-muted/50 transition-colors text-muted-foreground"
                        >
                          <span className="text-sm font-medium">Ver más / Facturas</span>
                          {showBills ? (
                            <ChevronUp className="w-5 h-5" strokeWidth={1.5} />
                          ) : (
                            <ChevronDown className="w-5 h-5" strokeWidth={1.5} />
                          )}
                        </button>
                        
                        <AnimatePresence>
                          {showBills && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="grid grid-cols-2 gap-2 pt-3">
                                {billCategories.map((cat) => {
                                  const Icon = cat.icon;
                                  const isSelected = selectedCategory === cat.id;
                                  return (
                                    <motion.button
                                      key={cat.id}
                                      whileTap={{ scale: 0.97 }}
                                      onClick={() => handleSelectCategory(cat.id)}
                                      className={`flex items-center gap-2 p-3 rounded-2xl transition-all ${
                                        isSelected
                                          ? "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300"
                                          : "bg-muted/30 text-foreground hover:bg-orange-50 dark:hover:bg-orange-900/20"
                                      }`}
                                    >
                                      <Icon className="w-5 h-5" strokeWidth={1.5} />
                                      <span className="text-sm font-medium">{cat.label}</span>
                                    </motion.button>
                                  );
                                })}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Income Categories - Main */}
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        {incomeCategories.slice(0, 4).map((cat) => {
                          const Icon = cat.icon;
                          const isSelected = selectedCategory === cat.id;
                          return (
                            <motion.button
                              key={cat.id}
                              whileTap={{ scale: 0.97 }}
                              onClick={() => handleSelectCategory(cat.id)}
                              className={`flex items-center gap-3 p-4 rounded-3xl transition-all min-h-[72px] ${
                                isSelected
                                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 ring-2 ring-emerald-300 dark:ring-emerald-600"
                                  : "bg-cream-warm dark:bg-muted/50 text-foreground hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                              }`}
                            >
                              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                                isSelected 
                                  ? "bg-emerald-200 dark:bg-emerald-800" 
                                  : "bg-emerald-100/50 dark:bg-muted"
                              }`}>
                                <Icon className="w-6 h-6" strokeWidth={1.5} />
                              </div>
                              <span className="font-medium text-sm">{cat.label}</span>
                            </motion.button>
                          );
                        })}
                      </div>
                    </>
                  )}

                  {/* Search Input */}
                  <div className="relative mb-4">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" strokeWidth={1.5} />
                    <Input
                      type="text"
                      placeholder={movementType === 'income' ? "Buscar o crear (ej: Nómina Papá)..." : "Buscar o crear categoría..."}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-12 h-12 rounded-2xl border-muted/50 bg-cream-warm/50 dark:bg-muted/30 focus:ring-orange-200"
                    />
                  </div>

                  {/* Search Results or Create New */}
                  <AnimatePresence>
                    {searchQuery.trim() && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mb-4 overflow-hidden"
                      >
                        {filteredCategories.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-3">
                            {filteredCategories.slice(0, 6).map((cat) => {
                              const Icon = cat.icon;
                              const isSelected = selectedCategory === cat.id;
                              return (
                                <motion.button
                                  key={cat.id}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => handleSelectCategory(cat.id)}
                                  className={`flex items-center gap-2 px-4 py-2 rounded-2xl transition-all ${
                                    isSelected
                                      ? movementType === 'income'
                                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                                        : "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300"
                                      : "bg-muted/50 text-foreground hover:bg-orange-50 dark:hover:bg-orange-900/20"
                                  }`}
                                >
                                  <Icon className="w-4 h-4" strokeWidth={1.5} />
                                  <span className="text-sm font-medium">{cat.label}</span>
                                </motion.button>
                              );
                            })}
                          </div>
                        )}
                        
                        {canCreateCategory && (
                          <motion.button
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleCreateCategory}
                            className="w-full flex items-center justify-center gap-2 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors"
                          >
                            <Plus className="w-5 h-5" strokeWidth={2} />
                            <span className="font-medium">Crear "{searchQuery.trim()}"</span>
                          </motion.button>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Selected Category Display */}
                  <div className={`mb-4 p-3 rounded-2xl border ${
                    movementType === 'income'
                      ? "bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-900/30"
                      : "bg-orange-50/50 dark:bg-orange-900/10 border-orange-100 dark:border-orange-900/30"
                  }`}>
                    <p className="text-xs text-muted-foreground mb-1">
                      {movementType === 'income' ? 'Origen seleccionado' : 'Categoría seleccionada'}
                    </p>
                    <p className={`font-medium capitalize ${
                      movementType === 'income'
                        ? "text-emerald-700 dark:text-emerald-400"
                        : "text-orange-700 dark:text-orange-400"
                    }`}>
                      {concept.trim() ? `${concept} (${getCategoryLabel(selectedCategory)})` : getCategoryLabel(selectedCategory)}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <Button
                      onClick={() => setStep(1)}
                      variant="ghost"
                      className="flex-1 h-14 rounded-3xl text-lg"
                    >
                      Atrás
                    </Button>
                    <Button
                      onClick={handleSave}
                      disabled={!concept.trim()}
                      variant="peaceful"
                      className="flex-1 h-14 rounded-3xl text-lg font-medium"
                    >
                      Guardar
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AddExpenseModal;