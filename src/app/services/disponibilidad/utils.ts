// oxlint-disable prefer-default-export
// oxlint-disable no-unused-vars
const transformEspecilidadData = (data: any[]) => {
  const especialidades = data?.map((especilidad: any) => ({
    id: especilidad.id,
    nombre: especilidad.nombre,
    doctores: especilidad.doctores_especialidades.map((docEsp: any) => {
      const capacidadActual = docEsp.disponibilidades.reduce(
        (total: number, disp: any) => total + disp._count.fichas,
        0
      )

      const capacidadMaxima = docEsp.disponibilidades.reduce(
        (total: number, disp: any) => total + (disp.cupos || 0),
        0
      )

      return {
        id: docEsp.doctores.doctor_id,
        nombre:
          `${docEsp.doctores.personas.nombres} ${docEsp.doctores.personas.paterno || ''} ${docEsp.doctores.personas.materno || ''}`.trim(),
        capacidadActual: capacidadActual,
        capacidadMaxima
      }
    })
  }))

  return especialidades
}

export { transformEspecilidadData }
