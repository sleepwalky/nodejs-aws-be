import axios from 'axios';

export const getProductsFromDb = () => {
  return axios(
    'https://raw.githubusercontent.com/sleepwalky/nodejs-aws-be/0310dc03e465aad4a5d45b8172a5ee393cd1a134/product-service/db.json'
  ).then((res) => res.data);
};
