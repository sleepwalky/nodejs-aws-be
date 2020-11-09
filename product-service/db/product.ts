import { Client, ClientConfig } from 'pg';
import { Product } from '../models/Product';

const { PG_HOST, PG_PORT, PG_DATABASE, PG_USERNAME, PG_PASSWORD } = process.env;
const dbOptions: ClientConfig = {
  host: PG_HOST,
  port: parseInt(PG_PORT, 10),
  database: PG_DATABASE,
  user: PG_USERNAME,
  password: PG_PASSWORD,
  ssl: {
    rejectUnauthorized: false, // to avoid warring in this example
  },
  connectionTimeoutMillis: 5000, // time in millisecond for termination of the database query
};

export const getProductsFromDb = async () => {
  const client = new Client(dbOptions);
  await client.connect();

  try {
    const { rows: products } = await client.query(
      `select * from products p inner join stocks s on p.id = s.product_id `
    );
    console.log(products);
    return products;
  } catch (err) {
    console.error('Error during database request executing:', err);
    throw err;
  } finally {
    client.end();
  }
};

export const getProductByIdFromDb = async (id: string) => {
  const client = new Client(dbOptions);
  await client.connect();

  try {
    const { rows: products } = await client.query(
      `select * from products p inner join stocks s on p.id = s.product_id where p.id = '${id}'`
    );
    console.log(products);
    return products[0];
  } catch (err) {
    console.error('Error during database request executing:', err);
    throw err;
  } finally {
    client.end();
  }
};

export const createProductDb = async ({
  description,
  title,
  img,
  count,
  price,
}: Product) => {
  const client = new Client(dbOptions);
  await client.connect();

  try {
    await client.query('BEGIN');
    const queryText =
      'INSERT INTO products(title, description, price, img) VALUES($1, $2, $3, $4) RETURNING id';
    const insertProductValues = [title, description, price, img];
    console.log(insertProductValues);
    const res = await client.query(queryText, insertProductValues);
    console.log('succesfull insert into products');
    const insertStocksText =
      'INSERT INTO stocks(product_id, count) VALUES ($1, $2)';
    const insertStocksValues = [res.rows[0].id, count];
    await client.query(insertStocksText, insertStocksValues);
    await client.query('COMMIT');
    return await getProductByIdFromDb(res.rows[0].id);
  } catch (e) {
    await client.query('ROLLBACK');
    console.log(e);
    throw e;
  } finally {
    client.end();
  }
};
