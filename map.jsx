// IMPORTS
import React, { useState, useEffect } from "react";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import { functions } from "../firebase-config"; // Adjust the path as needed
import { httpsCallable } from "firebase/functions";

// CREATE FUNCTION
export default function MapWithMarker({ eircode }) {
  // STATE VAIRABLES
  const [location, setLocation] = useState(null);
  const [marker, setMarker] = useState(null); // Separate state for marker
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: "AIzaSyDP017pgtfwjDh5wg-QgtRWT-plC346bU4", // Replace with your actual API key
  });

  // JAVASCRIPT LOGIC
  useEffect(() => {
    const fetchCoordinates = async () => {
      if (!eircode) return;
      const getCoordinates = httpsCallable(
        functions,
        "getCoordinatesFromEircode"
      );
      try {
        const response = await getCoordinates({ eircode });
        if (response.data) {
          const coords = { lat: response.data.lat, lng: response.data.lng };
          setLocation(coords);
          setMarker(coords); // Set marker
        }
      } catch (error) {
        console.error("Error fetching coordinates:", error);
        setLocation(null);
        setMarker(null); // Clear marker on error
      }
    };
    fetchCoordinates();
  }, [eircode]);

  if (loadError) {
    return <div>Error loading maps</div>;
  }

  if (!isLoaded) {
    return <div>Loading map...</div>;
  }

  // HTML
  return (
    <>
      <head></head>
      <body>
        <GoogleMap
          mapContainerStyle={{
            width: "90%",
            height: "100%",
            borderRadius: "10px",
            border: "2px solid #ccc",
          }}
          center={location}
          zoom={15}
          key={eircode} // Key to force re-render
        >
          {marker && <Marker position={marker} />}
        </GoogleMap>
      </body>
    </>
  );
}
