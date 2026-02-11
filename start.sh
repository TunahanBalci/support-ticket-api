#!/bin/sh

until nc -z -v -w30 db 5432
do
  echo "Waiting for database connection..."
  sleep 5
done

echo "Database is up!"

echo "Running Migrations..."
npx prisma migrate deploy

if [ $? -ne 0 ]; then
  echo "Migration failed or drift detected. Attempting db push to sync schema..."
  npx prisma db push
fi

exec "$@"
