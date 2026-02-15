import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, MessageCircle, Mail, Send, CheckCircle2, Heart, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const CONTACT_CONFIG = {
  whatsapp: "34612345678",
  email: "soporte@moneypaz.app"
};

const ContactPage = () => {
  const { toast } = useToast();
  const [suggestion, setSuggestion] = useState("");
  const [suggestionSent, setSuggestionSent] = useState(false);

  const handleSendSuggestion = () => {
    if (suggestion.trim()) {
      setSuggestionSent(true);
      setSuggestion("");
      toast({
        description: (
          <span className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-primary" />
            ¡Gracias! Tomamos nota de tu idea.
          </span>
        ),
      });
      setTimeout(() => setSuggestionSent(false), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="p-4 border-b border-border/50">
        <div className="container mx-auto flex items-center gap-4">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-5 h-5" strokeWidth={1.5} />
            <span>Volver</span>
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
              <Wallet className="w-4 h-4 text-primary" strokeWidth={1.5} />
            </div>
            <span className="font-semibold text-foreground">Moneypaz</span>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Contacto y Soporte
          </h1>
          <p className="text-lg text-muted-foreground">
            Estamos aquí para ayudarte. Nos comprometemos a responderte en un máximo de 24 horas.
          </p>
        </motion.div>

        {/* Contact Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid sm:grid-cols-2 gap-4 mb-12"
        >
          <a
            href={`https://wa.me/${CONTACT_CONFIG.whatsapp}?text=${encodeURIComponent("Hola, necesito ayuda con la app Moneypaz")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-card rounded-3xl p-6 shadow-card hover:shadow-float transition-all flex items-center gap-4"
          >
            <div className="w-14 h-14 rounded-2xl bg-green-100 flex items-center justify-center flex-shrink-0">
              <MessageCircle className="w-7 h-7 text-green-600" strokeWidth={1.5} />
            </div>
            <div className="text-left">
              <p className="font-semibold text-foreground">WhatsApp</p>
              <p className="text-sm text-muted-foreground">Respuesta rápida</p>
            </div>
          </a>

          <a
            href={`mailto:${CONTACT_CONFIG.email}?subject=${encodeURIComponent("Consulta desde la app Moneypaz")}`}
            className="bg-card rounded-3xl p-6 shadow-card hover:shadow-float transition-all flex items-center gap-4"
          >
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Mail className="w-7 h-7 text-primary" strokeWidth={1.5} />
            </div>
            <div className="text-left">
              <p className="font-semibold text-foreground">Email</p>
              <p className="text-sm text-muted-foreground">{CONTACT_CONFIG.email}</p>
            </div>
          </a>
        </motion.div>

        {/* Suggestion Box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card rounded-3xl p-8 shadow-card"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Heart className="w-6 h-6 text-primary" strokeWidth={1.5} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">Buzón de Sugerencias</h2>
              <p className="text-sm text-muted-foreground">Queremos mejorar contigo</p>
            </div>
          </div>

          <p className="text-muted-foreground mb-6">
            ¿Echas algo de menos? ¿Algo no funciona como te gusta? Cuéntanos tu idea aquí.
          </p>

          {suggestionSent ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-accent/50 rounded-2xl p-6 text-center"
            >
              <CheckCircle2 className="w-12 h-12 text-primary mx-auto mb-3" strokeWidth={1.5} />
              <p className="font-semibold text-foreground">¡Gracias!</p>
              <p className="text-muted-foreground text-sm">
                Tomamos nota de tu idea para seguir mejorando.
              </p>
            </motion.div>
          ) : (
            <div className="space-y-4">
              <Textarea
                value={suggestion}
                onChange={(e) => setSuggestion(e.target.value)}
                placeholder="Escribe tu sugerencia aquí..."
                className="min-h-[120px] rounded-2xl border-border/50 bg-background resize-none"
                maxLength={500}
              />
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {suggestion.length}/500
                </span>
                <Button
                  onClick={handleSendSuggestion}
                  disabled={!suggestion.trim()}
                  className="rounded-full px-6"
                >
                  <Send className="w-4 h-4 mr-2" strokeWidth={1.5} />
                  Enviar sugerencia
                </Button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ContactPage;
