"use client";

export default function DeleteButton({
  action,
  id,
  label = "Supprimer",
  confirm = "Confirmer la suppression ?",
}: {
  action: (formData: FormData) => void;
  id: string;
  label?: string;
  confirm?: string;
}) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!window.confirm(confirm)) e.preventDefault();
      }}
      className="inline"
    >
      <input type="hidden" name="id" value={id} />
      <button className="text-xs font-medium text-red-500 hover:text-red-700">{label}</button>
    </form>
  );
}
