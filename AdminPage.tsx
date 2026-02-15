import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Shield, Users, Download, ArrowLeft, Loader2, AlertTriangle, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAdmin } from "@/hooks/use-admin";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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

interface UserData {
  user_id: string;
  email: string;
  display_name: string | null;
  created_at: string;
  total_expenses: number;
}

const AdminPage = () => {
  const navigate = useNavigate();
  const { isAdmin, isLoading: adminLoading, user } = useAdmin();
  const { toast } = useToast();
  const [users, setUsers] = useState<UserData[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserData | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!adminLoading && !isAdmin) {
      navigate("/app");
    }
  }, [adminLoading, isAdmin, navigate]);

  const fetchUsers = async () => {
    if (!isAdmin) return;

    try {
      setIsLoadingUsers(true);
      // Fetch all profiles (admin can see all due to RLS policy)
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("user_id, email, display_name, created_at");

      if (profilesError) {
        console.error("Error fetching profiles:", profilesError);
        toast({
          title: "Error",
          description: "No se pudieron cargar los usuarios",
          variant: "destructive",
        });
        return;
      }

      // Fetch movements for expense totals
      const { data: movements, error: movementsError } = await supabase
        .from("movements")
        .select("user_id, amount, type");

      if (movementsError) {
        console.error("Error fetching movements:", movementsError);
      }

      // Calculate total expenses per user
      const expensesByUser: Record<string, number> = {};
      movements?.forEach((m) => {
        if (m.type === "expense") {
          expensesByUser[m.user_id] = (expensesByUser[m.user_id] || 0) + Number(m.amount);
        }
      });

      // Combine data
      const usersData: UserData[] = (profiles || []).map((profile) => ({
        user_id: profile.user_id,
        email: profile.email || "Sin email",
        display_name: profile.display_name,
        created_at: profile.created_at,
        total_expenses: expensesByUser[profile.user_id] || 0,
      }));

      setUsers(usersData);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin]);

  const handleExportData = () => {
    const exportData = {
      exportDate: new Date().toISOString(),
      totalUsers: users.length,
      users: users.map((u) => ({
        email: u.email,
        displayName: u.display_name,
        registeredAt: u.created_at,
        totalExpenses: u.total_expenses.toFixed(2),
      })),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `admin-export-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Exportación completada",
      description: "Los datos se han descargado correctamente",
    });
  };

  const handleDeleteClick = (userData: UserData) => {
    // Prevent admin from deleting themselves
    if (userData.user_id === user?.id) {
      toast({
        title: "Acción no permitida",
        description: "No puedes eliminarte a ti mismo",
        variant: "destructive",
      });
      return;
    }
    setUserToDelete(userData);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;

    setIsDeleting(true);
    try {
      // Delete user's movements first
      const { error: movementsError } = await supabase
        .from("movements")
        .delete()
        .eq("user_id", userToDelete.user_id);

      if (movementsError) {
        console.error("Error deleting movements:", movementsError);
      }

      // Delete user's roles
      const { error: rolesError } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", userToDelete.user_id);

      if (rolesError) {
        console.error("Error deleting roles:", rolesError);
      }

      // Delete user's profile
      const { error: profileError } = await supabase
        .from("profiles")
        .delete()
        .eq("user_id", userToDelete.user_id);

      if (profileError) {
        console.error("Error deleting profile:", profileError);
        toast({
          title: "Error",
          description: "No se pudo eliminar el usuario completamente",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Usuario eliminado",
          description: `${userToDelete.email} ha sido eliminado correctamente`,
        });
        // Refresh the users list
        fetchUsers();
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      toast({
        title: "Error",
        description: "Ocurrió un error al eliminar el usuario",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    }
  };

  if (adminLoading) {
    return (
      <div className="min-h-screen bg-gradient-sky flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-sky flex flex-col items-center justify-center p-4">
        <div className="bg-card rounded-3xl p-8 text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-orange-600 dark:text-orange-400" />
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Acceso restringido
          </h2>
          <p className="text-muted-foreground mb-4">
            No tienes permisos para acceder a esta página.
          </p>
          <button
            onClick={() => navigate("/app")}
            className="px-4 py-2 rounded-2xl bg-primary text-primary-foreground font-medium"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-sky pb-8">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-6"
        >
          <button
            onClick={() => navigate("/app/perfil")}
            className="p-2 rounded-2xl bg-card hover:bg-accent transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </button>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-2xl bg-primary/20">
              <Shield className="w-6 h-6 text-primary" strokeWidth={1.5} />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-foreground">
                Panel de Administración
              </h1>
              <p className="text-sm text-muted-foreground">
                Gestión de usuarios y datos
              </p>
            </div>
          </div>
        </motion.div>

        {/* Stats Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-3xl p-6 mb-6"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-primary/10">
                <Users className="w-6 h-6 text-primary" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Usuarios registrados</p>
                <p className="text-3xl font-bold text-foreground">
                  {isLoadingUsers ? "..." : users.length}
                </p>
              </div>
            </div>
            <button
              onClick={handleExportData}
              disabled={isLoadingUsers || users.length === 0}
              className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-medium hover:bg-emerald-200 dark:hover:bg-emerald-900/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-5 h-5" strokeWidth={1.5} />
              <span>Exportar Datos</span>
            </button>
          </div>
        </motion.div>

        {/* Users Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card rounded-3xl overflow-hidden"
        >
          <div className="p-6 border-b border-border">
            <h2 className="text-lg font-semibold text-foreground">
              Lista de Usuarios
            </h2>
          </div>

          {isLoadingUsers ? (
            <div className="p-12 flex items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : users.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
              <p className="text-muted-foreground">
                No hay usuarios registrados todavía
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-6">Usuario</TableHead>
                    <TableHead>Fecha de registro</TableHead>
                    <TableHead className="text-right">Total gastos</TableHead>
                    <TableHead className="text-center pr-6">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((userData) => {
                    const isCurrentUser = userData.user_id === user?.id;
                    return (
                      <TableRow key={userData.user_id}>
                        <TableCell className="pl-6">
                          <div className="flex items-center gap-2">
                            <div>
                              <p className="font-medium text-foreground">
                                {userData.display_name || "Sin nombre"}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {userData.email}
                                {isCurrentUser && (
                                  <span className="ml-2 text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                                    Tú
                                  </span>
                                )}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="text-muted-foreground">
                            {new Date(userData.created_at).toLocaleDateString("es-ES", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}
                          </p>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="font-semibold text-foreground">
                            {userData.total_expenses.toFixed(2)}€
                          </span>
                        </TableCell>
                        <TableCell className="text-center pr-6">
                          <button
                            onClick={() => handleDeleteClick(userData)}
                            disabled={isCurrentUser}
                            className={`p-2 rounded-xl transition-colors ${
                              isCurrentUser
                                ? "text-muted-foreground/30 cursor-not-allowed"
                                : "text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30"
                            }`}
                            title={isCurrentUser ? "No puedes eliminarte a ti mismo" : "Eliminar usuario"}
                          >
                            <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                          </button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </motion.div>

        {/* Admin info */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center text-xs text-muted-foreground mt-6"
        >
          Sesión: {user?.email}
        </motion.p>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="rounded-3xl">
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-full bg-red-100 dark:bg-red-900/30">
                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" strokeWidth={1.5} />
              </div>
              <AlertDialogTitle>¿Eliminar usuario?</AlertDialogTitle>
            </div>
            <AlertDialogDescription>
              Estás a punto de eliminar a <strong>{userToDelete?.email}</strong>. 
              Esta acción eliminará todos sus datos (perfil, movimientos y roles) y no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="rounded-2xl" disabled={isDeleting}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="rounded-2xl bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Eliminando...
                </>
              ) : (
                "Sí, eliminar"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminPage;
