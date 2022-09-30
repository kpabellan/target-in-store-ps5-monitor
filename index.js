'use strict';
const axios = require('axios');
const HttpsProxyAgent = require('https-proxy-agent');
const fs = require('fs');
const config = require('./config');

let twilioAlerts = false;
let client = '';
let twilioPhone = '';
let recipientPhone = '';

if (config.twilioInfo.accountsSID.length > 0 && config.twilioInfo.authToken.length > 0) {
  twilioAlerts = true;
  client = require('twilio')(config.twilioInfo.accountsSID, config.twilioInfo.authToken);
  twilioPhone = config.twilioInfo.twilioPhoneNumber;
  recipientPhone = config.twilioInfo.recipientPhoneNumber;
}

let discordWebhookAlerts = false;
let discordWebhook = '';

if (config.discordWebhook.length > 0) {
  discordWebhookAlerts = true;
  discordWebhook = config.discordWebhook;
}

const storeIDs = config.storeID;
const proxyData = fs.readFileSync('proxylist.txt', 'UTF-8');
const proxies = proxyData.split(/\r?\n/);

const delay = ms => new Promise(res => setTimeout(res, ms));

let digiStore = storeIDs;
let discStore = storeIDs;
let digiBundleStore = storeIDs;
let discBundleStore = storeIDs;

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getConsoleType(productSKU) {
  let consoleType = '';

  if (productSKU == 81114596) {
    consoleType = 'PlayStation 5 Digital Edition Console';
  } else if (productSKU == 81114595) {
    consoleType = 'PlayStation 5 Console';
  } else if (productSKU == 86660923) {
    consoleType = 'PlayStation 5 Digital Console Horizon Forbidden West Bundle';
  } else if (productSKU == 86660922) {
    consoleType = 'PlayStation 5 Console Horizon Forbidden West Bundle';
  }

  return consoleType;
}

function formatProxy(proxy) {
  const proxySplit = proxy.split(':');
  const proxyLength = proxySplit.length;

  if (proxyLength == 4) {
    return 'http://' + proxySplit[2] + ':' + proxySplit[3] + '@' + proxySplit[0] + ':' + proxySplit[1];
  } else if (proxyLength == 2) {
    return 'http://' + proxySplit[0] + ':' + proxySplit[1];
  }
}

function sendWebhook(productSKU, storeID, quantity, productPrice, storeLocation, productImage) {
  let consoleType = getConsoleType(productSKU);
  let embed = [{
    title: consoleType + ' in stock at ' + storeLocation + ' Target',
    color: 0xcc0000,
    url: 'https://www.target.com/p/-/A-' + productSKU,
    fields: [{
      name: 'SKU:',
      value: productSKU,
      inline: true
    }, {
      name: 'Price:',
      value: productPrice,
      inline: true
    }, {
      name: 'Quantity:',
      value: quantity,
      inline: true
    }, {
      name: 'Store Location:',
      value: storeLocation,
      inline: true
    }, {
      name: 'Store #:',
      value: storeID,
      inline: true
    }, {
      name: '\u200b',
      value: '\u200b',
      inline: true
    }],
    thumbnail: {
      url: productImage
    }
  }];
  const data = {
    embeds: embed
  };
  axios.post(discordWebhook, data);
}

function sendSMS(productSKU, storeLocation) {
  let consoleType = getConsoleType(productSKU);
  recipientPhone.forEach(async number => {
    client.messages.create({
      body: consoleType + ' in stock at ' + storeLocation + ' Target https://www.target.com/p/-/A-' + productSKU,
      from: twilioPhone,
      to: number
    });
  });
}

async function monitorDigi() {
  const digiSKU = 81114596;

  for (const store in digiStore) {
    let storeID = digiStore[store];
    const config = {
      method: 'get',
      url: 'https://redsky.target.com/redsky_aggregations/v1/apps/pdp_v2?device_type=iphone&key=3f015bca9bce7dbb2b377638fa5de0f229713c78&pricing_store_id=' + storeID + '&scheduled_delivery_store_id=' + storeID + '&store_id=' + storeID + '&tcin=' + digiSKU,
      httpsAgent: new HttpsProxyAgent(formatProxy(proxies[randInt(0, proxies.length - 1)]))
    };
    axios(config).then(async function (response) {
      let responseCode = response.status;
      let body = JSON.stringify(response.data);
      let fetchSuccess = body.search('location_available_to_promise_quantity') !== -1;

      if (responseCode == 200 && fetchSuccess == true) {
        let quantity = JSON.parse(body).data.product.fulfillment.store_options[0].location_available_to_promise_quantity;
        let productPrice = JSON.parse(body).data.product.price.formatted_current_price;
        let storeLocation = JSON.parse(body).data.product.fulfillment.store_options[0].location_name;
        let productImage = JSON.parse(body).data.product.item.enrichment.images.primary_image_url;

        if (quantity > 0) {
          if (twilioAlerts) {
            sendSMS(digiSKU, storeLocation);
          }

          if (discordWebhookAlerts) {
            sendWebhook(digiSKU, storeID, quantity, productPrice, storeLocation, productImage);
          }

          const index = digiStore.indexOf(storeID);

          if (index > -1) {
            digiStore.splice(index, 1);
          }

          await delay(60000);
          digiStore.push(storeID);
        }
      }
    }).catch(function (error) {
      console.log('Error: ' + error.code);
    });
  }
}

