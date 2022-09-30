const config = {
    "twilioInfo": { // Leave blank if not using Twilio
        "accountsSID": "", // Your account SID found on Twilio
        "authToken": "", // Your auth token found on Twilio
        "twilioPhoneNumber": "", // Twilio phone number
        "recipientPhoneNumber": [ "" ] // Recipient verified phone number(s)
    },
    "storeID": [ "" ], // Target store ID(s)
    "discordWebhook": "" // Leave blank if not using Discord webhook
}

module.exports = config;