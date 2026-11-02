export type FieldErrors<TValues> = Partial<Record<keyof TValues, string>>;

export type Rule<TValues> = (value: string, values: TValues) => string | null;

export type ValidationSchema<TValues> = {
  [TField in keyof TValues]?: ReadonlyArray<Rule<TValues>>;
};

export function required<TValues>(message: string): Rule<TValues> {
  return (value) => (value.trim() === "" ? message : null);
}

export function isEmail<TValues>(message: string): Rule<TValues> {
  return (value) => (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()) ? null : message);
}

export function minLength<TValues>(length: number, message: string): Rule<TValues> {
  return (value) => (value.trim().length >= length ? null : message);
}

export function matchesField<TValues>(field: keyof TValues, message: string): Rule<TValues> {
  return (value, values) => (value === values[field] ? null : message);
}

export function validate<TValues>(schema: ValidationSchema<TValues>, values: TValues): FieldErrors<TValues> {
  const errors: FieldErrors<TValues> = {};
  for (const field of Object.keys(schema) as Array<keyof TValues>) {
    const rules = schema[field] ?? [];
    for (const rule of rules) {
      const message = rule(String(values[field]), values);
      if (message) {
        errors[field] = message;
        break;
      }
    }
  }
  return errors;
}
