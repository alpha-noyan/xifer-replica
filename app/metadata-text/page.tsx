"use client";

import { useState } from "react";
import { writeImageMetadata } from "@/utils/writeImageMetadata";
import { readAllMetadata } from "@/utils/readAllMetadata";

export default function MetadataTestPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [downloadUrl, setDownloadUrl] = useState("");
  const [verification, setVerification] = useState("");

  
const testMetadataWriting = async () => {
  if (!file) {
    setMessage("Please select an image first.");
    return;
  }

  setLoading(true);
  setMessage("");
  setVerification("");

  try {
    // Write test GPS coordinates into a new image file.
    const modifiedFile = await writeImageMetadata(file, {
  "EXIF:Artist": "Hammad Baseer",
  "XMP:Title": "XiferStudio Test",
});

    // Read all metadata from the modified image.
    const allMetadata = await readAllMetadata(modifiedFile);

    setVerification(
      JSON.stringify(allMetadata, null, 2)
    );

    // Create download URL.
    const url = URL.createObjectURL(modifiedFile);

    setDownloadUrl((previous) => {
      if (previous) URL.revokeObjectURL(previous);
      return url;
    });

    setMessage("Metadata written and verification completed!");
  } catch (error) {
    console.error(error);

    setMessage(
      error instanceof Error
        ? error.message
        : "Something went wrong."
    );
  } finally {
    setLoading(false);
  }
};


  return (
    <main className="min-h-screen bg-[#0b0d12] p-8 text-white">
      <div className="mx-auto max-w-2xl space-y-6">
        <h1 className="text-2xl font-bold">Metadata Writing Test</h1>

        <p className="text-sm text-gray-400">
          Select a JPEG image to test writing GPS coordinates and reading them
          back.
        </p>

        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
          onChange={(event) => {
            setFile(event.target.files?.[0] ?? null);
            setMessage("");
            setVerification("");

            if (downloadUrl) {
              URL.revokeObjectURL(downloadUrl);
              setDownloadUrl("");
            }
          }}
          className="block w-full text-sm"
        />

        {file && <p className="text-sm text-gray-400">Selected: {file.name}</p>}

        <button
          onClick={testMetadataWriting}
          disabled={!file || loading}
          className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-medium hover:bg-blue-500 disabled:opacity-50"
        >
          {loading ? "Testing..." : "Write and Verify GPS"}
        </button>

        {message && <p className="text-sm text-gray-200">{message}</p>}

        {verification && (
          <div className="space-y-3">
            <h2 className="font-semibold">Verification Results</h2>

            <pre className="overflow-auto rounded-lg bg-[#151923] p-4 text-xs text-green-300">
              {verification}
            </pre>
          </div>
        )}

        {downloadUrl && file && (
          <a
            href={downloadUrl}
            download={`edited-${file.name}`}
            className="inline-block rounded-lg bg-green-600 px-5 py-3 text-sm font-medium hover:bg-green-500"
          >
            Download Modified Image
          </a>
        )}
      </div>
    </main>
  );
}
