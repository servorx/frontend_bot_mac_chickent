import { Eye, EyeOff } from "lucide-react";
import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Button } from "../../../shared/components/Button";
import { signIn } from "../services/auth.service";

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      await signIn(email, password);
      navigate("/dashboard", { replace: true });
    } catch {
      setError("Correo o contraseña incorrectos.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="grid min-h-dvh place-items-center px-4 py-8">
      <section className="grid w-full max-w-5xl overflow-hidden rounded-lg border border-orange-200 bg-[#37190f] shadow-[0_24px_70px_rgba(74,31,12,0.2)] lg:grid-cols-[minmax(0,1fr)_26rem]">
        <div className="hidden content-center gap-4 bg-gradient-to-br from-[#37190f] to-[#7a2619] p-8 text-[#fff4df] lg:grid">
          <p className="ops-kicker text-[#ffcf75]" translate="no">Turno activo</p>
          <h2 className="font-display text-6xl leading-[0.92] text-[#fff8e8]">
            Control de pedidos listo para cocina.
          </h2>
          <p className="max-w-xl text-base font-bold leading-7 text-[#ffe2b4]">
            Administra WhatsApp, comprobantes, preparacion y despacho desde una consola pensada para trabajar rapido.
          </p>
        </div>
      <form
        className="w-full bg-[#fff8e9] p-6"
        onSubmit={submit}
      >
        <p className="ops-kicker" translate="no">
          ASADERO MC CHICKEN EXPRESS
        </p>
        <h1 className="ops-title mt-2 text-5xl">Entrar al panel</h1>
        <div className="mt-6 space-y-4">
          <label className="block">
            <span className="text-sm font-bold text-bone">Correo</span>
            <input
              className="mt-1 min-h-11 w-full rounded-md border border-orange-200 bg-white px-3 text-sm font-semibold text-paper outline-none focus:border-flame focus:ring-2 focus:ring-flame/30"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>
          <label className="block">
            <span className="text-sm font-bold text-bone">Contraseña</span>
            <span className="mt-1 flex min-h-11 items-center rounded-md border border-orange-200 bg-white focus-within:border-flame focus-within:ring-2 focus-within:ring-flame/30">
              <input
                className="min-w-0 flex-1 bg-transparent px-3 text-sm font-semibold text-paper outline-none"
                autoComplete="current-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
              <button
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                className="flex h-11 w-11 items-center justify-center rounded-md text-bone transition-colors hover:bg-orange-50 hover:text-paper focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-flame"
                onClick={() => setShowPassword((value) => !value)}
                type="button"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </span>
          </label>
        </div>
        {error ? <p className="mt-4 text-sm font-bold text-ember">{error}</p> : null}
        <Button className="mt-6 w-full" isLoading={isLoading} type="submit">
          Entrar
        </Button>
      </form>
      </section>
    </main>
  );
}
