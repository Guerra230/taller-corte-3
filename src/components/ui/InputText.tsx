"use client";

import { useId, type InputHTMLAttributes, type ReactNode } from "react";
import { cx } from "@/lib/cx";

export interface InputTextProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
  trailing?: ReactNode;
}

export function InputText({ label, error, hint, trailing, id, className, ...rest }: InputTextProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const messageId = `${inputId}-message`;
  const message = error ?? hint;

  return (
    <div className={cx("field", Boolean(error) && "field--invalid", className)}>
      <label className="field__label" htmlFor={inputId}>
        {label}
      </label>
      <div className="field__control">
        <input
          id={inputId}
          className="field__input"
          aria-invalid={Boolean(error)}
          aria-describedby={message ? messageId : undefined}
          {...rest}
        />
        {trailing}
      </div>
      {message && (
        <p id={messageId} className="field__message" role={error ? "alert" : undefined}>
          {message}
        </p>
      )}
    </div>
  );
}
