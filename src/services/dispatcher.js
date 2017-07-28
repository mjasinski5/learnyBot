const actionService = require('./actions');

function dispatcher(data, senderId) {

  switch(data.action) {
  case 'subscribe':

    //data.payload is category id
    const payload = JSON.parse(data.payload);
    actionService.subscribe(senderId, payload);

    break;
  default:
    console.log('default');
  }
}


module.exports = {
  dispatcher
};