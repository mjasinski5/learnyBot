const config = require('./../config');

const { SERVER_URL } = config;

function createGenericCategoryData(recipientId, categoryData) {
  const elements = categoryData.map((category) => ({
    title: category.title,
    subtitle: category.subtitle,
    item_url: 'https://jakasNaszastrona.pl',               
    image_url: `${SERVER_URL  }/assets/${category.imageName}`,
    buttons: [{
      type: 'postback',
      title: 'Subscribe!',
      payload: JSON.stringify({
        action: 'subscribe',
        payload: 'du[a'//category.id ? category.id : 'lol'
      })
    }]
  }));
  console.log('elements', elements);
 
  return {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: 'template',
        payload: {
          template_type: 'generic',
          elements
        }
      }
    }
  };
}


module.exports = {
  createGenericCategoryData
};