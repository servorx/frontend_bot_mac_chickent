import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

import { LoadingState } from "../../../shared/components/LoadingState";
import { getSession } from "../services/auth.service";

export function AuthGate() {
  const location = useLocation();
  const [status, setStatus] = useState<"loading" | "authenticated" | "guest">("loading");

  useEffect(() => {
    let active = true;
    getSession()
      .then((session) => {
        if (active) {
          setStatus(session?.user ? "authenticated" : "guest");
        }
      })
      .catch(() => {
        if (active) {
          setStatus("guest");
        }
      });

    return () => {
      active = false;
    };
  }, []);

  if (status === "loading") {
    return <LoadingState label="Validando sesion..." />;
  }

  if (status === "guest") {
    return <Navigate replace state={{ from: location }} to="/login" />;
  }

  return <Outlet />;
}
