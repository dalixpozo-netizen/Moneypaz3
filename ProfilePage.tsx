import { useState } from "react";
import { motion } from "framer-motion";
import { User, Wallet, Target, Moon, HelpCircle, LogOut, Trash2, Download } from "lucide-react";
import { useFinanceStore } from "@/hooks/use-finance-store";
import { AdminLink } from "@/components/admin/AdminLink";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const menuItems = [
  { icon: User, label: "Tu perfil", description: "Personaliza tu experiencia" },
  { icon: Wallet, label: "Presupuesto mensual", description: "Ajusta tu límite de gasto" },
  { icon: Target, label: "Objetivos", description: "Ahorra para lo que importa" },
  { icon: Moon, label: "Apariencia", description: "Modo claro u oscuro" },
  { icon: HelpCircle, label: "Ayuda", description: "Resolvemos tus dudas" },
];

const ProfilePage = () => {
  const { currentBalance, movements, initialBalance, customCategories, resetAll } = useFinanceStore();
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      localStorage.clear();
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      toast({
        title: "Sesión cerrada",
        description: "Vuelve pronto a Moneypaz",
      });

      navigate("/login");
    } catch (error: any) {
      console.error("Error logout:", error.message);
      localStorage.clear();
      navigate("/login");
    }
  };

  const handleReset = () => {
    resetAll();
    localStorage.clear();
    setIsResetDialogOpen(false);

    toast({
      title: "Moneypaz reiniciado",
      description: "Tus datos han sido borrados. Vamos a configurar tu nuevo saldo.",
    });

    // Cambiado de /register a / para evitar el error 404
    navigate("/");
  };

  const handleExportData = () => {
    const exportData = {
      exportDate: new Date().toISOString(),
      initialBalance,
      currentBalance,
      customCategories,
      movements: movements.map((m) => ({
        ...m,
        dateFormatted: new Date(m.date).toLocaleDateString("es-ES"),
      })),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `moneypaz-backup-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = () => {
    const headers = ["Fecha", "Tipo", "Categoría", "Descripción", "Importe"];
    const rows = movements.map((m) => [
      new Date(m.date).toLocaleDateString("es-ES"),
      m.type === "income" ? "Ingreso" : "Gasto",
      m.category,
      m.description,
      m.type === "income" ? m.amount.toFixed(2) : `-${m.amount.toFixed(2)}`,
    ]);

    const csvContent = [headers.join(";"), ...rows.map((row) => row.join(";"))].join("\n");
    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `moneypaz-movimientos-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-semibold text-foreground mb-1">Ajustes de Moneypaz</h1>
        <p className="text-muted-foreground text-sm">Tu espacio personal de tranquilidad financiera</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-card rounded-3xl p-6"
      >
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center">
            <User className="w-7 h-7 text-primary" strokeWidth={1.5} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Tu Cuenta</h2>
            <p className="text-sm text-muted-foreground">Gestiona tu perfil en Moneypaz</p>
          </div>
        </div>
        <div className="text-center py-4">
          <p className="text-sm text-muted-foreground mb-1">Saldo disponible</p>
          <p className="text-4xl font-bold text-foreground tracking-tight">{currentBalance.toFixed(2)}€</p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="bg-card rounded-3xl p-5"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30">
            <Download className="w-5 h-5 text-emerald-600 dark:text-emerald-400" strokeWidth={1.5} />
          </div>
          <div>
            <h3 className="font-medium text-foreground">Copia de seguridad</h3>
            <p className="text-sm text-muted-foreground">Exporta tus datos de Moneypaz</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleExportCSV}
            className="flex-1 p-3 rounded-2xl bg-muted/50 hover:bg-muted text-sm font-medium"
          >
            CSV
          </button>
          <button
            onClick={handleExportData}
            className="flex-1 p-3 rounded-2xl bg-muted/50 hover:bg-muted text-sm font-medium"
          >
            JSON
          </button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-card rounded-3xl overflow-hidden"
      >
        <AdminLink />
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button key={item.label} className="w-full flex items-center gap-4 p-4 hover:bg-accent/50 text-left">
              <div className="p-2 rounded-2xl bg-muted">
                <Icon className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground">{item.label}</p>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
            </button>
          );
        })}
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
        <AlertDialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
          <AlertDialogTrigger asChild>
            <button className="w-full flex items-center justify-center gap-3 p-4 rounded-3xl bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400">
              <Trash2 className="w-5 h-5" />
              <span className="font-medium">Borrar todo y empezar de nuevo</span>
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent className="rounded-3xl">
            <AlertDialogHeader>
              <AlertDialogTitle>¿Empezar de cero?</AlertDialogTitle>
              <AlertDialogDescription>
                Esto borrará todos tus datos en Moneypaz. Acción irreversible.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="rounded-2xl">Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleReset} className="rounded-2xl bg-orange-600">
                Sí, borrar todo
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </motion.div>

      <motion.button
        onClick={handleLogout}
        className="w-full flex items-center justify-center gap-3 p-4 rounded-3xl bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
      >
        <LogOut className="w-5 h-5" strokeWidth={1.5} />
        <span className="font-medium">Cerrar sesión en Moneypaz</span>
      </motion.button>
    </div>
  );
};

export default ProfilePage;
