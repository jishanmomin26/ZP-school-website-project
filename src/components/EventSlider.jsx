import { useEffect, useState } from "react";
import { db } from "../Firebase/config";
import { doc, onSnapshot } from "firebase/firestore";

export default function EventSlider() {
  const [images, setImages] = useState([]);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!db) return; // Firebase not configured
    const unsubscribe = onSnapshot(
      doc(db, "currentEvents", "latest"),
      (snapshot) => {
        if (snapshot.exists()) {
          setImages(snapshot.data().images || []);
          setCurrent(0);
        }
      },
      (error) => {
        console.warn("EventSlider: Firestore error", error.message);
      }
    );

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (images.length === 0) return;

    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [images]);

  if (images.length === 0) {
    return (
      <div className="w-full h-[350px] bg-gray-200 rounded-xl flex items-center justify-center">
        No Event Photos Available
      </div>
    );
  }

  return (
    <div className="relative w-full h-[350px] overflow-hidden rounded-2xl shadow-lg">
      {images.map((image, index) => (
        <img
          key={image.public_id}
          src={image.url}
          alt="Event"
          className={`absolute w-full h-full object-cover transition-opacity duration-700 ${
            index === current ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {images.map((_, index) => (
          <div
            key={index}
            className={`w-3 h-3 rounded-full ${
              index === current ? "bg-white" : "bg-gray-400"
            }`}
          />
        ))}
      </div>
    </div>
  );
}