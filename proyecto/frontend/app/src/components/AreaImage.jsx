import React, { useState, useEffect } from "react";

const AreaImage = ({ areaId }) => {
  const [imageUrl, setImageUrl] = useState(null);

  useEffect(() => {
    if (areaId) {
      fetch(`http://localhost:3000/api/area/imagen/${areaId}`)
        .then((response) => response.blob())
        .then((blob) => {
          const url = URL.createObjectURL(blob);
          setImageUrl(url);
        })
        .catch((error) => console.error("Error cargando imagen:", error));
    }
  }, [areaId]);

  return imageUrl ? (
    <img
      src={imageUrl}
      alt="Área"
      className="w-full h-full object-cover rounded-md"
    />
  ) : null;
};

export default AreaImage;
