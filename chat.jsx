// IMPORTS
import React, { useState, useEffect, useRef } from "react";
import { db } from "../firebase-config";
import {
  collection,
  query,
  onSnapshot,
  addDoc,
  orderBy,
  serverTimestamp,
  doc,
  getDoc,
  updateDoc,
  where,
  getDocs,
} from "firebase/firestore";
import { getFunctions, httpsCallable } from "firebase/functions";

// CREATE FUNCTION
export default function Chat({
  listingId,
  enquiryId,
  subletId,
  currentUser,
  otherUser,
}) {
  // STATE VAIRABLES
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesContainerRef = useRef(null);
  const [currentUserData, setCurrentUserData] = useState(null);

  // JAVASCRIPT LOGIC
  useEffect(() => {
    let messagesRef;
    if (subletId) {
      messagesRef = collection(db, "Sublets", subletId, "messages");
    } else if (listingId && enquiryId) {
      messagesRef = collection(
        db,
        "Listings",
        listingId,
        "enquiries",
        enquiryId,
        "messages"
      );
    } else {
      console.log("Insufficient data to fetch messages.");
      return;
    }

    const q = query(messagesRef, orderBy("timestamp"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedMessages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMessages(fetchedMessages);
    });

    return () => unsubscribe();
  }, [listingId, enquiryId, subletId]);

  useEffect(() => {
    const fetchCurrentUserData = async () => {
      if (currentUser) {
        try {
          const userSnap = await getDoc(doc(db, "users", currentUser));
          if (userSnap.exists()) {
            setCurrentUserData(userSnap.data());
          } else {
            console.log("No user data found");
          }
        } catch (error) {
          console.error("Error fetching current user data: ", error);
        }
      }
    };
    fetchCurrentUserData();
  }, [currentUser]);

  useEffect(() => {
    const messagesContainer = messagesContainerRef.current;
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  }, [messages]);

  const sendEmail = async (currentUserData) => {
    console.log(otherUser.email);
    console.log(currentUserData.firstName + " " + currentUserData.lastName);
    const functions = getFunctions();
    const sendEmailNewMessage = httpsCallable(functions, "sendEmailNewMessage");

    try {
      const result = await sendEmailNewMessage({
        email: otherUser.email,
        receivingUser: otherUser.firstName,
        sendingUser: currentUserData.firstName + " " + currentUserData.lastName,
      });
      console.log(result.data);
      console.log(result.data);
    } catch (error) {
      console.error(error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      // Use currentUserData directly from the state
      if (!currentUserData) {
        console.error("Current user data is not available.");
        return;
      }

      const userPhotoURL = currentUserData.photoURL;

      let messagesRef;
      if (subletId) {
        messagesRef = collection(db, "Sublets", subletId, "messages");
      } else if (listingId && enquiryId) {
        messagesRef = collection(
          db,
          "Listings",
          listingId,
          "enquiries",
          enquiryId,
          "messages"
        );
      } else {
        console.log("Insufficient data to send message.");
        return;
      }

      await addDoc(messagesRef, {
        text: newMessage,
        userId: currentUser,
        photoURL: userPhotoURL,
        timestamp: serverTimestamp(),
        read: false,
      });

      setNewMessage("");
      sendEmail(currentUserData);
    } catch (error) {
      console.error("Error sending message: ", error);
    }
  };

  useEffect(() => {
    const markMessagesAsRead = async () => {
      // Determine the correct collection path based on the available data
      let messagesRef;
      if (listingId && enquiryId) {
        messagesRef = collection(
          db,
          "Listings",
          listingId,
          "enquiries",
          enquiryId,
          "messages"
        );
      } else if (subletId) {
        messagesRef = collection(db, "Sublets", subletId, "messages");
      } else {
        console.log("Not enough information to locate messages collection.");
        return;
      }

      const querySnapshot = await getDocs(
        query(
          messagesRef,
          where("userId", "!=", currentUser),
          where("read", "==", false)
        )
      );

      const promises = querySnapshot.docs.map((doc) => {
        const messageRef = doc.ref;
        return updateDoc(messageRef, { read: true });
      });

      await Promise.all(promises);
    };

    if (messages.length > 0) {
      markMessagesAsRead();
    }
  }, [messages, currentUser, listingId, enquiryId, subletId]);

  // HTML
  return (
    <>
      <head></head>
      <body>
        <div className="mx-auto w-full rounded-lg border border-gray-200 bg-white shadow-md">
          <h2 className="rounded-t-lg bg-purple-500 p-2 pl-4 text-3xl font-bold text-white shadow-lg md:p-4 md:px-12">
            Chat
          </h2>
          <hr className="mb-4" />
          <div
            ref={messagesContainerRef}
            className="h-64 overflow-y-auto px-2 md:px-12"
          >
            {messages.map((message) => (
              <div
                key={message.id}
                className={`my-2 flex items-center ${
                  message.userId === currentUser
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                {message.userId !== currentUser && message.photoURL && (
                  <img
                    src={message.photoURL}
                    alt="User"
                    className="mr-2 h-8 w-8 rounded-full"
                  />
                )}
                <div
                  className={`max-w-xs rounded-lg p-2 ${
                    message.userId === currentUser
                      ? "bg-blue-400 text-white"
                      : "bg-gray-200"
                  }`}
                >
                  <span className="text-sm">{message.text}</span>
                </div>
                {message.userId === currentUser && message.photoURL && (
                  <img
                    src={message.photoURL}
                    alt="User"
                    className="ml-2 h-8 w-8 rounded-full"
                  />
                )}
              </div>
            ))}
          </div>
          <hr className="" />
          <div className="p-2 md:p-4">
            <div className="flex items-center space-x-2 md:space-x-4 md:px-12">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-grow rounded-lg border border-gray-300 p-2 focus:border-blue-300"
              />
              <button
                onClick={sendMessage}
                className="rounded-lg bg-purple-500 p-2 px-4 text-white hover:bg-purple-600 md:px-16"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </body>
    </>
  );
}
