npm install --save-dev oxlint prettier @prettier/plugin-oxc

npm install -D prisma
npm install prisma @prisma/client
https://www.prisma.io/docs/guides/nextjs <- ESTE USAMOS
https://vercel.com/guides/nextjs-prisma-postgres#step-3:-setup-prisma-and-create-the-database-schema

npx auth secret

npx prisma migrate reset
npx prisma migrate dev --name init
npx prisma db seed
npx prisma migrate dev --create-only --name auditoria_triggers

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

https://nextjs.org/learn/dashboard-app/mutating-data

## TODO: hacer que el doctor de fichas no pueda registrar tratamientos ni ver los que tiene.

TODO: ajustar el problema de citas programadas en estado enfermeria ahi debe terminar la vacuna porque se creo la cita para eso.
en consultas verificar que aparezca directamente donde el doctor y que sea al final tanto en el doctor como pantalla publica
notificaciones

arreglar
Un doctor solo atiende una especialidad por turno. La búsqueda de disponibilidad_id se filtra por doctor_id + turno_codigo — siempre habrá como máximo una coincidencia. osea validar que un doctor no pueda estar atendiendo 2 especialidades en el mismo turno

verificar
aqui asi es la cosa digamos el doctorx tiene especialidad doctorgeneral y odontologia en el turno am podria atender doctorgeneral y en elturno pm atender odontologia pero no podria atender 2 especialidades en el mismo turno por lo que la disponibilidad registrada deberia arrojar solo el turno especifico que se esta registrando

cuando tengo citas con el pacientex dias despues y saco ficha dias antes y si me hago atender sea vacuna o seguimiento esas citas quedan como absorvidas eso esta bien pero que pasa si viene el mismo dia de cita pero presencial eso como lo resolveriamos osea como admision genera fichas programadas pero ya tendra ficha presencial volvera a generar gichas para ese paciente aunque tenga la presencial eso tomar en cuenta

si programo 2 citas de diferentes vacunas para el mismo dia como se estan generando estas citas y como generan su ficha eso ver

npx playwright test --ui
