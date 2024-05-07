// IMPORTS
import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faX } from "@fortawesome/free-solid-svg-icons";

// CREATE FUNCTION
export default function Modal({ isModalOpen, closeModal }) {
  // STATE VARIABLES
  const [state, setState] = useState('');

  // JAVASCRIPT LOGIC
  useEffect(() => {
    // Lock body scroll when modal is open
    if (isModalOpen) {
      document.body.style.overflow = "hidden";
    }
    // Re-enable body scroll when modal is closed
    return () => {
      document.body.style.overflow = "";
    };
  }, [isModalOpen]); // Dependency array ensures effect runs only when `isModalOpen` changes

  if (!isModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className={`rounded-lg bg-white shadow-lg ${height} ${width}`}> {/* CHANGE THE HEIGHT AND WIDTH OF MODAL HERE */}
        <div className="relative">
          <button
            onClick={closeModal}
            className="absolute right-4 top-0 text-lg text-gray-500"
          >
            <FontAwesomeIcon icon={faX} />
          </button>
          <div className="m-8 my-4 md:my-8 md:mt-4">
            <div> {/* INSERT CONTENT HERE */}
              <p>
                You must complete your profile to add a listing or request a
                stay
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


{/*
HOW TO CALL THE MODAL

import SuccessModal from "../components/modals/requestsentmodal";

const [isSuccessModalOpen, setSuccessModalOpen] = useState(false); // State to manage success message visibility

 setSuccessModalOpen(true); //put his inside a click button function to open the modal

// put this at the end of the html
<SuccessModal isModalOpen={isSuccessModalOpen} closeModal={() => setSuccessModalOpen(false)} />



*/} 