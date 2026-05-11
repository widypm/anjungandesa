"use client";
import React from "react";
import Flmngr from "@flmngr/flmngr-react";
import { FiImage } from "react-icons/fi";
import ButtonUi from "./ButtonUi";

// Fungsi untuk ambil base64 dari URL (Flmngr)
async function getBase64FromUrl(url: string): Promise<string> {
  const response = await fetch(url);
  const blob = await response.blob();

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(blob); // convert ke base64
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
  });
}

type Props = {
  value?: { url: string; base64?: string };
  name: string;
  onChange: (name: string, value: { url: string; base64?: string }) => void;
};

const UploadFlmngr: React.FC<Props> = ({ value, name, onChange }) => {
  const handlePick = async () => {
    Flmngr.open({
      apiKey: "FLMNFLMN", // Default free key
      urlFileManager: process.env.NEXT_PUBLIC_FLMANAGER_URI ?? "",
      urlFiles:
        process.env.NEXT_PUBLIC_FLMANAGER_FILE ?? "/" + "uploads/FileManager",
      isMultiple: false,
      acceptExtensions: ["jpg", "jpeg", "png", "webp", "gif"],
      onFinish: async (files) => {
        const file = files[0];
        const base64 = await getBase64FromUrl(file.url);

        onChange(name, {
          url: file.url,
        });
      },
    });
  };

  return (
    <div className="space-y-2">
      <ButtonUi
        variant="bluebtn"
        onClick={async () => {
          handlePick();
          await new Promise((resolve) => setTimeout(resolve, 1500)); // simulasi API
        }}
        icon={<FiImage />}
      >
        Pilih Gambar
      </ButtonUi>

      {value?.url && (
        <div className="mt-2">
          <img
            src={value.url}
            alt="Preview"
            className="max-w-xs max-h-48 rounded shadow"
          />
        </div>
      )}
    </div>
  );
};

export default UploadFlmngr;
