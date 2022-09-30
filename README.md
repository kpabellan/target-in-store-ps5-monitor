# Target In-Store PS5 Monitor

A [Target](https://www.target.com) in-store stock monitor for both digital and disc PS5 consoles that sends in stock alerts to SMS and/or Discord webhook.

## Requirements

- [NodeJS](https://nodejs.org/en/)
- Twilio or Discord webhook

## Configuration

### Twilio Configuration (Leave blank if not interested in Twilio alerts)

This project utilizes [Twilio](https://www.twilio.com/) to send SMS alerts, and you will need to set up an account to use this feature. Once you obtain your `accountsSID`, `authToken`, `twilioPhoneNumber`, and the phone numbers you want to send SMS alerts to, you can continue with the steps below:

1. Navigate to the `config.js` file.
2. Fill in the `accountsSID`, `authToken`, and `twilioPhoneNumber` variables. These values are found in Twilio.
3. Enter recipient phone numbers in the `recipientPhoneNumber` variable.

### Discord Webhook Configuration (Leave blank if not interested in Discord webhook alerts)

1. Navigate to the `config.js` file.
2. Enter your webhook in the `discordWebhook` variable.

### Store Configuration

You will need to chose which Target stores you want to monitor and in order to do this, you will need to know the store ID of the Target stores in which you can do so with the steps below:

1. Navigate to https://www.target.com/store-locator/find-stores.
2. Find and select your store.
3. Your store ID will be the numbers at the end of the URL (should be 3-4 characters).
4. Navigate back into the `config.js` file and insert the store IDs into the `storeID` variable.

### Proxy Configuration

In order to keep this monitor running safe and smooth, you will need to add proxies. Follow the steps below to configure proxies:

1. Create a file named `proxylist.txt` in the main folder.
2. Enter your proxies and separate them by a new line.

## Starting

To start the monitor, open a terminal and run these commands:

* Set directory to program directory:
  ```sh
  cd "C:/Path/To/program/Folder"
  ```
* Install the dependencies (you only have to do this once):
  ```sh
  npm install
  ```
* Run with the following command:
  ```sh
  npm start
  ```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.