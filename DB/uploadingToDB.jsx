// IMPORTS
import { useState, useEffect } from "react";
import { db } from "../firebase-config";
import { collection, addDoc } from "firebase/firestore";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";

// CREATE FUNCTION
export default function ExampleRoute() {
  // STATE VARIABLES
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    url: "",
  });

  // JAVASCRIPT LOGIC
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitLoading(true);
    try {
      const docRef = await addDoc(collection(db, "appList"), {
        ...formData,
      });
      setIsSubmitLoading(false);
      closeModal();
      window.location.reload(); 
      console.log("Document written with ID: ", docRef.id);
    } catch (error) {
      console.error("Error adding document: ", error);
    }
  };

  // HTML
  return (
    <>
      <head></head>
      <body>
        <div className="m-8 my-4 md:my-8 md:mt-4">
          <form onSubmit={handleSubmit}>
            <div>
              <div className="space-y-4 md:px-4">
                <div className="">
                  <div className="items-left flex flex-col">
                    <p className="text-sm font-semibold text-gray-700">Name</p>
                    <input
                      required
                      className="px-3 py-2 border bg-white border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full"
                      type="text"
                      name="name"
                      placeholder="Name"
                      value={formData.name}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div className="">
                  <div className="items-left flex flex-col">
                    <p className="text-sm font-semibold text-gray-700">URL</p>
                    <input
                      required
                      className="px-3 py-2 border bg-white border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full"
                      type="text"
                      name="url"
                      placeholder="URL"
                      value={formData.url}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end mt-4">
                <button
                  type="submit"
                  className="rounded bg-purple-500 px-4 py-2 text-white hover:bg-purple-600"
                  disabled={isSubmitLoading} // Disable button when loading
                >
                  {isSubmitLoading ? (
                    <>
                      <FontAwesomeIcon
                        icon={faSpinner}
                        className="mr-2 animate-spin"
                      />{" "}
                      Adding Stack App...
                    </>
                  ) : (
                    "Add Stack App"
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </body>
    </>
  );
}
