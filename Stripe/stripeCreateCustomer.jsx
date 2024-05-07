exports.processPayment = onCall(async (data, context) => {
    // Ensure the user is authenticated
    if (!context.auth) {
      console.error("Authentication error: User is not authenticated.");
      throw new HttpsError("User is not authenticated.");
    }
    let customer;
    if (data.hasCustomerId === false) {
      try {
        // Create a Stripe customer
        customer = await stripe.customers.create({
          email: data.email,
          name: data.name,
          // Add additional customer details here
        });
      } catch (error) {
        console.error("Error creating customer:", error);
        throw new HttpsError("internal", "Failed to create customer");
      }
    } else {
      // Use the existing customerId
      customer = {id: data.customerId};
    }
    try {
      await stripe.paymentMethods.attach(data.paymentMethodId, {
        customer: customer.id,
      });
      console.log("Data Payment method: ", data.paymentMethodId);
      // Set it as the default payment method
      await stripe.customers.update(customer.id, {
        invoice_settings: {
          default_payment_method: data.paymentMethodId,
        },
      });
  
      return {success: true,
        customerId: customer.id, cancelled: true};
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
      // If customer was created and payment intent failed, delete the customer
      console.log("customer:", customer);
      console.log("customer.id:", customer.id);
  
      throw new HttpsError("Payment process fail", error.message);
    }
  });