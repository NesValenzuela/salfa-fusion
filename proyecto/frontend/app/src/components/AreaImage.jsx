import React, { useState, useEffect } from "react";
import { ImageIcon } from "lucide-react";

const AreaImage = ({ areaId }) => {
  const [imageUrl, setImageUrl] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (areaId) {
      setLoading(true);
      fetch(`http://localhost:3000/api/area/imagen/${areaId}`)
        .then((response) => {
          if (!response.ok) {
            throw new Error("No image found");
          }
          return response.blob();
        })
        .then((blob) => {
          const url = URL.createObjectURL(blob);
          setImageUrl(url);
        })
        .catch((error) => {
          console.log("No image available for area:", areaId);
          setImageUrl(null);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [areaId]);

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-50">
        <div className="animate-pulse">
          <ImageIcon className="w-12 h-12 text-gray-300" />
        </div>
      </div>
    );
  }

  return imageUrl ? (
    <img
      src={imageUrl}
      alt="Área"
      className="w-full h-full object-cover rounded-md"
    />
  ) : (
    <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50">
      <ImageIcon className="w-12 h-12 text-gray-300 mb-2" />
      <span className="text-sm text-gray-400">Sin imagen</span>
    </div>
  );
};

export default AreaImage;
