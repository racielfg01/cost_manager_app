export interface CostoFijo {
  id: string
  concepto: string
  monto: number
  detalle: string
  periodicidad: "mensual" | "trimestral" | "anual"
  categoria: "alquiler" | "servicios" | "personal" | "suministros" | "depreciacion"
}

export interface Equipo {
  id: string
  nombre: string
  costoTotal: number
  vidaUtilAnios: number
  depreciacionMensual: number
  fechaCompra?: string
}

export interface Textil {
  id: string
  tipo: string
  cantidad: number
  precioUnitario: number
  total: number
  vidaUtilMeses: number
  costoMensual: number
}

export interface Insumo {
  id: string
  categoria: "masajes" | "depilacion" | "facial" | "podologia" | "terapias" | "antialopecia" | "atencion_cliente"
  producto: string
  presentacion: string
  costo: number
  costoUnitario: number
  unidad: string
  stock: number
  stockMinimo: number
  esReutilizable: boolean
}

export interface Servicio {
  id: string
  nombre: string
  categoria: string
  duracionMinutos: number
  tarifaHora: number
  insumosRequeridos: { insumoId: string; cantidad: number }[]
  costosIndirectosPorcentaje: number
  margenUtilidad: number
}

export type CategoriaInsumo = Insumo["categoria"]

export const CATEGORIAS_INSUMO: { value: CategoriaInsumo; label: string }[] = [
  { value: "masajes", label: "Masajes" },
  { value: "depilacion", label: "Depilacion" },
  { value: "facial", label: "Facial" },
  { value: "podologia", label: "Podologia" },
  { value: "terapias", label: "Terapias" },
  { value: "antialopecia", label: "Antialopecia" },
  { value: "atencion_cliente", label: "Atencion al Cliente" },
]

export const CATEGORIAS_COSTO: { value: CostoFijo["categoria"]; label: string }[] = [
  { value: "alquiler", label: "Alquiler" },
  { value: "servicios", label: "Servicios" },
  { value: "personal", label: "Personal" },
  { value: "suministros", label: "Suministros" },
  { value: "depreciacion", label: "Depreciacion" },
]

export const PERIODICIDADES: { value: CostoFijo["periodicidad"]; label: string }[] = [
  { value: "mensual", label: "Mensual" },
  { value: "trimestral", label: "Trimestral" },
  { value: "anual", label: "Anual" },
]
