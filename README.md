# Target In-Store PS5 Monitor

A [Target](https://www.target.com) in-store stock monitor for both digital and disc PS5 consoles that sends in stock alerts to SMS using Twilio.

## Requirements

- [NodeJS](https://nodejs.org/en/)

## Configuration

This project comes with an example .env file that you can use as a base to help, first you will need to copy and rename this file with the steps below:

1. Copy the `example.env` file.
2. Rename it to `.env`.

### Twilio Configuration

This project utilizes [Twilio](https://www.twilio.com/) to send SMS alerts, and you will need to set up an account to use this feature. Once you obtain your `ACCOUNT SID`, `AUTH TOKEN`, `Messaging Service SID`, and the phone number you want to send SMS alerts to, you can continue with the steps below:

1. Navigate to the `.env` file.
2. Insert your details into the `PHONENUM`, `ACCOUNTSID`, `AUTHTOKEN`, and `MESSAGINGSERVICESID` variables.

### Store Configuration

You will need to chose which Target store you want to monitor and in order to do this, you will need to know the store ID of that Target in which you can do so with the steps below:

1. Navigate to https://www.target.com/store-locator/find-stores.
2. Find and select your store.
3. Your store ID will be the numbers at the end of the link (should be 3-4 characters).
4. Navigate back into the `.env` file and insert the store ID into the `STOREID` variable.

### Proxy Configuration

In order to keep this monitor running safe and smooth, you will need to add proxies. Follow the steps below to configure proxies:

1. Create a file named `proxylist.txt` in the main folder.
2. Add IPs/URLs, which should be separated by a new line.
3. These proxies should be formatted as `http://username:password@ip:port` or `http://127.0.0.1:12345`.
4. Navigate to the `index.js` file and find the variable called `numProxies`. You then want to change the value of this variable to however many proxies you have in the `proxylist.txt` file.

## Starting

To start the monitor, open a terminal and run these commands:

* Set directory to bot directory:
  ```sh
  cd "C:/Path/To/Bot/Folder"
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

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.