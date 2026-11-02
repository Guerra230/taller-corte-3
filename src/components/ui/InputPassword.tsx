"use client";

import { useState } from "react";
import { InputText, type InputTextProps } from "@/components/ui/InputText";

export type InputPasswordProps = Omit<InputTextProps, "type" | "trailing">;

export function InputPassword(props: InputPasswordProps) {
  const [isVisible, setVisible] = useState(false);

  return (
    <InputText
      {...props}
      type={isVisible ? "text" : "password"}
      trailing={
        <button
          type="button"
          className="field__toggle"
          aria-pressed={isVisible}
          onClick={() => setVisible((current) => !current)}
        >
          {isVisible ? "Ocultar" : "Mostrar"}
        </button>
      }
    />
  );
}
