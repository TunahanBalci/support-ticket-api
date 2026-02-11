import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from '../generated/prisma/client.js';
import { env } from './env.utils.js';

const connectionString = `${env.DATABASE_URL}`;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter }).$extends({
  query: {
    tickets: {
      async findMany({ args, query }) { // for soft delete
        const modifiedArgs = {
          ...args,
          where: {
            ...args.where,
            deletedAt: null,
          },
        };

        return query(modifiedArgs);
      },

      async count({ args, query }) { // for soft delete
        const modifiedArgs = {
          ...args,
          where: {
            ...args.where,
            deletedAt: null,
          },
        };

        return query(modifiedArgs);
      },
    },
  },
});

export { prisma };
