import app from './app.js';
import { connect } from './db/index.js'
const PORT = process.env.PORT || 3000;

async function start() {
  await connect();
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  })
}

start();