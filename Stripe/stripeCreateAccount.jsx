//BACKEND
// CREATE STRIPE ACCOUNT
exports.createStripeAccount = onCall(async (data, context) => {
  // Data - (email, firstName, lastName, phone, day, month, year, line1, city, state, postcode)

  const account = await stripe.accounts.create({
    type: "custom", // or "standard", based on your requirement
    country: "IE", // specify the country
    business_type: "individual", // or "company"
    email: data.email, // user"s email
    business_profile: {
      mcc: "6513", // this is the code for real estate
      url: "www.lettz.com",
    },
    individual: {
      first_name: data.firstName,
      last_name: data.lastName,
      email: data.email,
      phone: data.phone,
      dob: {
        day: data.day,
        month: data.month,
        year: data.year,
      },
      address: {
        line1: data.line1,
        city: data.city,
        state: data.state,
        postal_code: data.postcode,
      },
    },
    capabilities: {
      card_payments: {
        requested: true,
      },
      transfers: {
        requested: true,
      },
    },
    settings: {
      payments: {
        statement_descriptor: "LETTZ",
      },
    },
  });

  return { accountId: account.id };
});

// CREATE EXTERNAL ACCOUNT AND ADD TO STRIPE ACCOUNT
exports.createExternalAccount = onCall(async (data, context) => {
  // Data - (accountId, accountHolderName, accountNumber)
  try {
    const externalAccount = await stripe.accounts.createExternalAccount(
      data.accountId,
      {
        external_account: {
          object: "bank_account",
          country: "IE", // Adjust this based on your requirements
          currency: "eur", // Adjust this based on your requirements
          account_holder_name: data.accountHolderName,
          account_holder_type: "individual", // or "company"
          account_number: data.accountNumber,
        },
      }
    );
    // After successfully adding the external account, set it as the default
    await stripe.accounts.updateExternalAccount(
      data.accountId,
      externalAccount.id,
      { default_for_currency: true }
    );
    return { externalAccountId: externalAccount.id };
  } catch (error) {
    console.error("Error creating external account:", error);
    throw new HttpsError("unknown", "Failed to create external account", error);
  }
});

// UPDATE TOS ACCEPTANCE FOR STRIPE ACCOUNT
exports.updateTosAcceptance = onCall(async (data, context) => {
  // Data - (accountId, tosDate, ipAddress)
  try {
    const updatedAccount = await stripe.accounts.update(data.accountId, {
      tos_acceptance: {
        date: data.tosDate, // Unix timestamp of when the ToS was accepted
        ip: data.ipAddress, // IP address of the user who accepted the ToS
      },
    });

    return { success: true, accountId: updatedAccount.id };
  } catch (error) {
    console.error("Error updating ToS acceptance:", error);
    throw new HttpsError("unknown", "Failed to update ToS acceptance", error);
  }
});

