import { useEffect, useState } from "react";

interface UploadInputProps {
  label: string;
  maxSizeMB?: number;
  initialPreview?: string; // <<--- tambahan
  onFileReady?: (fileBase64: string) => void;
}

export default function UploadInput({
  label,
  maxSizeMB = 2,
  initialPreview,
  onFileReady,
}: UploadInputProps) {
  const [error, setError] = useState("");
  const [preview, setPreview] = useState<string | null>(initialPreview || null);
  const [progress, setProgress] = useState<number>(0);

  // Update preview ketika initialPreview berubah (misal ketika kembali ke halaman)
  useEffect(() => {
    if (initialPreview) {
      setPreview(initialPreview);
    }
  }, [initialPreview]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setError("");

    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setError("Format harus JPG, PNG, atau WEBP.");
      return;
    }

    const maxBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxBytes) {
      setError(`Ukuran maksimal ${maxSizeMB}MB`);
      return;
    }

    // preview dari browser
    setPreview(URL.createObjectURL(file));

    const reader = new FileReader();

    reader.onprogress = (ev) => {
      if (ev.lengthComputable) {
        const percent = Math.round((ev.loaded / ev.total) * 100);
        setProgress(percent);
      }
    };

    reader.onloadend = () => {
      setProgress(100);
      onFileReady?.(reader.result as string);
    };

    reader.readAsDataURL(file);
  };

  return (
    <div className="bg-white shadow-sm rounded-xl p-4 border border-gray-200">
      <p className="text-sm font-semibold text-gray-700 mb-2">{label}</p>

      <div className="flex items-center space-x-4">
        {/* Preview */}
        <div className="h-20 w-20 border rounded-lg bg-gray-50 flex items-center justify-center overflow-hidden">
          {preview ? (
            <img
              src={preview}
              alt="preview"
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-gray-400 text-xs">No Image</span>
          )}
        </div>

        {/* Input */}
        <div className="flex flex-col flex-1">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="text-sm"
          />

          {/* Progress */}
          {progress > 0 && (
            <div className="w-full bg-gray-200 h-2 rounded mt-2">
              <div
                className="bg-blue-500 h-2 rounded transition-all"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          )}

          {/* Error */}
          {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        </div>
      </div>
    </div>
  );
}
