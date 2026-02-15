import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Sparkles, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useFinanceStore } from "@/hooks/use-finance-store";
import { HelpPanel } from "@/components/help/HelpPanel";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type Step = "welcome" | "name" | "credentials" | "balance" | "loading";

const RegisterPage = () => {
  const navigate = useNavigate();
  const { setInitialBalance, setUserName } = useFinanceStore();
  const { toast } = useToast();
  const [step, setStep] = useState<Step>("welcome");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [amount, setAmount] = useState("");
  const [showHelp, setShowHelp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleNumberClick = (num: string) => {
    if (num === "." && amount.includes(".")) return;
    if (num === "delete") {
      setAmount((prev) => prev.slice(0, -1));
      return;
    }
    if (amount.includes(".") && amount.split(".")[1]?.length >= 2) return;
    setAmount((prev) => prev + num);
  };

  const handleSignUp = async () => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin,
          data: {
            display_name: name,
          },
        },
      });

      if (error) {
        toast({
          title: "Error de registro",
          description: error.message === "User already registered" 
            ? "Este email ya está registrado" 
            : error.message,
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      if (data.user) {
        // Save display_name to profile
        await supabase
          .from("profiles")
          .update({ display_name: name })
          .eq("user_id", data.user.id);

        // Continue to balance step
        setStep("balance");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Ha ocurrido un error inesperado",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleComplete = () => {
    const balance = parseFloat(amount);
    if (balance > 0) {
      setInitialBalance(balance);
      setUserName(name);

      setStep("loading");

      setTimeout(() => {
        window.location.href = "/app";
      }, 1500);
    }
  };

  const numbers = ["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "delete"];

  if (step === "loading") {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", duration: 0.6 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-6"
          >
            <Sparkles className="w-8 h-8 text-primary" strokeWidth={1.5} />
          </motion.div>
          <motion.p className="text-xl font-medium text-foreground mb-2">Configurando tu panel de Moneypaz...</motion.p>
          <p className="text-muted-foreground">Solo un momento ✨</p>
        </motion.div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-background flex flex-col">
        <header className="p-4 flex items-center justify-between">
          <button
            onClick={() => {
              if (step === "welcome") navigate("/");
              else if (step === "name") setStep("welcome");
              else if (step === "credentials") setStep("name");
              else if (step === "balance") setStep("credentials");
            }}
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Volver</span>
          </button>
          <button
            onClick={() => setShowHelp(true)}
            className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center"
          >
            <HelpCircle className="w-5 h-5 text-muted-foreground" />
          </button>
        </header>

        <div className="flex-1 flex items-center justify-center px-4 pb-12">
          <AnimatePresence mode="wait">
            {step === "welcome" && (
              <motion.div
                key="welcome"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="w-full max-w-sm text-center"
              >
                <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center mx-auto mb-8">
                  <Sparkles className="w-10 h-10 text-primary" />
                </div>
                <h1 className="text-3xl font-bold mb-4">Bienvenido a Moneypaz</h1>
                <p className="text-lg text-muted-foreground mb-10">Tu espacio de tranquilidad financiera.</p>
                <Button onClick={() => setStep("name")} className="w-full h-14 rounded-2xl text-lg">
                  Empezar <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </motion.div>
            )}

            {step === "name" && (
              <motion.div
                key="name"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="w-full max-w-sm"
              >
                <h1 className="text-2xl font-bold mb-6 text-center">¿Cómo te llamamos?</h1>
                <Input
                  type="text"
                  placeholder="Tu nombre"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-14 rounded-2xl mb-6 text-lg"
                  autoFocus
                />
                <Button
                  onClick={() => setStep("credentials")}
                  disabled={!name.trim()}
                  className="w-full h-14 rounded-2xl text-lg"
                >
                  Continuar <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </motion.div>
            )}

            {step === "credentials" && (
              <motion.div
                key="credentials"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="w-full max-w-sm"
              >
                <h1 className="text-2xl font-bold mb-6 text-center">Acceso seguro</h1>
                <div className="space-y-4">
                  <Input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-14 rounded-2xl"
                  />
                  <Input
                    type="password"
                    placeholder="Contraseña (mínimo 6 caracteres)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-14 rounded-2xl"
                  />
                  <Button
                    onClick={handleSignUp}
                    disabled={!email || password.length < 6 || isLoading}
                    className="w-full h-14 rounded-2xl text-lg"
                  >
                    {isLoading ? "Creando cuenta..." : "Crear cuenta"} 
                    {!isLoading && <ArrowRight className="w-5 h-5 ml-2" />}
                  </Button>
                </div>
              </motion.div>
            )}

            {step === "balance" && (
              <motion.div
                key="balance"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="w-full max-w-sm"
              >
                <div className="text-center mb-6">
                  <h1 className="text-2xl font-bold mb-2">Casi listo, {name}</h1>
                  <p className="text-muted-foreground">¿Cuál es tu saldo inicial?</p>
                </div>

                <div className="bg-card rounded-3xl p-8 mb-6 text-center border">
                  <span className="text-5xl font-light">{amount || "0"}</span>
                  <span className="text-3xl font-light text-muted-foreground ml-2">€</span>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-6">
                  {numbers.map((num) => (
                    <button
                      key={num}
                      onClick={() => handleNumberClick(num)}
                      className={`h-14 rounded-2xl text-xl font-medium ${num === "delete" ? "bg-destructive/10 text-destructive" : "bg-muted/30 hover:bg-accent"}`}
                    >
                      {num === "delete" ? "←" : num}
                    </button>
                  ))}
                </div>

                <Button
                  onClick={handleComplete}
                  disabled={!amount || parseFloat(amount) <= 0}
                  className="w-full h-16 rounded-2xl text-lg shadow-lg"
                >
                  Entrar a Moneypaz <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      <HelpPanel isOpen={showHelp} onClose={() => setShowHelp(false)} showTrigger={false} />
    </>
  );
};

export default RegisterPage;
