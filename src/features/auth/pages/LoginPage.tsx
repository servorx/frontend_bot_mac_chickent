import { Eye, EyeOff, Headphones, LockKeyhole, Mail } from "lucide-react";
import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Button } from "../../../shared/components/Button";
import { AnimatedChickenImage, BrandLogo } from "../../../shared/components/BrandLogo";
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
      <section className="grid w-full max-w-6xl overflow-hidden rounded-[1.4rem] border border-orange-200 bg-white/90 shadow-[0_28px_80px_rgba(106,52,18,0.13)] lg:grid-cols-[minmax(0,1fr)_minmax(25rem,0.9fr)]">
        <div className="relative hidden min-h-[42rem] content-center overflow-hidden bg-[#fff8ea] p-10 lg:grid">
          <BrandLogo className="mx-auto" />
          <div className="mx-auto mt-8 max-w-md">
            <h2 className="text-3xl font-black leading-tight text-ember">
              Gestiona tus pedidos con facilidad y rapidez
            </h2>
            <p className="mt-5 text-lg font-semibold leading-8 text-bone">
              Administra pedidos, prepara ordenes y entrega pollo delicioso a mas clientes, mas rapido que nunca.
            </p>
          </div>
          <div className="roast-plate mt-4">
            <RoastChicken />
            <div className="roast-plate__bag">
              <AnimatedChickenImage />
              <span>
                CHICKEN
                <br />
                EXPRESS
              </span>
            </div>
            <div className="roast-plate__sauce" />
          </div>
        </div>
      <form
        className="w-full bg-white/92 p-6 sm:p-10 lg:px-14 lg:py-24"
        onSubmit={submit}
      >
        <div className="flex items-start gap-5">
          <span className="grid size-16 shrink-0 place-items-center rounded-lg bg-[#fff1d8] text-[#d87800]">
            <LockKeyhole size={30} />
          </span>
          <div>
            <h1 className="text-3xl font-black text-ember">Entrar al panel</h1>
            <p className="mt-2 max-w-sm text-base font-semibold leading-7 text-bone">
              Accede al panel de administracion para continuar
            </p>
          </div>
        </div>
        <div className="mt-10 space-y-6">
          <label className="block">
            <span className="text-sm font-black text-paper">Correo</span>
            <span className="mt-2 flex min-h-14 items-center rounded-lg border border-orange-200 bg-white px-4 focus-within:border-flame focus-within:ring-2 focus-within:ring-flame/30">
              <Mail className="mr-3 shrink-0 text-bone" size={20} />
              <input
                className="min-w-0 flex-1 bg-transparent text-base font-semibold text-paper outline-none placeholder:text-smoke"
                autoComplete="email"
                placeholder="tu@correo.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </span>
          </label>
          <label className="block">
            <span className="text-sm font-black text-paper">Contraseña</span>
            <span className="mt-2 flex min-h-14 items-center rounded-lg border border-orange-200 bg-white px-4 focus-within:border-flame focus-within:ring-2 focus-within:ring-flame/30">
              <LockKeyhole className="mr-3 shrink-0 text-bone" size={20} />
              <input
                className="min-w-0 flex-1 bg-transparent text-base font-semibold text-paper outline-none placeholder:text-smoke"
                autoComplete="current-password"
                placeholder="********"
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
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-sm font-semibold text-bone">
          <label className="inline-flex items-center gap-3">
            <input className="size-5 rounded border-orange-200 text-ember focus:ring-flame" type="checkbox" />
            Recordarme
          </label>
          <button className="font-bold text-ember" type="button">¿Olvidaste tu contraseña?</button>
        </div>
        {error ? <p className="mt-4 text-sm font-bold text-ember">{error}</p> : null}
        <Button className="mt-8 w-full bg-ember py-4 text-lg text-white shadow-[0_12px_28px_rgba(201,31,20,0.2)] hover:bg-red-600" isLoading={isLoading} type="submit">
          Entrar
        </Button>
        <div className="mt-10 flex items-center gap-4 rounded-lg bg-[#fff8ec] p-5">
          <span className="grid size-12 shrink-0 place-items-center rounded-full bg-emerald-100 text-emerald-700">
            <Headphones size={24} />
          </span>
          <p className="font-semibold text-bone">
            <strong className="block text-paper">¿Necesitas ayuda?</strong>
            Contactanos al <span className="font-black text-ember">987 654 321</span>
          </p>
        </div>
      </form>
      </section>
    </main>
  );
}

function RoastChicken() {
  return (
    <svg aria-hidden="true" className="roast-plate__bird" fill="none" viewBox="0 0 420 230" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="178" cy="188" fill="#fff8ec" rx="154" ry="31" />
      <path d="M73 132c12-58 86-92 160-70 63 19 97 71 75 114-19 37-86 50-150 31-62-19-96-41-85-75Z" fill="url(#body)" />
      <path d="M214 86c37-18 77-7 91 22 13 27-1 59-34 75-33 16-75 4-91-24-16-30-2-56 34-73Z" fill="url(#body)" />
      <path d="M291 93c24-32 60-53 78-39 19 15 4 52-30 80" stroke="#8f3c13" strokeLinecap="round" strokeWidth="22" />
      <path d="M342 50c10-17 28-27 38-20 11 7 7 28-8 43" stroke="#c86b1b" strokeLinecap="round" strokeWidth="18" />
      <path d="M83 129c-30-9-54-32-47-49 8-18 45-13 76 10" stroke="#8f3c13" strokeLinecap="round" strokeWidth="22" />
      <path d="M40 77C22 69 11 52 17 41c6-11 27-9 44 4" stroke="#c86b1b" strokeLinecap="round" strokeWidth="18" />
      <path d="M114 105c42 23 90 24 143 2" stroke="#ffd36b" strokeLinecap="round" strokeWidth="12" opacity=".7" />
      <path d="M88 148c36 34 117 60 188 27" stroke="#6f250e" strokeLinecap="round" strokeWidth="8" opacity=".35" />
      <defs>
        <linearGradient id="body" x1="62" x2="326" y1="61" y2="209" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ffbf3d" />
          <stop offset=".38" stopColor="#e96f16" />
          <stop offset=".74" stopColor="#b94512" />
          <stop offset="1" stopColor="#7f2c10" />
        </linearGradient>
      </defs>
    </svg>
  );
}
