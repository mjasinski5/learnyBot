const firebase = require('./firebase');
const senderService = require('./sender');

async function register(senderId) {
  try {
    if(await firebase.isUserExist(senderId)) {
      console.log(`User with senderId: ${senderId} already exist!`);
      await senderService.sendTextMessage(senderId,  'You are already subscribed :) !');
      return await senderService.sendCategory(senderId);
    }
    await firebase.createUser(senderId);
    
    senderService.sendTextMessage(senderId,  'Oh.. I see you are here by the first time my Friend! Lets take a look at Categories!');
    senderService.sendCategory(senderId);
  }
  catch(e) {
    console.log('Error during subscribe', e);
  }

}

async function subscribe(senderId, categoryId) {
  
}

module.exports = {
  register,
  subscribe
};