"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { validate, type ValidationSchema } from "@/lib/validation";
import { ApiError } from "@/services/api-error";

export function useForm<TValues extends Record<string, string>>(
  schema: ValidationSchema<TValues>,
  initialValues: TValues,
  onValid: (values: TValues) => Promise<void>,
) {
  const [values, setValues] = useState(initialValues);
  const [touched, setTouched] = useState<Partial<Record<keyof TValues, boolean>>>({});
  const [isSubmitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const errors = validate(schema, values);

  const field = <TName extends keyof TValues & string>(name: TName) => ({
    name,
    value: values[name],
    error: touched[name] ? errors[name] : undefined,
    onChange: (event: ChangeEvent<HTMLInputElement>) => {
      const { value } = event.target;
      setValues((current) => ({ ...current, [name]: value }));
    },
    onBlur: () => setTouched((current) => ({ ...current, [name]: true })),
  });

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);
    setTouched(Object.fromEntries(Object.keys(values).map((key) => [key, true])) as typeof touched);

    if (Object.keys(errors).length > 0) return;

    setSubmitting(true);
    try {
      await onValid(values);
    } catch (error) {
      setFormError(error instanceof ApiError ? error.message : "Ocurrió un error inesperado. Inténtalo de nuevo.");
    } finally {
      setSubmitting(false);
    }
  };

  return { field, handleSubmit, isSubmitting, formError };
}
