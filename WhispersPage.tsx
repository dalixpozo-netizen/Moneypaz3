import { motion } from "framer-motion";
import { Bell, Calendar, TrendingUp, Sparkles, AlertCircle } from "lucide-react";

const notifications = [
  {
    id: 1,
    icon: Calendar,
    title: "Recordatorio amable",
    message: "El seguro del coche se renueva en 10 días. Ya está previsto en tu presupuesto.",
    time: "Hoy",
    type: "reminder",
  },
  {
    id: 2,
    icon: TrendingUp,
    title: "Vas muy bien",
    message: "Has gastado un 15% menos que la media del mes pasado. ¡Sigue así!",
    time: "Ayer",
    type: "positive",
  },
  {
    id: 3,
    icon: Sparkles,
    title: "Pequeño logro",
    message: "Llevas 7 días sin gastos en la categoría de ocio. Tu bolsillo te lo agradece.",
    time: "Hace 2 días",
    type: "achievement",
  },
  {
    id: 4,
    icon: AlertCircle,
    title: "Nota suave",
    message: "Los gastos en comida van un poco por encima este mes. Nada grave, solo para que lo sepas.",
    time: "Hace 3 días",
    type: "info",
  },
];

const typeStyles = {
  reminder: "bg-accent",
  positive: "bg-mint-soft",
  achievement: "bg-sky-soft",
  info: "bg-muted",
};

const WhispersPage = () => {
  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-semibold text-foreground mb-2">
          Susurros
        </h1>
        <p className="text-muted-foreground">
          Pequeños avisos para mantener la calma
        </p>
      </motion.div>

      <div className="space-y-4">
        {notifications.map((notif, index) => {
          const Icon = notif.icon;
          return (
            <motion.div
              key={notif.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-5 rounded-3xl ${typeStyles[notif.type as keyof typeof typeStyles]}`}
            >
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-2xl bg-card/60">
                  <Icon className="w-5 h-5 text-foreground/70" strokeWidth={1.5} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-foreground">{notif.title}</h3>
                    <span className="text-xs text-muted-foreground">{notif.time}</span>
                  </div>
                  <p className="text-sm text-foreground/80 leading-relaxed">
                    {notif.message}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Empty state hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center py-8"
      >
        <Bell className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" strokeWidth={1} />
        <p className="text-sm text-muted-foreground">
          Solo te avisaremos cuando sea importante
        </p>
      </motion.div>
    </div>
  );
};

export default WhispersPage;
