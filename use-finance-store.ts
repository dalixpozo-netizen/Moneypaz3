import { useState, useEffect, useCallback, useMemo } from 'react';

export type MovementType = 'expense' | 'income';
export type CategoryId = string; // Now dynamic to support custom categories

export interface Movement {
  id: string;
  type: MovementType;
  amount: number;
  category: CategoryId;
  description: string;
  concept?: string; // New: custom name like "Netflix", "Mercadona"
  isRecurring?: boolean; // New: flag for recurring expenses
  date: string;
  timestamp: number;
}

export interface FinanceState {
  initialBalance: number;
  movements: Movement[];
  customCategories: string[]; // User-created categories
  usedConcepts: string[]; // Memory of concept names for suggestions
  userName: string; // User's display name
}

const STORAGE_KEY = 'moneypaz-finance-store';

// Categories that should NOT trigger price comparison alerts
const SILENT_RECURRING_CATEGORIES = ['vivienda', 'hipoteca', 'alquiler', 'prestamo'];

const getStoredState = (): FinanceState => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Ensure all fields exist for backward compatibility
      return { 
        ...parsed, 
        customCategories: parsed.customCategories || [],
        usedConcepts: parsed.usedConcepts || [],
        userName: parsed.userName || '',
      };
    }
  } catch (error) {
    console.error('Error reading from localStorage:', error);
  }
  return { initialBalance: 0, movements: [], customCategories: [], usedConcepts: [], userName: '' };
};

