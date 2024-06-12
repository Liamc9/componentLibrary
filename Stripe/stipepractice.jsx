// BACKEND
const stripe = require("stripe")(functions.config().stripe.secret_key);



// CREATE CUSTOMER AND ATTACH PAYMENT METHOD
exports.createCustomer = onCall(async (data, context) => {
  //data - (email, paymentMethodId, name, hasCustomerId, customerId)
  if (!context.auth) {
    console.error("Authentication error: User is not authenticated.");
    throw new HttpsError("User is not authenticated.");
  }
  let customer;
  if (data.hasCustomerId === false) {
    try {
      // CREATE STRIPE CUSTOMER
      customer = await stripe.customers.create({
        email: data.email,
        name: data.name,
      });
    } catch (error) {
      console.error("Error creating customer:", error);
      throw new HttpsError("internal", "Failed to create customer");
    }
  } else {
    // Use the existing customerId
    customer = { id: data.customerId };
  }
  try {
    // ATTACH PAYMENT METHOD TO CUSTOMER FROM FRONTEND
    await stripe.paymentMethods.attach(data.paymentMethodId, {
      customer: customer.id,
    });
    // SET AS DEFAULT PAYMENT METHOD
    await stripe.customers.update(customer.id, {
      invoice_settings: {
        default_payment_method: data.paymentMethodId,
      },
    });

    return { success: true, customerId: customer.id, cancelled: true };
  } catch (error) {
    console.error("Error in processPayment function:", {
      errorMessage: error.message,
      request: {
        email: data.email,
        amount: data.amount,
        currency: "eur",
        paymentMethodId: data.paymentMethodId,
      },
      stripeErrorCode: error.code,
      stripeErrorType: error.type,
      rawStripeError: error,
    });
    throw new HttpsError("Payment process fail", error.message);
  }
});

const handleSubmit = async (event) => {
  event.preventDefault();
  setErrors("");
  setIsLoading(true);

  if (!stripe || !elements) {
    // Stripe.js has not loaded yet
    return;
  }

  const cardElement = elements.getElement(CardNumberElement);

  const { error, paymentMethod } = await stripe.createPaymentMethod({
    type: "card",
    card: cardElement,
    billing_details: {
      email: userData.email,
    },
  });

  if (error) {
    console.log("[error]", error);
    setIsLoading(false);
    setErrors("error try again");
    return;
  }
  // Include hasCustomerId to indicate whether userData includes customerId
  const hasCustomerId = !!userData && !!userData.customerId;
  console.log(hasCustomerId);

  // Call Firebase function with additional hasCustomerId field
  const processPayment = httpsCallable(functions, "processPayment");
  processPayment({
    email: userData.email,
    paymentMethodId: paymentMethod.id,
    name: userData.firstName + " " + userData.lastName,
    hasCustomerId: hasCustomerId, // Pass hasCustomerId to your Firebase function
    customerId: userData.customerId || null, // Pass existing customerId if present
  })
    .then(async (result) => {
      console.log(result);
      const newCustomerId = result.data.customerId;
      setCustomerId(newCustomerId);

      // Update user data with the new customerId
      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        await updateDoc(userDocRef, {
          customerId: newCustomerId,
          updateCard: true,
        });
      }

      updateFirestore(newCustomerId);
      setIsLoading(false);
      console.log(subletData);

      setErrors(""); // Clear any existing error messages
      nextPage();
    })
    .catch((error) => {
      // Handle errors
      setErrors("error try again");
      console.error("Error processing payment", error);
      setIsLoading(false);
    });
};

const sendTenantEmail = async (subletData) => {
  console.log(userData.email);
  const functions = getFunctions();
  const sendTenantStayEmail = httpsCallable(functions, "sendTenantStayEmail");

  try {
    const result = await sendTenantStayEmail({
      email: userData.email,
      receivingUser: userData.firstName,
      sendingUser: listerData.firstName + " " + listerData.lastName,
      subletData: subletData,
    });
    console.log(result.data);
  } catch (error) {
    console.error(error);
  }
};

const sendListerEmail = async (subletData) => {
  console.log(listerData.email);
  const functions = getFunctions();
  const sendListerStayEmail = httpsCallable(functions, "sendListerStayEmail");

  try {
    const result = await sendListerStayEmail({
      email: listerData.email,
      receivingUser: listerData.firstName,
      sendingUser: userData.firstName + " " + listerData.lastName,
      subletData: subletData,
    });
    console.log(result.data);
    console.log(result.data);
  } catch (error) {
    console.error(error);
  }
};
