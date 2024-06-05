// IMPORTS
import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMagnifyingGlass,
  faHouse,
  faEnvelope,
} from "@fortawesome/free-solid-svg-icons";
import {
  doc,
  getDoc,
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db, auth } from "../firebase-config"; // Adjust this path according to your Firebase configuration file
import { useAuthState } from "react-firebase-hooks/auth";

// CREATE FUNCTION
export default function BottomTabs() {
  // STATE VARIABLES
  const [hasUnreadMessages, setHasUnreadMessages] = useState(false);
  const [hasUnreadMessagesInListings, setHasUnreadMessagesInListings] =
    useState(false);
  const [user] = useAuthState(auth); // Get the currently logged-in user
  const activeStyle = { color: "#DF5BFF", backgroundColor: "#F3F4F6" };

  // JAVASCRIPT LOGIC
  useEffect(() => {
    const checkForUnreadMessages = async () => {
      if (!user) return;

      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        const userEnquiries = userDoc.exists()
          ? userDoc.data().enquiries || []
          : [];
        // Check for unread messages in user's enquiries
        for (const enquiry of userEnquiries) {
          const messagesSnapshot = await getDocs(
            collection(
              db,
              "Listings",
              enquiry.listingId,
              "enquiries",
              enquiry.enquiryId,
              "messages"
            )
          );
          const hasUnread = messagesSnapshot.docs.some(
            (doc) => !doc.data().read && doc.data().userId !== user.uid
          );

          if (hasUnread) {
            setHasUnreadMessages(true);
            break; // No need to check further if unread message is found
          }
        }
        // Check for unread messages in user's listings
        const listingsSnapshot = await getDocs(
          query(collection(db, "Listings"), where("listerId", "==", user.uid))
        );
        for (const listingDoc of listingsSnapshot.docs) {
          const enquiriesSnapshot = await getDocs(
            collection(db, "Listings", listingDoc.id, "enquiries")
          );
          for (const enquiryDoc of enquiriesSnapshot.docs) {
            const messagesSnapshot = await getDocs(
              collection(
                db,
                "Listings",
                listingDoc.id,
                "enquiries",
                enquiryDoc.id,
                "messages"
              )
            );
            const hasUnread = messagesSnapshot.docs.some(
              (doc) => !doc.data().read && doc.data().userId !== user.uid
            );
            if (hasUnread) {
              setHasUnreadMessagesInListings(true);
              return; // Exit early if an unread message is found
            }
          }
        }
      } catch (error) {
        console.error("Error checking for unread messages:", error);
      }
    };
    checkForUnreadMessages();
  }, [user]);

  // HTML
  return (
    <>
      <head></head>
      <body>
        <div className="flex justify-center">
          <div
            className="border-1 fixed bottom-5 z-20 mx-5 w-full max-w-md rounded-lg border border-gray-500 bg-white"
            style={{ boxShadow: "0 0 10px 0 rgba(0, 0, 0, 0.5)" }}
          >
            <ul className="flex justify-between text-sm font-medium text-gray-600">
              <li className="flex-1">
                <NavLink
                  to="/search"
                  style={({ isActive }) => (isActive ? activeStyle : undefined)}
                  className="flex flex-col items-center justify-center rounded-s-lg p-2"
                >
                  <FontAwesomeIcon
                    icon={faMagnifyingGlass}
                    className="text-lg"
                  />
                  <span className="mt-1 text-xs">Browse</span>
                </NavLink>
              </li>
              <li className="flex-1">
                <NavLink
                  to="/mylistings"
                  style={({ isActive }) => (isActive ? activeStyle : undefined)}
                  className="flex flex-col items-center justify-center p-2"
                >
                  <div className="relative">
                    <FontAwesomeIcon icon={faHouse} className="text-lg" />
                    {hasUnreadMessagesInListings && (
                      <span className="absolute right-0 top-0 -translate-y-1/2 translate-x-1/2 text-[15px] text-red-500 md:text-lg">
                        &#9679;
                      </span>
                    )}
                  </div>
                  <span className="mt-1 text-xs">My Listings</span>
                </NavLink>
              </li>
              <li className="flex-1">
                <NavLink
                  to="/enquiries"
                  style={({ isActive }) => (isActive ? activeStyle : undefined)}
                  className="flex flex-col items-center justify-center p-2"
                >
                  <div className="relative">
                    <FontAwesomeIcon icon={faEnvelope} className="text-lg" />
                    {hasUnreadMessages && (
                      <span className="absolute right-0 top-0 -translate-y-1/2 translate-x-1/2 text-[15px] text-red-500 md:text-lg">
                        &#9679;
                      </span>
                    )}
                  </div>
                  <span className="mt-1 text-xs">My Enquiries</span>
                </NavLink>
              </li>
              <li className="flex-1">
                <NavLink
                  to="/mysublets"
                  style={({ isActive }) => (isActive ? activeStyle : undefined)}
                  className="flex flex-col items-center justify-center rounded-e-lg p-2"
                >
                  <div>
                    <svg viewBox="-250 100 750 320" className="fill-current">
                      <g>
                        <rect
                          x="57.584"
                          y="141.502"
                          width="53.371"
                          height="243.68"
                          rx="3.511"
                          ry="3.511"
                        ></rect>
                      </g>
                      <g>
                        <rect
                          x="58.288"
                          y="331.812"
                          width="251.404"
                          height="54.775"
                          rx="2.809"
                          ry="2.809"
                        ></rect>
                      </g>
                      <rect
                        x="124.298"
                        y="143.61"
                        width="182.584"
                        height="54.073"
                        rx="2.809"
                        ry="2.809"
                      ></rect>
                      <rect
                        x="124.297"
                        y="265.099"
                        width="182.584"
                        height="51.967"
                        rx="3.511"
                        ry="3.511"
                      ></rect>
                      <path d="M 306.18 143.609 L 304.775 198.385 C 304.775 202.986 125 315.66 125 315.66 L 125.702 265.098 L 306.18 143.609 Z"></path>
                    </svg>
                    <span className="mt-1 text-xs">My Lettz</span>
                  </div>
                </NavLink>
              </li>
            </ul>
          </div>
        </div>
      </body>
    </>
  );
}