export const useFinanceStore = () => {
  const [state, setState] = useState<FinanceState>(() => getStoredState());

  // Persist to localStorage whenever state changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }, [state]);

  // Calculate current balance - memoized
  const currentBalance = useMemo(() => {
    return state.initialBalance + state.movements.reduce((acc, mov) => {
      return mov.type === 'income' ? acc + mov.amount : acc - mov.amount;
    }, 0);
  }, [state.initialBalance, state.movements]);

  // Check if needs initial setup - memoized
  const needsSetup = useMemo(() => {
    return state.initialBalance === 0 && state.movements.length === 0;
  }, [state.initialBalance, state.movements.length]);

  // Set initial balance
  const setInitialBalance = useCallback((amount: number) => {
    setState(prev => ({ ...prev, initialBalance: amount }));
  }, []);

  // Set user name
  const setUserName = useCallback((name: string) => {
    setState(prev => ({ ...prev, userName: name }));
  }, []);

  // Find previous recurring expense for comparison
  const findPreviousRecurring = useCallback((concept: string, category: string): Movement | null => {
    const lowerConcept = concept.toLowerCase().trim();
    const lowerCategory = category.toLowerCase();
    
    // Find the most recent matching expense (excluding the current one being added)
    return state.movements.find(m => 
      m.type === 'expense' &&
      m.isRecurring &&
      (
        (m.concept && m.concept.toLowerCase().trim() === lowerConcept) ||
        m.category.toLowerCase() === lowerCategory
      )
    ) || null;
  }, [state.movements]);

  // Compare recurring expense and return alert info
  const compareRecurringExpense = useCallback((
    amount: number,
    concept: string,
    category: string
  ): { type: 'stable' | 'increased' | 'decreased' | 'new' | 'silent'; difference?: number } => {
    // Skip alerts for certain categories
    if (SILENT_RECURRING_CATEGORIES.some(c => category.toLowerCase().includes(c) || concept.toLowerCase().includes(c))) {
      return { type: 'silent' };
    }

    const previous = findPreviousRecurring(concept, category);
    
    if (!previous) {
      return { type: 'new' };
    }

    const diff = amount - previous.amount;
    
    if (Math.abs(diff) < 0.01) {
      return { type: 'stable' };
    } else if (diff > 0) {
      return { type: 'increased', difference: diff };
    } else {
      return { type: 'decreased', difference: Math.abs(diff) };
    }
  }, [findPreviousRecurring]);

  // Add a movement (updated to include concept and recurring flag)
  const addMovement = useCallback((
    type: MovementType,
    amount: number,
    category: CategoryId,
    description: string,
    concept?: string,
    isRecurring?: boolean
  ) => {
    const now = new Date();
    const movement: Movement = {
      id: `mov-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      amount,
      category,
      description,
      concept: concept?.trim() || undefined,
      isRecurring: isRecurring || false,
      date: now.toISOString(),
      timestamp: now.getTime(),
    };
    
    setState(prev => {
      // Add concept to memory if it's new
      const newConcepts = concept && concept.trim() 
        ? prev.usedConcepts.includes(concept.trim().toLowerCase())
          ? prev.usedConcepts
          : [...prev.usedConcepts, concept.trim().toLowerCase()]
        : prev.usedConcepts;

      return {
        ...prev,
        movements: [movement, ...prev.movements],
        usedConcepts: newConcepts,
      };
    });

    return movement;
  }, []);

  // Delete a movement (reverses the balance effect)
  const deleteMovement = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      movements: prev.movements.filter(m => m.id !== id),
    }));
  }, []);

  // Add custom category
  const addCustomCategory = useCallback((categoryName: string) => {
    const normalized = categoryName.trim().toLowerCase();
    setState(prev => {
      if (prev.customCategories.includes(normalized)) return prev;
      return {
        ...prev,
        customCategories: [...prev.customCategories, normalized],
      };
    });
    return normalized;
  }, []);

  // Reset everything
  const resetAll = useCallback(() => {
    setState({ initialBalance: 0, movements: [], customCategories: [], usedConcepts: [], userName: '' });
  }, []);

  // Get total spent this month - memoized
  const monthlySpent = useMemo(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    
    return state.movements
      .filter(m => m.type === 'expense' && m.timestamp >= startOfMonth)
      .reduce((acc, m) => acc + m.amount, 0);
  }, [state.movements]);

  // Get spending by category - memoized
  const spendingByCategory = useMemo(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    
    const categoryTotals: Record<string, number> = {
      comida: 0,
      casa: 0,
      ocio: 0,
      varios: 0,
    };
    
    state.movements
      .filter(m => m.type === 'expense' && m.timestamp >= startOfMonth)
      .forEach(m => {
        if (m.category in categoryTotals) {
          categoryTotals[m.category] += m.amount;
        }
      });
    
    return categoryTotals;
  }, [state.movements]);

  // Get recent movements (last 10) - memoized
  const recentMovements = useMemo(() => {
    return state.movements.slice(0, 10);
  }, [state.movements]);

  // Get frequently used categories (sorted by usage count) - memoized
  const frequentCategories = useMemo(() => {
    const categoryCounts: Record<string, number> = {};
    
    state.movements.forEach(m => {
      categoryCounts[m.category] = (categoryCounts[m.category] || 0) + 1;
    });
    
    return Object.entries(categoryCounts)
      .sort(([, a], [, b]) => b - a)
      .map(([category]) => category);
  }, [state.movements]);

  // Get suggested concepts (sorted by frequency) - memoized with defaults
  const suggestedConcepts = useMemo(() => {
    // Default concepts from Excel-style usage
    const defaultConcepts = [
      'mercadona', 'lidl', 'coviran', 'carrefour', 'dia',
      'netflix', 'spotify', 'hbo', 'disney', 'amazon prime',
      'gasolina', 'parking', 'renfe', 'bus', 'taxi',
      'cajamar', 'santander', 'bbva', 'ing',
      'seguro ocaso', 'seguro mapfre', 'mutua',
      'endesa', 'iberdrola', 'naturgy',
      'vodafone', 'movistar', 'orange',
      'nómina papá', 'nómina mamá', 'bizum papá', 'bizum mamá',
      'comunidad', 'hipoteca', 'alquiler',
    ];
    
    const conceptCounts: Record<string, number> = {};
    
    // Count user's actual usage
    state.movements
      .filter(m => m.concept)
      .forEach(m => {
        const c = m.concept!.toLowerCase();
        conceptCounts[c] = (conceptCounts[c] || 0) + 1;
      });
    
    // Sort by frequency, user's concepts first
    const userConcepts = Object.entries(conceptCounts)
      .sort(([, a], [, b]) => b - a)
      .map(([concept]) => concept);
    
    // Merge: user concepts first, then defaults not already used
    const merged = [...userConcepts];
    defaultConcepts.forEach(dc => {
      if (!merged.includes(dc)) merged.push(dc);
    });
    
    return merged;
  }, [state.movements]);

  // Calculate "committed money" - recurring expenses this month
  const committedMoney = useMemo(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    
    return state.movements
      .filter(m => 
        m.type === 'expense' && 
        m.isRecurring && 
        m.timestamp >= startOfMonth
      )
      .reduce((acc, m) => acc + m.amount, 0);
  }, [state.movements]);

  // Get recurring expenses list for this month
  const recurringExpenses = useMemo(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    
    return state.movements.filter(m => 
      m.type === 'expense' && 
      m.isRecurring && 
      m.timestamp >= startOfMonth
    );
  }, [state.movements]);

  // Check if there was a big expense today (>50€)
  const todayStatus = useMemo(() => {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
    
    const todayExpenses = state.movements.filter(
      m => m.type === 'expense' && m.timestamp >= startOfDay
    );
    
    const hasBigExpense = todayExpenses.some(m => m.amount >= 50);
    const hasAnyExpense = todayExpenses.length > 0;
    
    return { hasBigExpense, hasAnyExpense, todayExpensesCount: todayExpenses.length };
  }, [state.movements]);

  // Last movement timestamp to detect recent additions
  const lastMovementTime = useMemo(() => {
    if (state.movements.length === 0) return null;
    return state.movements[0].timestamp;
  }, [state.movements]);

  // Format relative date - pure function, no hook needed
  const formatRelativeDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Hoy';
    if (diffDays === 1) return 'Ayer';
    if (diffDays < 7) return `Hace ${diffDays} días`;
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  };

  return {
    // State
    initialBalance: state.initialBalance,
    currentBalance,
    needsSetup,
    movements: state.movements,
    customCategories: state.customCategories,
    usedConcepts: state.usedConcepts,
    userName: state.userName,
    
    // Actions
    setInitialBalance,
    setUserName,
    addMovement,
    deleteMovement,
    addCustomCategory,
    resetAll,
    
    // Recurring expense comparison
    compareRecurringExpense,
    findPreviousRecurring,
    
    // Computed
    monthlySpent,
    spendingByCategory,
    recentMovements,
    frequentCategories,
    suggestedConcepts,
    todayStatus,
    lastMovementTime,
    formatRelativeDate,
    
    // Committed money
    committedMoney,
    recurringExpenses,
  };
};
