npm install --save-dev oxlint prettier @prettier/plugin-oxc

npm install -D prisma
npm install prisma @prisma/client
https://www.prisma.io/docs/guides/nextjs <- ESTE USAMOS
https://vercel.com/guides/nextjs-prisma-postgres#step-3:-setup-prisma-and-create-the-database-schema

npx auth secret

npx prisma migrate reset
npx prisma migrate dev --name init
npx prisma db seed
