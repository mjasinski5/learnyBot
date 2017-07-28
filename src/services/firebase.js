const firebase = require('firebase-admin');
const categories = require('./../../data/categories');
const serviceAccount = require('./../../data/privateKey.json');

firebase.initializeApp({
  credential: firebase.credential.cert(serviceAccount),
  databaseURL: 'https://learningoneword.firebaseio.com'
});

const users = firebase.database().ref('/users');
// init();

async function init() {
  const nr = 433;
  const a = await isUserExist(nr);
  console.log('a', a);
  const b = await createUser(nr);
  console.log('b', b);

  const c = await isUserExist(nr);
  console.log('c', c);
}
async function isUserExist(senderId) {
  return new Promise((resolve, reject) => {
    users.orderByChild('id').equalTo(senderId).on('value', (snap) => {
      console.log(snap.val());
      return resolve(Boolean(snap.val()));
    });
  });
}

async function createUser(senderId) {
  return new Promise((resolve, reject) => {
    users.push({
      id: senderId
    }, (err) => {
      if(err) return reject(err);

      return resolve();
    });
  });

}


module.exports = {
  createUser,
  isUserExist
};