// FRONTEND
import React, { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "../../firebase-config";
import { httpsCallable, getFunctions } from "firebase/functions";

const StripeAccountSetup = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [stripeAccountId, setStripeAccountId] = useState(null);
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [tosAccepted, setTosAccepted] = useState(false);
  const [userData, setUserData] = useState({});
  const [stripeAccountData, setStripeAccountData] = useState({
    day: "",
    month: "",
    year: "",
    city: "",
    line1: "",
    postcode: "",
    state: "",
  });
  const [externalAccountData, setExternalAccountData] = useState({
    accountHolderName: "",
    accountNumber: "",
  });

  useEffect(() => {
    // Fetch user data from Firestore when the user is logged in
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const userDocRef = doc(db, "users", currentUser.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          setUserData(userDocSnap.data());
        } else {
          console.log("No user data found!");
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const handleStripeAccountSubmit = async (event) => {
    event.preventDefault();
    if (!tosAccepted) {
      alert("You must accept the Terms of Service.");
      return;
    }
    setIsLoading(true); // Start loading
    const combinedData = {
      ...stripeAccountData,
      ...userData,
    };
    try {
      // Create Stripe Account
      const functions = getFunctions();
      const createStripeAccount = httpsCallable(functions, "createStripeAccount");
      const accountResult = await createStripeAccount(combinedData);

      if (accountResult.data.error) {
        console.error("Error from function:", accountResult.data.error);
      } else {
        setStripeAccountId(accountResult.data.accountId);

        // Submit ToS Acceptance
        const ipResponse = await fetch("https://api.ipify.org?format=json");
        const ipData = await ipResponse.json();
        const tosDate = Math.floor(Date.now() / 1000);

        const updateTosAcceptance = httpsCallable(functions, "updateTosAcceptance");
        await updateTosAcceptance({
          accountId: accountResult.data.accountId,
          tosDate: tosDate,
          ipAddress: ipData.ip,
        });

        const createExternalAccount = httpsCallable(functions, "createExternalAccount");
        await createExternalAccount({
          ...externalAccountData,
          accountId: accountResult.data.accountId, // Assuming this is the ID of the Stripe account
        });

        const currentUser = auth.currentUser;
        if (currentUser) {
          const userDocRef = doc(db, "users", currentUser.uid);
          await updateDoc(userDocRef, {
            accountId: accountResult.data.accountId,
          });
        }
        console.log("Stripe Account created, ToS accepted, and external account added successfully.");
      }
    } catch (error) {
      console.error("Function call failed:", error);
    }
    setIsLoading(false); // Stop loading in case of error
  };

  const handleDateOfBirthChange = (e) => {
    const newDate = e.target.value; // format: "YYYY-MM-DD"
    setDateOfBirth(newDate);

    const [year, month, day] = newDate.split("-");
    setStripeAccountData({
      ...stripeAccountData,
      day: parseInt(day, 10),
      month: parseInt(month, 10),
      year: parseInt(year, 10),
    });
  };

  const handleExternalAccountInputChange = (e) => {
    setExternalAccountData({
      ...externalAccountData,
      [e.target.name]: e.target.value,
    });
  };

  const handleStripeAccountInputChange = (e) => {
    const { name, value } = e.target;
    const isNumberField = name === "day" || name === "month" || name === "year";
    const updatedValue = isNumberField && value ? parseInt(value, 10) : value;

    setStripeAccountData({ ...stripeAccountData, [name]: updatedValue });
  };

  return (
    <form onSubmit={handleStripeAccountSubmit}>
      <div>
        <label>Date of Birth*</label>
        <input
          required
          type="date"
          name="dateOfBirth"
          value={dateOfBirth}
          onChange={handleDateOfBirthChange}
        />
      </div>
      <div>
        <label>Street Address*</label>
        <input
          required
          type="text"
          name="line1"
          value={stripeAccountData.line1}
          onChange={handleStripeAccountInputChange}
          placeholder="Street Address"
        />
      </div>
      <div>
        <label>Town/City*</label>
        <input
          required
          type="text"
          name="city"
          value={stripeAccountData.city}
          onChange={handleStripeAccountInputChange}
          placeholder="City"
        />
      </div>
      <div>
        <label>County*</label>
        <select
          required
          name="state"
          value={stripeAccountData.state}
          onChange={handleStripeAccountInputChange}
        >
          <option value="">Select County</option>
          <option value="Co. Antrim">Antrim</option>
          <option value="Co. Armagh">Armagh</option>
          <option value="Co. Carlow">Carlow</option>
          {/* Add other counties as needed */}
        </select>
      </div>
      <div>
        <label>Eircode*</label>
        <input
          required
          type="text"
          name="postcode"
          value={stripeAccountData.postcode}
          onChange={handleStripeAccountInputChange}
          placeholder="Eircode"
        />
      </div>
      <div>
        <label>Account Holder Name*</label>
        <input
          required
          type="text"
          name="accountHolderName"
          value={externalAccountData.accountHolderName}
          onChange={handleExternalAccountInputChange}
          placeholder="Account Holder Name"
        />
      </div>
      <div>
        <label>IBAN*</label>
        <input
          required
          type="text"
          name="accountNumber"
          value={externalAccountData.accountNumber}
          onChange={handleExternalAccountInputChange}
          placeholder="Enter your IBAN"
          maxLength={22}
        />
      </div>
      <div>
        <input
          type="checkbox"
          checked={tosAccepted}
          onChange={(e) => setTosAccepted(e.target.checked)}
        />
        <span>
          I accept the{" "}
          <a
            href="https://stripe.com/connect-account/legal"
            target="_blank"
            rel="noopener noreferrer"
          >
            Terms of Service
          </a>
          *
        </span>
      </div>
      <button type="submit" disabled={!tosAccepted || isLoading}>
        {isLoading ? "Submitting..." : "Submit Details"}
      </button>
    </form>
  );
};

export default StripeAccountSetup;
