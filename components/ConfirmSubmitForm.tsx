"use client";

export function ConfirmSubmitForm({
  action,
  confirmMessage,
  hiddenFields,
  buttonClassName,
  children,
}: {
  action: string;
  confirmMessage: string;
  hiddenFields: Record<string, string>;
  buttonClassName: string;
  children: React.ReactNode;
}) {
  return (
    <form
      action={action}
      method="POST"
      onSubmit={(e) => {
        if (!confirm(confirmMessage)) e.preventDefault();
      }}
    >
      {Object.entries(hiddenFields).map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}
      <button type="submit" className={buttonClassName}>
        {children}
      </button>
    </form>
  );
}
