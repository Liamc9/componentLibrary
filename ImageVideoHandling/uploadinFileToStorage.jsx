// IMPORTS
import { useState, useEffect } from "react";
import { storage, db } from "../firebase-config";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, setDoc } from "firebase/firestore";

// CREATE FUNCTION (UPLOADS A SINGLE FILE)
export default function Addrecipe() {
  // STATE VARIABLES
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);

  // JAVASCRIPT LOGIC
  const onFileChange = (e) => {
    setFile(e.target.files[0]);
    setMessage(""); // Clear previous messages
  };

  const uploadFileAndGetURL = async (file) => {
    const fileRef = ref(storage, `uploads/${file.name}`);
    await uploadBytes(fileRef, file);
    return getDownloadURL(fileRef);
  };

  const saveFileToFirestore = async (file) => {
    const url = await uploadFileAndGetURL(file);
    const fileDoc = doc(db, "files", file.name); // Assuming 'files' is your collection
    await setDoc(fileDoc, { url, name: file.name, uploadedAt: new Date() });
    return url;
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage("Please select a file first.");
      return;
    }
    setUploading(true);
    try {
      await saveFileToFirestore(file);
      setMessage("File uploaded successfully and URL stored in Firestore.");
    } catch (error) {
      console.error("Error uploading file:", error);
      setMessage("Error uploading file. Please try again.");
    }
    setUploading(false);
  };

  // HTML
  return (
    <>
      <head></head>
      <body>
        <div className="mt-20">
          This is where you post a recipe For the steps do them as videos that
          are max 10-20 seconds long For the writing on the steps maybe there's
          like a popout button that slides the wording out from the side of each
          video ingredients have nice icons beside them Have the recipe home
          page containing the overview video and the ingredients
        </div>
        <div className="p-4">
          <input type="file" onChange={onFileChange} className="mb-2" />
          <button
            onClick={handleUpload}
            disabled={uploading}
            className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:bg-gray-300"
          >
            {uploading ? "Uploading..." : "Upload"}
          </button>
          {message && <p className="mt-2">{message}</p>}
        </div>
      </body>
    </>
  );
}
