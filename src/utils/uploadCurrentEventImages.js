import { db } from "../Firebase/config";
import { doc, getDoc, setDoc } from "firebase/firestore";

export const uploadCurrentEventImages = async (files) => {
    const docRef = doc(db, "currentEvents", "latest");

    const existingDoc = await getDoc(docRef);

    const newImages = [];

    for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append(
            "upload_preset",
            import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET
        );

        const response = await fetch(
            `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
            {
                method: "POST",
                body: formData,
            }
        );

        const data = await response.json();

        newImages.push({
            url: data.secure_url,
            public_id: data.public_id,
        });
    }

    await setDoc(docRef, {
        images: newImages
    });

    return true;
};