const app = require('./src/app');
const sequelize = require('./src/config/db');
const Country = require('./src/models/country');

const PORT = process.env.PORT || 3000;

async function start() {
  try {
    await sequelize.authenticate();
    console.log('DB connected');
    // If you want: sync the model (be careful in production)
    await Country.sync(); // use { alter: true } or migrations in real projects
    app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
  } catch (err) {
    console.error('Failed to start', err);
    process.exit(1);
  }
}

start();
