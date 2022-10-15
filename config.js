const config = {
  "twilioInfo": { // Leave blank if not using Twilio
    "accountsSID": "", // Your account SID found on Twilio
    "authToken": "", // Your auth token found on Twilio
    "twilioPhoneNumber": "", // Twilio phone number
    "recipientPhoneNumber": [""] // Recipient phone number(s) as string array
  },
  "storeID": [""], // Target store ID(s) as string array
  "discordWebhook": "" // Leave blank if not using Discord webhook
};

module.exports = config;