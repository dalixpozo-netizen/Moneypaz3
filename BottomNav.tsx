import { motion } from "framer-motion";
import { Home, BarChart3, Bell, Settings, Plus } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
}

const NavItem = ({ to, icon, label, isActive }: NavItemProps) => (
  <NavLink
    to={to}
    className="flex flex-col items-center gap-1 relative"
  >
    <motion.div
      className={`p-2 rounded-2xl transition-colors ${
        isActive 
          ? "text-orange-500 bg-orange-500/10" 
          : "text-gray-500 hover:text-gray-300"
      }`}
      whileTap={{ scale: 0.9 }}
    >
      {icon}
    </motion.div>
    <span className={`text-[10px] font-bold ${
      isActive ? "text-orange-500" : "text-gray-500"
    }`}>
      {label}
    </span>
  </NavLink>
);

interface AddButtonProps {
  onClick: () => void;
}

const AddButton = ({ onClick }: AddButtonProps) => (
  <motion.button
    onClick={onClick}
    className="relative -top-6 flex items-center justify-center w-16 h-16 rounded-full bg-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.4)]"
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
  >
    <Plus className="w-8 h-8 text-white" strokeWidth={2.5} />
    <motion.div
      className="absolute inset-0 rounded-full bg-orange-500"
      animate={{ scale: [1, 1.2, 1] }}
      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      style={{ opacity: 0.2, zIndex: -1 }}
    />
  </motion.button>
);

interface BottomNavProps {
  onAddClick: () => void;
}

export const BottomNav = ({ onAddClick }: BottomNavProps) => {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#141821]/95 backdrop-blur-xl border-t border-gray-800 pb-safe z-50">
      <div className="flex items-end justify-around px-4 pt-2 pb-4 max-w-md mx-auto">
        <NavItem
          to="/app"
          icon={<Home className="w-6 h-6" strokeWidth={1.5} />}
          label="Inicio"
          isActive={currentPath === "/app"}
        />
        <NavItem
          to="/app/gastos"
          icon={<BarChart3 className="w-6 h-6" strokeWidth={1.5} />}
          label="Gastos"
          isActive={currentPath === "/app/gastos"}
        />
        
        <AddButton onClick={onAddClick} />
        
        <NavItem
          to="/app/avisos"
          icon={<Bell className="w-6 h-6" strokeWidth={1.5} />}
          label="Avisos"
          isActive={currentPath === "/app/avisos"}
        />
        <NavItem
          to="/app/perfil"
          icon={<Settings className="w-6 h-6" strokeWidth={1.5} />}
          label="Perfil"
          isActive={currentPath === "/app/perfil"}
        />
      </div>
    </nav>
  );
};

export default BottomNav;