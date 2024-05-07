// IMPORTS
import React, { useState } from "react";

// CREATE FUNCTION
export default function Tooltip({ tooltipText, position = "right" }) {      // Default position to "right" unless specified otherwise
  // STATE VAIRABLES
  const [showTooltip, setShowTooltip] = useState(false);

  // JAVASCRIPT LOGIC
  // Adjust the position based on the passed prop
  if (position === "right") {
    tooltipStyle.left = "100%";
    tooltipStyle.transform = "translateX(10px)"; // Adjust as needed for spacing
  } else if (position === "left") {
    tooltipStyle.right = "100%";
    tooltipStyle.transform = "translateX(-10px)"; // Adjust as needed for spacing
  }

  // HTML
  return (
    <>
      <head></head>
      <body>
        <div
          style={{ display: "inline-block", position: "relative" }}
          className="cursor-pointer"
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          <p className="flex h-4 w-4 items-center justify-center rounded-full bg-gray-400 text-xs text-white">
            i
          </p>
          {showTooltip && (
            <div className="absolute w-[200px] -translate-y-5 bottom-full transform  mb-[5px] opacity-90 p-[5px] bg-black text-white rounded-md text-[12px] z-10">
              {tooltipText}
            </div>
          )}
        </div>
      </body>
    </>
  );
}
