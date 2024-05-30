// IMPORTS
import { useState, useEffect } from "react";
import { db } from "../firebase-config";
import { collection, getDocs, getDoc } from "firebase/firestore";

// CREATE FUNCTION
export default function AppList() {
  // STATE VARIABLES
  const [apps, setApps] = useState([]);
  const [stack, setStack] = useState([]);

  // FETCH EVERYTHING FROM A COLLECTION
  useEffect(() => {
    const fetchApps = async () => {
      const querySnapshot = await getDocs(collection(db, "appList"));
      let fetchedApps = querySnapshot.docs.map((doc) => ({id: doc.id, ...doc.data(),}));
      setApps(fetchedApps);
    };
    fetchApps();
  }, []);

  // FETCH EVERYTHING FROM A SUBCOLLECTION
  useEffect(() => {
    const fetchStack = async () => {
      const querySnapshot = await getDocs(collection(db, "appList", appId, "stackList"));
      let fetchedStack = querySnapshot.docs.map((doc) => ({id: doc.id, ...doc.data(),}));
      setStack(fetchedStack);
    };
    fetchStack();
  }, []); // leave blank to run this only on component mount (add value to run on value change)

  // FETCH A PARTICULAR DOC FROM A COLLECTION (Have Try and Catch Here should probably add to the rest)
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        SetUser(userDoc.data());
      } catch (error) {
        console.error("Error fetching enquiries: ", error);
      }
    };
    fetchUser();
  }, []);

  // FETCH AN ARRAY FROM A PARTICULAR DOC AND THEN GET A DOC RELATED TO EACH ELEMENT IN THE ARRAY
  useEffect(() => {
    const fetchEnquiries = async () => {
      try {
        const userRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userRef);
        const userEnquiries = userDoc.exists()
          ? userDoc.data().enquiries || []
          : [];

        for (const enquiry of userEnquiries) {
          const enquiryDoc = await getDoc(doc(db,"Listings",enquiry.listingId,"enquiries",enquiry.enquiryId));

          if (enquiryDoc.exists()) {
            const listingDoc = await getDoc(doc(db, "Listings", enquiry.listingId));

            if (listingDoc.exists()) {
              const enquiryData = {
                enquiryId: enquiry.enquiryId,
                listingId: enquiry.listingId,
                enquiryData: enquiryDoc.data(),
                listingData: listingDoc.data(),
              };

              const messagesSnapshot = await getDocs(collection(db,"Listings",enquiry.listingId,"enquiries",enquiry.enquiryId,"messages"));
            }
          }
        }

        setEnquiries(validEnquiries);
      } catch (error) {
        console.error("Error fetching enquiries: ", error);
      }
    };
    fetchEnquiries();
  }, []);

   // FETCH COLLECTION AND FOR EACH LISTING DOC IN THE COLLECTION GET A USER DOC RELATED TO A VALUE IN THE USER FIELD IN EACH LISTING DOC
   useEffect(() => {
    const fetchData = async () => {
      const querySnapshot = await getDocs(collection(db, "Listings"));
      let fetchedListings = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Fetch user data for each listing
      const fetchedUsers = {};
      for (const listing of fetchedListings) {
        if (listing.listerId && !fetchedUsers[listing.listerId]) {
          const userDocRef = doc(db, "users", listing.listerId);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            fetchedUsers[listing.listerId] = userDocSnap.data();
          }
        }
      }

      setUsers(fetchedUsers);

      setListings(fetchedListings);
      setIsLoading(false);
    };
    fetchData();
  }, []);

  // HTML
  return (
    <>
      <head></head>
      <body>
        <div className="grid w-[70%] grid-cols-4 gap-6">
          {apps.map((app) => (
            <div
              key={app.id}
              className="relative cursor-pointer overflow-hidden rounded-lg bg-white shadow-lg"
              onClick={() => handleCardClick(app.id)}
            >
              <p className="text-2xl font-bold text-center">{app.name}</p>
            </div>
          ))}
        </div>
      </body>
    </>
  );
}
