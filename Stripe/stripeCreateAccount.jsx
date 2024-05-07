

// FIREBASE FUNCTIONS
exports.createStripeAccount = onCall(async (data, context) => {
    console.log(data);
    // Create a new Stripe account
  
    const account = await stripe.accounts.create({
      type: "custom", // or "standard", based on your requirement
      country: "IE", // specify the country
      business_type: "individual", // or "company"
      email: data.email, // user"s email
      business_profile: {
        mcc: "6513",
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
      // Add other account details as needed
    });
  
    return {accountId: account.id};
  });

  exports.createExternalAccount= onCall(async (data, context) => {
    // Authentication check
    if (!context.auth) {
      throw new HttpsError("unauthenticated",
          "The function must be called while authenticated.");
    }
    try {
      // Add an external bank account to the Stripe account
      const externalAccount = await stripe
          .accounts.createExternalAccount(data.accountId, {
            external_account: {
              object: "bank_account",
              country: "IE", // Adjust this based on your requirements
              currency: "eur", // Adjust this based on your requirements
              account_holder_name: data.accountHolderName,
              account_holder_type: "individual", // or "company"
              account_number: data.accountNumber,
            },
            // Add other options if necessary
          });
      // After successfully adding the external account, set it as the default
      await stripe.accounts.updateExternalAccount(
          data.accountId,
          externalAccount.id,
          {default_for_currency: true,
          });
      return {externalAccountId: externalAccount.id};
    } catch (error) {
      console.error("Error creating external account:", error);
      throw new HttpsError("unknown",
          "Failed to create external account", error);
    }
  });

  exports.updateTosAcceptance = onCall(async (data, context) => {
    try {
      // Update the Stripe account with ToS acceptance details
      const updatedAccount = await stripe.accounts.update(data.accountId, {
        tos_acceptance: {
          date: data.tosDate, // Unix timestamp of when the ToS was accepted
          ip: data.ipAddress, // IP address of the user who accepted the ToS
        },
      });
  
      return {success: true, accountId: updatedAccount.id};
    } catch (error) {
      console.error("Error updating ToS acceptance:", error);
      throw new HttpsError("unknown",
          "Failed to update ToS acceptance", error);
    }
  });