import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HelpCircle, Send, BookOpen, MessageCircle, Phone, Mail, Lightbulb, Heart, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { toast } from "sonner";

interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
}

const quickGuide = [
  {
    icon: "💰",
    title: "Registrar un gasto",
    description: "Pulsa el botón '+' central, elige categoría, escribe el nombre (ej: Mercadona) y el importe.",
  },
  {
    icon: "🔄",
    title: "Gasto Recurrente",
    description: "Activa el interruptor 'Gasto recurrente' para facturas fijas como Netflix o el seguro. La app vigilará si suben de precio.",
  },
  {
    icon: "📊",
    title: "Ver tu resumen",
    description: "En la pestaña 'Gastos' encontrarás el historial completo y el resumen de gastos fijos del mes.",
  },
];

const predefinedResponses: Record<string, string> = {
  default: "¡Hola! Estoy aquí para ayudarte. Puedes preguntarme sobre categorías, cómo registrar gastos o cualquier duda que tengas. 😊",
  categoria: "Las categorías te ayudan a organizar tus gastos. Tienes varias predefinidas (Alimentación, Movilidad, Ocio...) pero puedes crear las tuyas propias escribiendo un nombre nuevo.",
  recurrente: "Los gastos recurrentes son facturas fijas como Netflix, el seguro o la hipoteca. Al marcarlos, la app los suma en 'Gastos Fijos' y te avisa si cambia el precio.",
  ingreso: "Para añadir un ingreso, pulsa '+' y cambia a la pestaña 'Ingreso'. Puedes registrar nóminas, bizum o cualquier entrada de dinero.",
  eliminar: "Para eliminar un movimiento, ve a la pestaña 'Gastos', busca el registro y desliza o pulsa en él para eliminarlo.",
  gracias: "¡De nada! Si tienes más dudas, aquí estaré. Que tengas un día tranquilo. 🌿",
};

const findResponse = (message: string): string => {
  const lower = message.toLowerCase();
  
  if (lower.includes("categoría") || lower.includes("categoria")) {
    return predefinedResponses.categoria;
  }
  if (lower.includes("recurrente") || lower.includes("fijo") || lower.includes("factura")) {
    return predefinedResponses.recurrente;
  }
  if (lower.includes("ingreso") || lower.includes("nómina") || lower.includes("nomina")) {
    return predefinedResponses.ingreso;
  }
  if (lower.includes("eliminar") || lower.includes("borrar") || lower.includes("quitar")) {
    return predefinedResponses.eliminar;
  }
  if (lower.includes("gracias") || lower.includes("vale") || lower.includes("ok")) {
    return predefinedResponses.gracias;
  }
  
  return predefinedResponses.default;
};

// Contact configuration - easily changeable
const CONTACT_CONFIG = {
  whatsappNumber: "34600000000", // Replace with actual number
  email: "soporte@moneypaz.app", // Replace with actual email
};

interface HelpPanelProps {
  isOpen?: boolean;
  onClose?: () => void;
  showTrigger?: boolean;
}

