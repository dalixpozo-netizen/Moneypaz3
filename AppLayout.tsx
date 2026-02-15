import { Outlet } from "react-router-dom";
import { BottomNav } from "./BottomNav";

export const AppLayout = () => {
  return (
    // Hemos añadido bg-[#1A1F2C] aquí para que NADA sea blanco
    <div className="min-h-screen bg-[#1A1F2C] flex flex-col w-full overflow-x-hidden">
      <main className="flex-1 w-full max-w-md mx-auto pb-24">
        <Outlet />
      </main>
      {/* Pasamos una función vacía al onAddClick por ahora */}
      <BottomNav onAddClick={() => console.log("Añadir gasto")} />
    </div>
  );
};