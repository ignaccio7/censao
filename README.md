npm install --save-dev oxlint prettier @prettier/plugin-oxc

npm install -D prisma
npm install prisma @prisma/client
https://www.prisma.io/docs/guides/nextjs <- ESTE USAMOS
https://vercel.com/guides/nextjs-prisma-postgres#step-3:-setup-prisma-and-create-the-database-schema

npx auth secret

npx prisma migrate reset
npx prisma migrate dev --name init
npx prisma db seed

api -> https://nextjs.org/docs/app/api-reference/file-conventions/route

PARA NO OLVIDARNOS:
el jwt solo maneja las rutas permitidas solos los paths no maneja los permisos
para construir el sidebar obtenemos todos los paths exceptos con los :uuid
y tambien en el store almacenamos esas rutas con sus permisos para la construccion de las vistas

cambiamos el seed de esto
ruta: '/api/paciente/:uuid/tratamientos', a
ruta: '/api/paciente/tratamientos',

y
/api/paciente/:uuid/tratamientos/:uuid a
/api/paciente/tratamientos/:uuid

EN TRATAMIENTOS
estado String @default("EN_CURSO") // EN_CURSO, COMPLETADA, INCOMPLETO
Agregamos constantes al tratamiento

BUSCADOR DE COSAS IMPORTANTES EN EL PROYECTO:
CTRL + SHIFT + F

- TODO
- IMPORTANTE
