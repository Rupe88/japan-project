
import * as dotenv from 'dotenv';
dotenv.config();

export default {
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  // Optional: use "binary" if you're using Prisma in Docker, otherwise "classic" is fine
  engine: 'classic',
  datasource: {
    url: process.env.DATABASE_URL
  },
};
