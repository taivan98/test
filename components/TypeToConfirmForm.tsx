"use client";

import { useState } from "react";

export function TypeToConfirmForm({
  action,
  confirmText,
  hiddenFields,
  buttonClassName,
  children,
}: {
  action: string;
  confirmText: string;
  hiddenFields: Record<string, string>;
  buttonClassName: string;
  children: React.ReactNode;
}) {
  const [value, setValue] = useState("");
  const enabled = value.trim() === confirmText;

  return (
    <form action={action} method="POST">
      {Object.entries(hiddenFields).map(([name, val]) => (
        <input key={name} type="hidden" name={name} value={val} />
      ))}
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={confirmText}
        autoComplete="off"
        className="w-full rounded-lg border border-bad px-3 py-2 text-sm mb-3 bg-paper font-mono"
      />
      <button type="submit" disabled={!enabled} className={buttonClassName}>
        {children}
      </button>
    </form>
  );
}
