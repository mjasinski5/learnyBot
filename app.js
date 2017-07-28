/*
 * Copyright 2016-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

/* jshint node: true, devel: true */
'use strict';

const 
  bodyParser = require('body-parser'),
  config = require('config'),
  crypto = require('crypto'),
  express = require('express'),
  https = require('https'),  
  request = require('request'),
  firebase = require('firebase-admin'),
  firebaseService = require('./src/services/firebase'),
  receiverService = require('./src/services/receiver'),
  configService = require('./src/services//config');

const app = express();
app.set('port', process.env.PORT || 5000);
app.set('view engine', 'ejs');
app.use(bodyParser.json({ verify: verifyRequestSignature }));
app.use(express.static('public'));


const { APP_SECRET, VALIDATION_TOKEN, PAGE_ACCESS_TOKEN, SERVER_URL } = configService;

if (!configService.isInitialized()) {
  console.error('Missing config values');
  process.exit(1);
}

/*
 * Use your own validation token. Check that the token used in the Webhook 
 * setup is the same token used here.
 *
 */
app.get('/webhook', /*Bot.router(),*/ (req, res) => {
  if (req.query['hub.mode'] === 'subscribe' &&
      req.query['hub.verify_token'] === VALIDATION_TOKEN) {
    console.log('Validating webhook');
    res.status(200).send(req.query['hub.challenge']);
  }
  else {
    console.error('Failed validation. Make sure the validation tokens match.');
    res.sendStatus(403);          
  }  
});


/*
 * All callbacks for Messenger are POST-ed. They will be sent to the same
 * webhook. Be sure to subscribe your app to your page to receive callbacks
 * for your page. 
 * https://developers.facebook.com/docs/messenger-platform/product-overview/setup#subscribe_app
 *
 */
app.post('/webhook', (req, res) => {
  const data = req.body;
  console.log('ooo kurwa')
  // Make sure this is a page subscription
  if (data.object == 'page') {

    // Iterate over each entry
    // There may be multiple if batched
    data.entry.forEach((pageEntry) => {
      const pageID = pageEntry.id;
      const timeOfEvent = pageEntry.time;
      
      // console.log('pageEntry', pageEntry)

      // Iterate over each messaging event
      pageEntry.messaging.forEach((messagingEvent) => {
        if (messagingEvent.optin) {
          receiverService.receivedAuthentication(messagingEvent);
        }
        else if (messagingEvent.message) {
          receiverService.receivedMessage(messagingEvent);
        }
        else if (messagingEvent.delivery) {
          receiverService.receivedDeliveryConfirmation(messagingEvent);
        }
        else if (messagingEvent.postback) {
          receiverService.receivedPostback(messagingEvent);
        }
        else if (messagingEvent.read) {
          receiverService.receivedMessageRead(messagingEvent);
        }
        else if (messagingEvent.account_linking) {
          receiverService.receivedAccountLink(messagingEvent);
        }
        else {
          console.log('Webhook received unknown messagingEvent: ', messagingEvent);
        }
      });
    });

    // Assume all went well.
    //
    // You must send back a 200, within 20 seconds, to let us know you've 
    // successfully received the callback. Otherwise, the request will time out.
    res.sendStatus(200);
  }
});

/*
 * This path is used for account linking. The account linking call-to-action
 * (sendAccountLinking) is pointed to this URL. 
 * 
 */
app.get('/authorize', (req, res) => {
  const accountLinkingToken = req.query.account_linking_token;
  const redirectURI = req.query.redirect_uri;

  // Authorization Code should be generated per user by the developer. This will 
  // be passed to the Account Linking callback.
  const authCode = '1234567890';

  // Redirect users to this URI on successful login
  const redirectURISuccess = `${redirectURI  }&authorization_code=${  authCode}`;

  res.render('authorize', {
    accountLinkingToken: accountLinkingToken,
    redirectURI: redirectURI,
    redirectURISuccess: redirectURISuccess
  });
});

/*
 * Verify that the callback came from Facebook. Using the App Secret from 
 * the App Dashboard, we can verify the signature that is sent with each 
 * callback in the x-hub-signature field, located in the header.
 *
 * https://developers.facebook.com/docs/graph-api/webhooks#setup
 *
 */
function verifyRequestSignature(req, res, buf) {
  const signature = req.headers['x-hub-signature'];

  if (!signature) {

    // For testing, let's log an error. In production, you should throw an 
    // error.
    console.error('Couldn\'t validate the signature.');
  }
  else {
    const elements = signature.split('=');
    const method = elements[0];
    const signatureHash = elements[1];

    const expectedHash = crypto.createHmac('sha1', APP_SECRET)
                        .update(buf)
                        .digest('hex');

    if (signatureHash != expectedHash) {
      throw new Error('Couldn\'t validate the request signature.');
    }
  }
}



// Start server
// Webhooks must be available via SSL with a certificate signed by a valid 
// certificate authority.
app.listen(app.get('port'), () => {
  console.log('Node app is running on port', app.get('port'));
});

module.exports = app;

