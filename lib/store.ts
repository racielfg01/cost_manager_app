"use client"

import { create } from "zustand"
import type { CostoFijo, Equipo, Textil, Insumo, Servicio } from "./types"
import {
  costosFijos as initialCostosFijos,
  equipos as initialEquipos,
  textiles as initialTextiles,
  insumos as initialInsumos,
  servicios as initialServicios,
} from "./mock-data"

interface StoreState {
  costosFijos: CostoFijo[]
  equipos: Equipo[]
  textiles: Textil[]
  insumos: Insumo[]
  servicios: Servicio[]
  
  // Costos Fijos
  addCostoFijo: (costo: Omit<CostoFijo, "id">) => void
  updateCostoFijo: (id: string, costo: Partial<CostoFijo>) => void
  deleteCostoFijo: (id: string) => void
  
  // Equipos
  addEquipo: (equipo: Omit<Equipo, "id" | "depreciacionMensual">) => void
  updateEquipo: (id: string, equipo: Partial<Equipo>) => void
  deleteEquipo: (id: string) => void
  
  // Textiles
  addTextil: (textil: Omit<Textil, "id" | "total" | "costoMensual">) => void
  updateTextil: (id: string, textil: Partial<Textil>) => void
  deleteTextil: (id: string) => void
  
  // Insumos
  addInsumo: (insumo: Omit<Insumo, "id">) => void
  updateInsumo: (id: string, insumo: Partial<Insumo>) => void
  deleteInsumo: (id: string) => void
  
  // Servicios
  addServicio: (servicio: Omit<Servicio, "id">) => void
  updateServicio: (id: string, servicio: Partial<Servicio>) => void
  deleteServicio: (id: string) => void
}

const generateId = () => Math.random().toString(36).substring(2, 9)

export const useStore = create<StoreState>((set) => ({
  costosFijos: initialCostosFijos,
  equipos: initialEquipos,
  textiles: initialTextiles,
  insumos: initialInsumos,
  servicios: initialServicios,
  
  // Costos Fijos
  addCostoFijo: (costo) =>
    set((state) => ({
      costosFijos: [...state.costosFijos, { ...costo, id: generateId() }],
    })),
  updateCostoFijo: (id, costo) =>
    set((state) => ({
      costosFijos: state.costosFijos.map((c) =>
        c.id === id ? { ...c, ...costo } : c
      ),
    })),
  deleteCostoFijo: (id) =>
    set((state) => ({
      costosFijos: state.costosFijos.filter((c) => c.id !== id),
    })),
  
  // Equipos
  addEquipo: (equipo) =>
    set((state) => ({
      equipos: [
        ...state.equipos,
        {
          ...equipo,
          id: generateId(),
          depreciacionMensual: Math.round(equipo.costoTotal / (equipo.vidaUtilAnios * 12)),
        },
      ],
    })),
  updateEquipo: (id, equipo) =>
    set((state) => ({
      equipos: state.equipos.map((e) => {
        if (e.id !== id) return e
        const updated = { ...e, ...equipo }
        return {
          ...updated,
          depreciacionMensual: Math.round(updated.costoTotal / (updated.vidaUtilAnios * 12)),
        }
      }),
    })),
  deleteEquipo: (id) =>
    set((state) => ({
      equipos: state.equipos.filter((e) => e.id !== id),
    })),
  
  // Textiles
  addTextil: (textil) =>
    set((state) => {
      const total = textil.cantidad * textil.precioUnitario
      return {
        textiles: [
          ...state.textiles,
          {
            ...textil,
            id: generateId(),
            total,
            costoMensual: Math.round(total / textil.vidaUtilMeses),
          },
        ],
      }
    }),
  updateTextil: (id, textil) =>
    set((state) => ({
      textiles: state.textiles.map((t) => {
        if (t.id !== id) return t
        const updated = { ...t, ...textil }
        const total = updated.cantidad * updated.precioUnitario
        return {
          ...updated,
          total,
          costoMensual: Math.round(total / updated.vidaUtilMeses),
        }
      }),
    })),
  deleteTextil: (id) =>
    set((state) => ({
      textiles: state.textiles.filter((t) => t.id !== id),
    })),
  
  // Insumos
  addInsumo: (insumo) =>
    set((state) => ({
      insumos: [...state.insumos, { ...insumo, id: generateId() }],
    })),
  updateInsumo: (id, insumo) =>
    set((state) => ({
      insumos: state.insumos.map((i) =>
        i.id === id ? { ...i, ...insumo } : i
      ),
    })),
  deleteInsumo: (id) =>
    set((state) => ({
      insumos: state.insumos.filter((i) => i.id !== id),
    })),
  
  // Servicios
  addServicio: (servicio) =>
    set((state) => ({
      servicios: [...state.servicios, { ...servicio, id: generateId() }],
    })),
  updateServicio: (id, servicio) =>
    set((state) => ({
      servicios: state.servicios.map((s) =>
        s.id === id ? { ...s, ...servicio } : s
      ),
    })),
  deleteServicio: (id) =>
    set((state) => ({
      servicios: state.servicios.filter((s) => s.id !== id),
    })),
}))
