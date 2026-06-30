"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function MediaUploader() {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);

  async function onFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files?.length) return;
    setUploading(true);
    for (const file of Array.from(files)) {
      const fd = new FormData();
      fd.append("file", file);
      await fetch("/api/upload", { method: "POST", body: fd });
    }
    setUploading(false);
    router.refresh();
  }

  return (
    <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-white p-8 text-center hover:border-brand">
      <span className="text-3xl">⬆</span>
      <span className="mt-2 text-sm font-semibold text-brand">
        {uploading ? "Téléversement…" : "Téléverser des fichiers"}
      </span>
      <span className="mt-1 text-xs text-gray-400">Images, PDF, logos, documents</span>
      <input
        type="file"
        multiple
        accept="image/*,application/pdf,.doc,.docx"
        onChange={onFiles}
        className="hidden"
      />
    </label>
  );
}
