import { useState } from "react";
import { uploadCurrentEventImages } from "../../../utils/uploadCurrentEventImages";

export default function EventPhotoUpload() {
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(false);

    const handleUpload = async () => {
        if (files.length === 0) {
            alert("Please select images");
            return;
        }

        setLoading(true);

        try {
            await uploadCurrentEventImages(files);
            alert("Images uploaded successfully");
            setFiles([]);
        } catch (error) {
            console.error(error);
            alert("Upload failed");
        }

        setLoading(false);
    };

    return (
        <div className="bg-white p-4 rounded-xl shadow-md max-w-md">
            <h2 className="text-xl font-bold mb-4">Upload Event Photos</h2>

            <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => setFiles(Array.from(e.target.files))}
                className="mb-4"
            />

            <button
                onClick={handleUpload}
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg"
            >
                {loading ? "Uploading..." : "Upload Images"}
            </button>
        </div>
    );
}