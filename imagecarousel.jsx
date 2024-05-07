// IMPORTS
import React, { useState } from "react";

// CREATE FUNCTION
export default function ImageCarousel({ images }) {
  // STATE VAIRABLES
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // JAVASCRIPT LOGIC
  const nextImage = (e) => {
    e.stopPropagation(); // Prevent event from bubbling up
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const prevImage = (e) => {
    e.stopPropagation(); // Prevent event from bubbling up
    setCurrentImageIndex(
      (prevIndex) => (prevIndex - 1 + images.length) % images.length
    );
  };

  // Dot navigation component
  const DotNavigation = () => {
    return (
      <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 transform space-x-2">
        {images.map((_, index) => (
          <span
            key={index}
            className={`block h-2 w-2 rounded-full ${
              currentImageIndex === index ? "bg-white" : "bg-gray-400"
            } cursor-pointer`}
            onClick={() => setCurrentImageIndex(index)}
          />
        ))}
      </div>
    );
  };

  if (!images || images.length === 0) {
    return <div>No images available</div>;
  }

  // HTML
  return (
    <>
      <head></head>
      <body>
        <div className="group relative h-full w-full">
          <img
            src={images[currentImageIndex]}
            alt="Listing"
            className="h-full w-full rounded-lg object-cover"
          />
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => prevImage(e)}
                className="absolute left-2 top-1/2 z-10 -translate-y-1/2 transform rounded-full bg-gray-700 p-2 pl-1 pt-0.5 text-4xl text-white opacity-0 transition-opacity hover:bg-gray-800 group-hover:opacity-80"
              >
                &#60;
              </button>
              <button
                onClick={(e) => nextImage(e)}
                className="absolute right-2 top-1/2 z-10 -translate-y-1/2 transform  rounded-full bg-gray-700 p-2 pr-1 pt-0.5 text-4xl text-white opacity-0 transition-opacity hover:bg-gray-800 group-hover:opacity-80"
              >
                &#62;
              </button>
              <DotNavigation />
            </>
          )}
        </div>
      </body>
    </>
  );
}
