"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { InputPassword } from "@/components/ui/InputPassword";
import { InputText } from "@/components/ui/InputText";
import { useAuth } from "@/hooks/useAuth";
import { useForm } from "@/hooks/useForm";
import { isEmail, required, type ValidationSchema } from "@/lib/validation";
import type { LoginCredentials } from "@/types/auth";

type LoginValues = LoginCredentials & Record<string, string>;

const SCHEMA: ValidationSchema<LoginValues> = {
  email: [required("Escribe tu correo."), isEmail("Escribe un correo válido, como ana@correo.com.")],
  password: [required("Escribe tu contraseña.")],
};

export function LoginForm() {
  const { login } = useAuth();
  const params = useSearchParams();
  const { field, handleSubmit, isSubmitting, formError } = useForm<LoginValues>(
    SCHEMA,
    { email: "", password: "" },
    ({ email, password }) => login({ email: email.trim(), password }),
  );

  return (
    <form onSubmit={handleSubmit} noValidate className="stack">
      <h1 className="page-title">Inicia sesión</h1>
      {params.get("registered") && <Alert tone="success">Cuenta creada. Inicia sesión para continuar.</Alert>}
      {params.get("expired") && <Alert tone="danger">Tu sesión expiró. Inicia sesión de nuevo.</Alert>}
      {formError && <Alert tone="danger">{formError}</Alert>}
      <InputText label="Correo" type="email" autoComplete="email" {...field("email")} />
      <InputPassword label="Contraseña" autoComplete="current-password" {...field("password")} />
      <Button type="submit" size="lg" fullWidth isLoading={isSubmitting}>
        Iniciar sesión
      </Button>
      <p className="auth__switch">
        ¿No tienes cuenta? <Link href="/register">Crea una</Link>
      </p>
    </form>
  );
}
