"use client";

import { useState } from "react";
import { GetDecrypt } from "../../lib/helper";
import React from "react";
import dynamic from "next/dynamic";
const ReactJson = dynamic(() => import("@microlink/react-json-view"), {
  ssr: false, // Hanya render di client
});
export default function DecryptPage() {
  const [encryptedText, setEncryptedText] = useState("");
  const [decryptedObject, setDecryptedObject] = useState<object | null>(null);
  const [decryptedRaw, setDecryptedRaw] = useState<string>("");

  const handleDecrypt = () => {
    try {
      const raw = GetDecrypt(encryptedText);
      const parsed = JSON.parse(raw);
      setDecryptedObject(parsed);
      setDecryptedRaw(JSON.stringify(parsed, null, 2));
    } catch (error) {
      setDecryptedObject(null);
      setDecryptedRaw("⚠️ Gagal mendekripsi atau format JSON salah.");
    }
  };

  return (
    <div className=" mx-auto p-2 space-y-2 w-full">
      <h1 className="text-2xl font-bold">🔐 Decrypt AES to JSON</h1>
      <div className="grid grid-cols-12 w-full bg-white gap-4 p-4">
        <div className="col-span-5">
          <textarea
            value={encryptedText}
            onChange={(e) => setEncryptedText(e.target.value)}
            placeholder="Paste encrypted text here..."
            className="w-full h-40 p-2 border rounded font-mono text-sm"
          />

          <button
            onClick={handleDecrypt}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Decrypt
          </button>
        </div>
        <div className="col-span-7 border p-2">
          {decryptedObject && (
            <React.Fragment>
              <ReactJson
                src={decryptedObject}
                collapsed={1}
                enableClipboard={false}
                displayDataTypes={false}
              />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(
                    JSON.stringify(decryptedObject, null, 2)
                  );
                }}
                className="text-sm text-blue-600 hover:underline"
              >
                Copy All
              </button>
            </React.Fragment>
          )}
        </div>
      </div>
    </div>
  );
}
