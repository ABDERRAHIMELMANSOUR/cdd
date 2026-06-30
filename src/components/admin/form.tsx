"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";

export function Field({
  label,
  name,
  type = "text",
  defaultValue,
  required,
  placeholder,
  help,
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string | number | null;
  required?: boolean;
  placeholder?: string;
  help?: string;
}) {
  return (
    <label className="block">
      <span className="label">
        {label} {required && <span className="text-red-500">*</span>}
      </span>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue ?? ""}
        required={required}
        placeholder={placeholder}
        className="input"
      />
      {help && <span className="mt-1 block text-xs text-gray-400">{help}</span>}
    </label>
  );
}

export function TextArea({
  label,
  name,
  defaultValue,
  rows = 4,
  required,
  help,
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
  rows?: number;
  required?: boolean;
  help?: string;
}) {
  return (
    <label className="block">
      <span className="label">
        {label} {required && <span className="text-red-500">*</span>}
      </span>
      <textarea name={name} rows={rows} defaultValue={defaultValue ?? ""} required={required} className="input" />
      {help && <span className="mt-1 block text-xs text-gray-400">{help}</span>}
    </label>
  );
}

export function Select({
  label,
  name,
  options,
  defaultValue,
}: {
  label: string;
  name: string;
  options: { value: string; label: string }[];
  defaultValue?: string;
}) {
  return (
    <label className="block">
      <span className="label">{label}</span>
      <select name={name} defaultValue={defaultValue} className="input">
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function Toggle({ label, name, defaultChecked }: { label: string; name: string; defaultChecked?: boolean }) {
  return (
    <label className="flex items-center gap-2">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="h-4 w-4 rounded border-gray-300 text-brand" />
      <span className="text-sm font-medium text-gray-700">{label}</span>
    </label>
  );
}

/** Image field: paste a URL or upload a file to the media library. */
export function ImageField({
  label,
  name,
  defaultValue,
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
}) {
  const [url, setUrl] = useState(defaultValue ?? "");
  const [uploading, setUploading] = useState(false);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const data = await res.json();
    if (data.url) setUrl(data.url);
    setUploading(false);
  }

  return (
    <div>
      <span className="label">{label}</span>
      <div className="flex items-start gap-3">
        {url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt="" className="h-16 w-16 rounded-lg border border-gray-200 object-cover" />
        )}
        <div className="flex-1">
          <input
            name={name}
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://… ou téléversez"
            className="input"
          />
          <div className="mt-2 flex items-center gap-2">
            <label className="cursor-pointer rounded-md bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand hover:bg-brand/10">
              {uploading ? "Téléversement…" : "Téléverser un fichier"}
              <input type="file" accept="image/*" onChange={onFile} className="hidden" />
            </label>
            {url && (
              <button type="button" onClick={() => setUrl("")} className="text-xs text-gray-400 hover:text-red-500">
                Retirer
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/** Multi-line list editor stored as one item per line (name submitted as textarea). */
export function ListField({
  label,
  name,
  defaultValue,
  help = "Un élément par ligne.",
}: {
  label: string;
  name: string;
  defaultValue?: string[] | null;
  help?: string;
}) {
  return (
    <label className="block">
      <span className="label">{label}</span>
      <textarea
        name={name}
        rows={5}
        defaultValue={(defaultValue ?? []).join("\n")}
        className="input"
        placeholder={"Élément 1\nÉlément 2"}
      />
      <span className="mt-1 block text-xs text-gray-400">{help}</span>
    </label>
  );
}

export function SubmitButton({ label = "Enregistrer" }: { label?: string }) {
  const { pending } = useFormStatus();
  return (
    <button disabled={pending} className="btn-primary">
      {pending ? "Enregistrement…" : label}
    </button>
  );
}
