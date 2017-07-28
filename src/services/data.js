const categories = require('./../../data/categories.json');

async function getCategoryData() {
  console.log('heh')
  return categories.categories;
}

module.exports = {
  getCategoryData
};