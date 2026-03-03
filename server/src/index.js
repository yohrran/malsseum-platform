require('dotenv').config();

// C-1: 필수 환경변수 검증 (서버 시작 전)
const REQUIRED_ENV = ['MONGO_URI', 'JWT_SECRET', 'GOOGLE_CLIENT_ID'];
for (const key of REQUIRED_ENV) {
  if (!process.env[key]) {
    console.error(`Missing required environment variable: ${key}`);
    process.exit(1);
  }
}

const connectDB = require('./db');
const app = require('./app');

const PORT = process.env.PORT || 5000;

const start = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

start();