export const HelpPanel = ({ isOpen, onClose, showTrigger = true }: HelpPanelProps) => {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { id: "welcome", text: "¡Hola! ¿En qué puedo ayudarte hoy? 😊", isUser: false },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [suggestion, setSuggestion] = useState("");
  const [suggestionSent, setSuggestionSent] = useState(false);

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      text: inputValue.trim(),
      isUser: true,
    };
    
    const botResponse: ChatMessage = {
      id: `bot-${Date.now()}`,
      text: findResponse(inputValue),
      isUser: false,
    };
    
    setChatMessages(prev => [...prev, userMessage, botResponse]);
    setInputValue("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSendSuggestion = () => {
    if (!suggestion.trim()) return;
    
    // In a real app, this would send to a backend
    console.log("Sugerencia enviada:", suggestion);
    setSuggestionSent(true);
    setSuggestion("");
    
    toast.success("¡Gracias! Tomamos nota de tu idea para seguir mejorando.", {
      icon: <Heart className="w-4 h-4 text-orange-500" />,
      duration: 4000,
    });
    
    // Reset after 5 seconds
    setTimeout(() => setSuggestionSent(false), 5000);
  };

  const openWhatsApp = () => {
    const message = encodeURIComponent("Hola, necesito ayuda con la app Moneypaz");
    window.open(`https://wa.me/${CONTACT_CONFIG.whatsappNumber}?text=${message}`, "_blank");
  };

  const openEmail = () => {
    const subject = encodeURIComponent("Consulta sobre Moneypaz App");
    const body = encodeURIComponent("Hola,\n\nTengo una consulta sobre la aplicación:\n\n");
    window.open(`mailto:${CONTACT_CONFIG.email}?subject=${subject}&body=${body}`, "_blank");
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose?.()}>
      {showTrigger && (
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="fixed top-4 right-4 z-50 bg-white/80 backdrop-blur-sm shadow-soft hover:bg-white hover:shadow-md transition-all rounded-full px-3 py-2 gap-1.5"
          >
            <HelpCircle className="w-4 h-4 text-orange-500" strokeWidth={2} />
            <span className="text-sm font-medium text-foreground/80">Ayuda</span>
          </Button>
        </SheetTrigger>
      )}
      
      <SheetContent 
        side="right" 
        className="w-full sm:max-w-md bg-gradient-to-b from-cream-warm to-white border-l border-orange-100/50 p-0 flex flex-col overflow-hidden"
      >
        <SheetHeader className="px-6 pt-6 pb-4 border-b border-orange-100/30 bg-white/50 shrink-0">
          <SheetTitle className="flex items-center gap-2 text-foreground">
            <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
              <HelpCircle className="w-4 h-4 text-orange-500" strokeWidth={2} />
            </div>
            Asistente de Moneypaz
          </SheetTitle>
        </SheetHeader>
        
        <div className="flex-1 overflow-y-auto">
          {/* Quick Guide Section */}
          <div className="p-6 border-b border-orange-100/30">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="w-4 h-4 text-orange-500" strokeWidth={2} />
              <h3 className="font-medium text-foreground">Guía Rápida</h3>
            </div>
            
            <div className="space-y-3">
              {quickGuide.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-2xl p-4 shadow-soft"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-xl">{item.icon}</span>
                    <div>
                      <h4 className="font-medium text-sm text-foreground mb-1">{item.title}</h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">{item.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
          
          {/* Chat Section */}
          <div className="p-6 border-b border-orange-100/30">
            <div className="flex items-center gap-2 mb-4">
              <MessageCircle className="w-4 h-4 text-orange-500" strokeWidth={2} />
              <h3 className="font-medium text-foreground">Consulta Directa</h3>
            </div>
            
            <div className="bg-white rounded-2xl shadow-soft overflow-hidden">
              {/* Chat Messages */}
              <div className="h-40 overflow-y-auto p-4 space-y-3">
                <AnimatePresence mode="popLayout">
                  {chatMessages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className={`flex ${msg.isUser ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[85%] px-4 py-2 rounded-2xl text-sm ${
                          msg.isUser
                            ? "bg-orange-100 text-foreground rounded-br-md"
                            : "bg-mint-light/50 text-foreground rounded-bl-md"
                        }`}
                      >
                        {msg.text}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
              
              {/* Chat Input */}
              <div className="border-t border-gray-100 p-3 flex gap-2">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Escríbeme tu duda..."
                  className="flex-1 rounded-full border-orange-100 focus:border-orange-200 text-sm"
                />
                <Button
                  size="icon"
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim()}
                  className="rounded-full bg-orange-100 hover:bg-orange-200 text-orange-600 h-10 w-10"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Human Support Section */}
          <div className="p-6 border-b border-orange-100/30">
            <div className="flex items-center gap-2 mb-3">
              <Heart className="w-4 h-4 text-orange-500" strokeWidth={2} />
              <h3 className="font-medium text-foreground">Soporte Humano</h3>
            </div>
            
            <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
              ¿Dudas? Estamos aquí para ayudarte. Nos comprometemos a responderte en un máximo de <span className="font-medium text-foreground">24 horas</span>.
            </p>
            
            <div className="flex gap-3">
              <Button
                onClick={openWhatsApp}
                variant="outline"
                className="flex-1 rounded-2xl border-green-200 bg-green-50 hover:bg-green-100 text-green-700 gap-2"
              >
                <Phone className="w-4 h-4" strokeWidth={2} />
                WhatsApp
              </Button>
              <Button
                onClick={openEmail}
                variant="outline"
                className="flex-1 rounded-2xl border-orange-200 bg-orange-50 hover:bg-orange-100 text-orange-700 gap-2"
              >
                <Mail className="w-4 h-4" strokeWidth={2} />
                Email
              </Button>
            </div>
          </div>

          {/* Suggestion Box Section */}
          <div className="p-6">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="w-4 h-4 text-orange-500" strokeWidth={2} />
              <h3 className="font-medium text-foreground">Buzón de Sugerencias</h3>
            </div>
            
            <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
              ¿Echas algo de menos? ¿Algo no funciona como te gusta? Queremos mejorar contigo. Cuéntanos tu idea aquí.
            </p>
            
            <div className="bg-white rounded-2xl shadow-soft p-4">
              <AnimatePresence mode="wait">
                {suggestionSent ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="flex flex-col items-center justify-center py-6 text-center"
                  >
                    <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-3">
                      <CheckCircle className="w-6 h-6 text-green-600" strokeWidth={2} />
                    </div>
                    <p className="text-sm font-medium text-foreground">¡Gracias!</p>
                    <p className="text-xs text-muted-foreground mt-1">Tomamos nota de tu idea para seguir mejorando.</p>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <Textarea
                      value={suggestion}
                      onChange={(e) => setSuggestion(e.target.value)}
                      placeholder="Escribe tu sugerencia o idea..."
                      className="min-h-[80px] rounded-xl border-orange-100 focus:border-orange-200 text-sm resize-none mb-3"
                      maxLength={500}
                    />
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {suggestion.length}/500
                      </span>
                      <Button
                        onClick={handleSendSuggestion}
                        disabled={!suggestion.trim()}
                        className="rounded-2xl bg-orange-500 hover:bg-orange-600 text-white gap-2 px-6"
                      >
                        <Send className="w-4 h-4" />
                        Enviar Sugerencia
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
