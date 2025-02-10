"use client";

import { useState } from "react";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [imageUrl, setImageUrl] = useState<string>("");
  const [metadataUrl, setMetadataUrl] = useState<string>("");
  const [uploading, setUploading] = useState(false);

  const uploadFile = async () => {
    if (!file || !name || !description) {
      alert("Please fill all fields");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("name", name);
    formData.append("description", description);

    try {
      const uploadRequest = await fetch("/api/files", {
        method: "POST",
        body: formData,
      });

      const response = await uploadRequest.json();

      if (response.imageUrl && response.metadataUrl) {
        setImageUrl(response.imageUrl);
        setMetadataUrl(response.metadataUrl);
      } else {
        alert(response.error || "Upload failed");
      }
    } catch (error) {
      console.error(error);
      alert("Trouble uploading file");
    } finally {
      setUploading(false);
    }
  };

  return (
    <main className="w-full min-h-screen flex flex-col items-center justify-center gap-4">
      <input type="file" onChange={(e) => setFile(e.target?.files?.[0] || null)} />
      <input type="text" placeholder="NFT Name" value={name} onChange={(e) => setName(e.target.value)} className="border p-2" />
      <textarea placeholder="NFT Description" value={description} onChange={(e) => setDescription(e.target.value)} className="border p-2"></textarea>
      <button type="button" disabled={uploading} onClick={uploadFile} className="bg-blue-500 text-white p-2 rounded">
        {uploading ? "Uploading..." : "Upload"}
      </button>

      {imageUrl && (
        <div>
          <h3>Uploaded Image:</h3>
          <img src={imageUrl} alt="Uploaded NFT" className="w-64 mt-4" />
          <p>
            <a href={metadataUrl} target="_blank" rel="noopener noreferrer">
              View Metadata JSON
            </a>
          </p>
        </div>
      )}
    </main>
  );
}
