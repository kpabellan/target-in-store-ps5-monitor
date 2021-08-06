'use strict';
require('dotenv').config();
const fs = require('fs');
const req = require('request'); 

//Twilio configuration
const client = require('twilio')(process.env.ACCOUNTSID, process.env.AUTHTOKEN); // Your account SID and auth token found on Twilio
const messagingServiceSid = process.env.MESSAGINGSERVICESID; // Your messaging service SID found on Twilio
const phoneNum = [process.env.PHONENUM]; // Phone number(s) formated as +1XXXXXXXXXX in the .env file

//Target store configuration
const storeID = process.env.STOREID; // Find store ID at https://www.target.com/store-locator/find-stores, find and select your store and your store ID will be the numbers at the end of the link.
const digiSKU = 81114596; // Digital PS5 SKU
const discSKU = 81114595; // Disc PS5 SKU

//Proxy configuration
const proxyData = fs.readFileSync('proxylist.txt', 'UTF-8');
const proxies = proxyData.split(/\r?\n/);
const numProxies = 10; // Number of proxies you have in the proxies.txt file

let digiTime = 0;
let discTime = 0;

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getTimeMS() {
  let date = new Date();
  let timeMS = date.getTime();
  return timeMS;
}

function getTimeStamp() {
  let date = new Date();
  let year = date.getFullYear();
  let month0 = date.getMonth();
  let month1 = month0 + 1;
  let day = date.getDate();
  let timeLocal = date.toLocaleTimeString();
  return 'DATE: ' + month1 + '/' + day + '/' + year + ', TIME: ' + timeLocal;
}

function monitorDigi() {
  const options = {
    url: 'https://redsky.target.com/redsky_aggregations/v1/apps/pdp_v2?device_type=iphone&key=3f015bca9bce7dbb2b377638fa5de0f229713c78&pricing_store_id=' + storeID + '&scheduled_delivery_store_id=' + storeID + '&store_id=' + storeID + '&tcin=' + digiSKU,
    proxy: proxies[randInt(0, numProxies - 1)]
  };
  req(options, function (err, res, body) {
    if (err) return false;
    let fetchSuccess = body.search('location_available_to_promise_quantity') !== -1;

    if (res.statusCode == 200 && fetchSuccess == true) {
      console.log('Monitoring digital PS5...');
      let bodyJSON = JSON.parse(body);
      let storeJSON = bodyJSON.data.product.fulfillment.store_options[0];
      let pickupStat = storeJSON.order_pickup.availability_status;
      let storeQty = storeJSON.location_available_to_promise_quantity;
      let timeMS = getTimeMS();

      if ((pickupStat == 'IN_STOCK' || storeQty > 0) && digiTime + 60000 < timeMS) {
        phoneNum.forEach(async number => {
          client.messages.create({
            body: 'DIGITAL PS5 INSTOCK AT LOCAL TARGET https://www.target.com/p/-/A-' + digiSKU,
            messagingServiceSid: messagingServiceSid,
            to: number
          }).then(message => console.log('Detected stock for digital PS5, sending SMS')).done();
        });
        fs.appendFile('timestamplog.txt', 'SKU: ' + digiSKU + ', ' + getTimeStamp() + '\n', err => {
          if (err) throw err;
        });
        digiTime = timeMS;
      }
    }
  });
}

function monitorDisc() {
  const options = {
    url: 'https://redsky.target.com/redsky_aggregations/v1/apps/pdp_v2?device_type=iphone&key=3f015bca9bce7dbb2b377638fa5de0f229713c78&pricing_store_id=' + storeID + '&scheduled_delivery_store_id=' + storeID + '&store_id=' + storeID + '&tcin=' + discSKU,
    proxy: proxies[randInt(0, numProxies - 1)]
  };
  req(options, function (err, res, body) {
    if (err) return false;
    let fetchSuccess = body.search('location_available_to_promise_quantity') !== -1;

    if (res.statusCode == 200 && fetchSuccess == true) {
      console.log('Monitoring disc PS5...');
      let bodyJSON = JSON.parse(body);
      let storeJSON = bodyJSON.data.product.fulfillment.store_options[0];
      let pickupStat = storeJSON.order_pickup.availability_status;
      let storeQty = storeJSON.location_available_to_promise_quantity;
      let timeMS = getTimeMS();

      if ((pickupStat == 'IN_STOCK' || storeQty > 0) && discTime + 60000 < timeMS) {
        phoneNum.forEach(async number => {
          client.messages.create({
            body: 'DISC PS5 INSTOCK AT LOCAL TARGET https://www.target.com/p/-/A-' + discSKU,
            messagingServiceSid: messagingServiceSid,
            to: number
          }).then(message => console.log('Detected stock for disc PS5, sending SMS')).done();
        });
        fs.appendFile('timestamplog.txt', 'SKU: ' + discSKU + ', ' + getTimeStamp() + '\n', err => {
          if (err) throw err;
        });
        discTime = timeMS;
      }
    }
  });
}

setInterval(function () {
  monitorDigi();
  monitorDisc();
}, randInt(200, 500));