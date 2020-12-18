import { Controller, All, Res, Req } from '@nestjs/common';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';
import cache from 'memory-cache';

@Controller()
export class AppController {
  constructor(private readonly configService: ConfigService) {}

  @All()
  proxyRequest(@Req() req, @Res() res) {
    console.log('originalUrl', req.originalUrl);
    console.log('method', req.method);
    console.log('body', req.body);

    const [, recipient] = req.originalUrl.split('/');
    console.log('recipient', recipient);

    const recipientUrl = this.configService.get(recipient);
    console.log('recipientUrl', recipientUrl);

    if (recipientUrl) {
      const axiosConfig = {
        method: req.method,
        url: recipientUrl + req.originalUrl,
        ...(Object.keys(req.body || {}).length > 0 && { data: req.body }),
      };

      const isProductList =
        req.originalUrl === '/products' && req.method === 'GET';

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
  }
}
