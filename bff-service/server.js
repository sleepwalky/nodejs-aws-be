const express = require('express');
require('dotenv').config();
const axios = require('axios').default;
const cache = require('memory-cache');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.all('/*', (req, res) => {
  console.log('originalUrl', req.originalUrl);
  console.log('method', req.method);
  console.log('body', req.body);

  const [, recipient] = req.originalUrl.split('/');
  console.log('recipient', recipient);

  const recipientUrl = process.env[recipient];
  console.log('recipientUrl', recipientUrl);

  if (recipientUrl) {
    const axiosConfig = {
      method: req.method,
      url: recipientUrl + req.originalUrl,
      ...(Object.keys(req.body || {}).length > 0 && { data: req.body }),
    };

    const isProductList = req.originalUrl === '/products';

    if (isProductList) {
      const cachedProductList = cache.get('products');
      console.log('checking cache....', cachedProductList);
      if (cachedProductList) {
        console.log('returning from cache');
        res.json(cachedProductList);
        return;
      }
    }

    console.log('axiosConfig: ', axiosConfig);

    axios(axiosConfig)
      .then((response) => {
        console.log('response from recipient', response.data);
        if (isProductList) {
          console.log('storing into cache');
          cache.put('products', response.data, 2 * 60 * 1000);
        }

        res.json(response.data);
      })
      .catch((error) => {
        console.log('some error: ', JSON.stringify(error));
        if (error.response) {
          const { status, data } = error.response;
          res.status(status).json(data);
        } else {
          res.status(502).json({ error: 'Cannot process request' });
        }
      });
  } else {
    res.status(502).json({ error: 'Cannot process request' });
  }
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
