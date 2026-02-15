import { useFinanceStore } from "@/hooks/use-finance-store";

export const MonthSummary = () => {
  const { movements } = useFinanceStore();
  
  // Cálculo ultra simple para evitar errores de lógica
  const total = movements.reduce((acc, curr) => {
    return curr.type === 'expense' ? acc + curr.amount : acc;
  }, 0);

  return (
    <div className="text-center">
      <p className="text-gray-400 text-sm font-medium mb-2 uppercase tracking-widest">Gasto Total</p>
      <div className="text-5xl font-black text-white">
        {total.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
      </div>
    </div>
  );
};