async function monitorDisc() {
  const discSKU = 81114595;

  for (const store in discStore) {
    let storeID = discStore[store];
    const config = {
      method: 'get',
      url: 'https://redsky.target.com/redsky_aggregations/v1/apps/pdp_v2?device_type=iphone&key=3f015bca9bce7dbb2b377638fa5de0f229713c78&pricing_store_id=' + storeID + '&scheduled_delivery_store_id=' + storeID + '&store_id=' + storeID + '&tcin=' + discSKU,
      httpsAgent: new HttpsProxyAgent(formatProxy(proxies[randInt(0, proxies.length - 1)]))
    };
    axios(config).then(async function (response) {
      let responseCode = response.status;
      let body = JSON.stringify(response.data);
      let fetchSuccess = body.search('location_available_to_promise_quantity') !== -1;

      if (responseCode == 200 && fetchSuccess == true) {
        let quantity = JSON.parse(body).data.product.fulfillment.store_options[0].location_available_to_promise_quantity;
        let productPrice = JSON.parse(body).data.product.price.formatted_current_price;
        let storeLocation = JSON.parse(body).data.product.fulfillment.store_options[0].location_name;
        let productImage = JSON.parse(body).data.product.item.enrichment.images.primary_image_url;

        if (quantity > 0) {
          if (twilioAlerts) {
            sendSMS(discSKU, storeLocation);
          }

          if (discordWebhookAlerts) {
            sendWebhook(discSKU, storeID, quantity, productPrice, storeLocation, productImage);
          }

          const index = discStore.indexOf(storeID);

          if (index > -1) {
            discStore.splice(index, 1);
          }

          await delay(60000);
          discStore.push(storeID);
        }
      }
    }).catch(function (error) {
      console.log('Error: ' + error.code);
    });
  }
}

async function monitorDigiBundle() {
  const digiBundleSKU = 86660923;

  for (const store in digiBundleStore) {
    let storeID = digiBundleStore[store];
    const config = {
      method: 'get',
      url: 'https://redsky.target.com/redsky_aggregations/v1/apps/pdp_v2?device_type=iphone&key=3f015bca9bce7dbb2b377638fa5de0f229713c78&pricing_store_id=' + storeID + '&scheduled_delivery_store_id=' + storeID + '&store_id=' + storeID + '&tcin=' + digiBundleSKU,
      httpsAgent: new HttpsProxyAgent(formatProxy(proxies[randInt(0, proxies.length - 1)]))
    };
    axios(config).then(async function (response) {
      let responseCode = response.status;
      let body = JSON.stringify(response.data);
      let fetchSuccess = body.search('location_available_to_promise_quantity') !== -1;

      if (responseCode == 200 && fetchSuccess == true) {
        let quantity = JSON.parse(body).data.product.fulfillment.store_options[0].location_available_to_promise_quantity;
        let productPrice = JSON.parse(body).data.product.price.formatted_current_price;
        let storeLocation = JSON.parse(body).data.product.fulfillment.store_options[0].location_name;
        let productImage = JSON.parse(body).data.product.item.enrichment.images.primary_image_url;

        if (quantity > 0) {
          if (twilioAlerts) {
            sendSMS(digiBundleSKU, storeLocation);
          }

          if (discordWebhookAlerts) {
            sendWebhook(digiBundleSKU, storeID, quantity, productPrice, storeLocation, productImage);
          }

          const index = digiBundleStore.indexOf(storeID);

          if (index > -1) {
            digiBundleStore.splice(index, 1);
          }

          await delay(60000);
          digiBundleStore.push(storeID);
        }
      }
    }).catch(function (error) {
      console.log('Error: ' + error.code);
    });
  }
}

async function monitorDiscBundle() {
  const discBundleSKU = 86660922;

  for (const store in discBundleStore) {
    let storeID = discBundleStore[store];
    const config = {
      method: 'get',
      url: 'https://redsky.target.com/redsky_aggregations/v1/apps/pdp_v2?device_type=iphone&key=3f015bca9bce7dbb2b377638fa5de0f229713c78&pricing_store_id=' + storeID + '&scheduled_delivery_store_id=' + storeID + '&store_id=' + storeID + '&tcin=' + discBundleSKU,
      httpsAgent: new HttpsProxyAgent(formatProxy(proxies[randInt(0, proxies.length - 1)]))
    };
    axios(config).then(async function (response) {
      let responseCode = response.status;
      let body = JSON.stringify(response.data);
      let fetchSuccess = body.search('location_available_to_promise_quantity') !== -1;

      if (responseCode == 200 && fetchSuccess == true) {
        let quantity = JSON.parse(body).data.product.fulfillment.store_options[0].location_available_to_promise_quantity;
        let productPrice = JSON.parse(body).data.product.price.formatted_current_price;
        let storeLocation = JSON.parse(body).data.product.fulfillment.store_options[0].location_name;
        let productImage = JSON.parse(body).data.product.item.enrichment.images.primary_image_url;

        if (quantity > 0) {
          if (twilioAlerts) {
            sendSMS(discBundleSKU, storeLocation);
          }

          if (discordWebhookAlerts) {
            sendWebhook(discBundleSKU, storeID, quantity, productPrice, storeLocation, productImage);
          }

          const index = discBundleStore.indexOf(storeID);

          if (index > -1) {
            discBundleStore.splice(index, 1);
          }

          await delay(60000);
          discBundleStore.push(storeID);
        }
      }
    }).catch(function (error) {
      console.log('Error: ' + error.code);
    });
  }
}

function start() {
  if (!twilioAlerts && !discordWebhookAlerts) {
    console.log('No alert methods configured. Please configure at least one alert method in config.js.');
  } else {
    setInterval(function () {
      monitorDigi();
      monitorDisc();
      monitorDigiBundle();
      monitorDiscBundle();
    }, randInt(3000, 7000));
  }
}

start();