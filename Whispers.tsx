import { motion } from "framer-motion";
import { Sparkles, Calendar, TrendingUp } from "lucide-react";

interface Whisper {
  id: string;
  icon: React.ElementType;
  message: string;
  type: "info" | "positive" | "reminder";
}

const whispers: Whisper[] = [
  {
    id: "1",
    icon: Calendar,
    message: "Recuerda: el seguro llega en 10 días, ya lo tenemos previsto",
    type: "reminder",
  },
  {
    id: "2",
    icon: TrendingUp,
    message: "Vas por buen camino este mes, sigue así",
    type: "positive",
  },
  {
    id: "3",
    icon: Sparkles,
    message: "Has gastado menos en ocio que el mes pasado",
    type: "info",
  },
];

const typeStyles = {
  info: "bg-sky-soft border-sky/20",
  positive: "bg-mint-soft border-primary/20",
  reminder: "bg-accent border-sage/30",
};

export const Whispers = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="space-y-4"
    >
      <h2 className="text-lg font-medium text-foreground px-1">Susurros</h2>
      
      <div className="space-y-3">
        {whispers.map((whisper, index) => {
          const Icon = whisper.icon;
          return (
            <motion.div
              key={whisper.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              className={`flex items-start gap-4 p-4 rounded-2xl border ${typeStyles[whisper.type]}`}
            >
              <div className="p-2 rounded-xl bg-card/50">
                <Icon className="w-5 h-5 text-muted-foreground" strokeWidth={1.5} />
              </div>
              <p className="text-sm text-foreground/80 leading-relaxed pt-1">
                {whisper.message}
              </p>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default Whispers;
