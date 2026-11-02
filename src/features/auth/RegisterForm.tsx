"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { InputPassword } from "@/components/ui/InputPassword";
import { InputText } from "@/components/ui/InputText";
import { useAuth } from "@/hooks/useAuth";
import { useForm } from "@/hooks/useForm";
import { isEmail, matchesField, minLength, required, type ValidationSchema } from "@/lib/validation";

interface RegisterValues extends Record<string, string> {
  name: string;
  email: string;
  password: string;
  confirmation: string;
}

const SCHEMA: ValidationSchema<RegisterValues> = {
  name: [required("Escribe tu nombre."), minLength(2, "Tu nombre debe tener al menos 2 letras.")],
  email: [required("Escribe tu correo."), isEmail("Escribe un correo válido, como ana@correo.com.")],
  password: [required("Crea una contraseña."), minLength(8, "Usa al menos 8 caracteres.")],
  confirmation: [required("Repite la contraseña."), matchesField("password", "Las contraseñas no coinciden.")],
};

export function RegisterForm() {
  const { register } = useAuth();
  const router = useRouter();
  const { field, handleSubmit, isSubmitting, formError } = useForm<RegisterValues>(
    SCHEMA,
    { name: "", email: "", password: "", confirmation: "" },
    async ({ name, email, password }) => {
      const outcome = await register({ name: name.trim(), email: email.trim(), password });
      if (outcome === "needs-login") router.push("/login?registered=1");
    },
  );

  return (
    <form onSubmit={handleSubmit} noValidate className="stack">
      <h1 className="page-title">Crea tu cuenta</h1>
      {formError && <Alert tone="danger">{formError}</Alert>}
      <InputText label="Nombre" autoComplete="name" {...field("name")} />
      <InputText label="Correo" type="email" autoComplete="email" {...field("email")} />
      <InputPassword label="Contraseña" autoComplete="new-password" hint="Mínimo 8 caracteres." {...field("password")} />
      <InputPassword label="Repite la contraseña" autoComplete="new-password" {...field("confirmation")} />
      <Button type="submit" size="lg" fullWidth isLoading={isSubmitting}>
        Crear cuenta
      </Button>
      <p className="auth__switch">
        ¿Ya tienes cuenta? <Link href="/login">Inicia sesión</Link>
      </p>
    </form>
  );
}
