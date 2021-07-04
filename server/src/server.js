import express from 'express';
import * as dotenv from 'dotenv';
dotenv.config();

import { updateDb } from './updatedb.js';

const app = express();

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.get('/api/updatedb', async (req, res) => {
  await updateDb();
  res.send('Succesfully updated database.');
});

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
