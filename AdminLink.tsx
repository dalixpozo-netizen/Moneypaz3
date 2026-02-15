import { Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAdmin } from "@/hooks/use-admin";

export const AdminLink = () => {
  const navigate = useNavigate();
  const { isAdmin, isLoading } = useAdmin();

  // Don't render anything if not admin or still loading
  if (isLoading || !isAdmin) {
    return null;
  }

  return (
    <button
      onClick={() => navigate("/admin")}
      className="w-full flex items-center gap-4 p-4 hover:bg-accent/50 transition-colors text-left"
    >
      <div className="p-2 rounded-2xl bg-primary/20">
        <Shield className="w-5 h-5 text-primary" strokeWidth={1.5} />
      </div>
      <div className="flex-1">
        <p className="font-medium text-foreground">Panel de administración</p>
        <p className="text-sm text-muted-foreground">Gestión de usuarios</p>
      </div>
    </button>
  );
};
