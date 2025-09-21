// oxlint-disable prefer-default-export
// oxlint-disable no-unused-vars
const transformEspecilidadData = (data: any[]) => {
  const especialidades = data.map((especilidad: any) => ({
    id: especilidad.id,
    nombre: especilidad.nombre,
    doctores: especilidad.doctores_especialidades
  }))
}

export { transformEspecilidadData }
