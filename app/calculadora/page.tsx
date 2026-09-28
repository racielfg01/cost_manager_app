"use client"

import { useState, useMemo } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useStore } from "@/lib/store"
import { formatCurrency, formatNumber, formatPercent } from "@/lib/format"
import { CATEGORIAS_INSUMO } from "@/lib/types"
import { Calculator, Plus, Trash2, TrendingUp } from "lucide-react"

interface InsumoSeleccionado {
  insumoId: string
  cantidad: number
}

export default function CalculadoraPage() {
  const { insumos, servicios } = useStore()
  const [servicioSeleccionado, setServicioSeleccionado] = useState<string>("")
  const [duracionMinutos, setDuracionMinutos] = useState(60)
  const [tarifaHora, setTarifaHora] = useState(500)
  const [insumosSeleccionados, setInsumosSeleccionados] = useState<InsumoSeleccionado[]>([])
  const [costosIndirectos, setCostosIndirectos] = useState(15)
  const [margenUtilidad, setMargenUtilidad] = useState(40)

  const servicio = useMemo(() => {
    return servicios.find((s) => s.id === servicioSeleccionado)
  }, [servicios, servicioSeleccionado])

  const handleServicioChange = (id: string) => {
    setServicioSeleccionado(id)
    const serv = servicios.find((s) => s.id === id)
    if (serv) {
      setDuracionMinutos(serv.duracionMinutos)
      setTarifaHora(serv.tarifaHora)
      setCostosIndirectos(serv.costosIndirectosPorcentaje)
      setMargenUtilidad(serv.margenUtilidad)
      setInsumosSeleccionados(
        serv.insumosRequeridos.map((i) => ({
          insumoId: i.insumoId,
          cantidad: i.cantidad,
        }))
      )
    }
  }

  const addInsumo = () => {
    setInsumosSeleccionados([...insumosSeleccionados, { insumoId: "", cantidad: 1 }])
  }

  const removeInsumo = (index: number) => {
    setInsumosSeleccionados(insumosSeleccionados.filter((_, i) => i !== index))
  }

  const updateInsumo = (index: number, field: keyof InsumoSeleccionado, value: string | number) => {
    const updated = [...insumosSeleccionados]
    updated[index] = { ...updated[index], [field]: value }
    setInsumosSeleccionados(updated)
  }

  const calculos = useMemo(() => {
    // Costo de insumos
    const costoInsumos = insumosSeleccionados.reduce((total, sel) => {
      const insumo = insumos.find((i) => i.id === sel.insumoId)
      if (!insumo || insumo.esReutilizable) return total
      return total + insumo.costoUnitario * sel.cantidad
    }, 0)

    // Costo de mano de obra
    const costoManoObra = (duracionMinutos / 60) * tarifaHora

    // Costos directos
    const costosDirectos = costoInsumos + costoManoObra

    // Costos indirectos
    const valorCostosIndirectos = costosDirectos * (costosIndirectos / 100)

    // Costo total
    const costoTotal = costosDirectos + valorCostosIndirectos

    // Precio sugerido
    const precioSugerido = costoTotal / (1 - margenUtilidad / 100)

    // Utilidad
    const utilidad = precioSugerido - costoTotal

    return {
      costoInsumos,
      costoManoObra,
      costosDirectos,
      valorCostosIndirectos,
      costoTotal,
      precioSugerido,
      utilidad,
    }
  }, [insumosSeleccionados, insumos, duracionMinutos, tarifaHora, costosIndirectos, margenUtilidad])

  const getInsumoInfo = (insumoId: string) => {
    return insumos.find((i) => i.id === insumoId)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Calculadora de Costos</h1>
        <p className="text-muted-foreground">Calcula el costo y precio sugerido por servicio</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Configuracion */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuracion del Servicio</CardTitle>
              <CardDescription>Selecciona un servicio predefinido o configura manualmente</CardDescription>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                <Field>
                  <FieldLabel>Servicio Predefinido</FieldLabel>
                  <Select value={servicioSeleccionado} onValueChange={handleServicioChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar servicio..." />
                    </SelectTrigger>
                    <SelectContent>
                      {servicios.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>

                <div className="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel>Duracion (minutos)</FieldLabel>
                    <Input
                      type="number"
                      value={duracionMinutos}
                      onChange={(e) => setDuracionMinutos(Number(e.target.value))}
                      min={1}
                    />
                  </Field>
                  <Field>
                    <FieldLabel>Tarifa por Hora (CUP)</FieldLabel>
                    <Input
                      type="number"
                      value={tarifaHora}
                      onChange={(e) => setTarifaHora(Number(e.target.value))}
                      min={0}
                    />
                  </Field>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel>Costos Indirectos (%)</FieldLabel>
                    <Input
                      type="number"
                      value={costosIndirectos}
                      onChange={(e) => setCostosIndirectos(Number(e.target.value))}
                      min={0}
                      max={100}
                    />
                  </Field>
                  <Field>
                    <FieldLabel>Margen de Utilidad (%)</FieldLabel>
                    <Input
                      type="number"
                      value={margenUtilidad}
                      onChange={(e) => setMargenUtilidad(Number(e.target.value))}
                      min={0}
                      max={100}
                    />
                  </Field>
                </div>
              </FieldGroup>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Insumos Utilizados</CardTitle>
                <CardDescription>Productos consumidos en el servicio</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={addInsumo}>
                <Plus className="mr-2 h-4 w-4" />
                Agregar
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {insumosSeleccionados.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No hay insumos seleccionados
                  </p>
                ) : (
                  insumosSeleccionados.map((sel, index) => {
                    const insumo = getInsumoInfo(sel.insumoId)
                    return (
                      <div key={index} className="flex items-center gap-3">
                        <Select
                          value={sel.insumoId}
                          onValueChange={(v) => updateInsumo(index, "insumoId", v)}
                        >
                          <SelectTrigger className="flex-1">
                            <SelectValue placeholder="Seleccionar insumo..." />
                          </SelectTrigger>
                          <SelectContent>
                            {CATEGORIAS_INSUMO.map((cat) => {
                              const catInsumos = insumos.filter((i) => i.categoria === cat.value)
                              if (catInsumos.length === 0) return null
                              return (
                                <div key={cat.value}>
                                  <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                                    {cat.label}
                                  </div>
                                  {catInsumos.map((i) => (
                                    <SelectItem key={i.id} value={i.id}>
                                      {i.producto} ({formatNumber(i.costoUnitario)}/{i.unidad})
                                    </SelectItem>
                                  ))}
                                </div>
                              )
                            })}
                          </SelectContent>
                        </Select>
                        <Input
                          type="number"
                          value={sel.cantidad}
                          onChange={(e) => updateInsumo(index, "cantidad", Number(e.target.value))}
                          className="w-24"
                          min={0}
                        />
                        {insumo && (
                          <span className="text-sm text-muted-foreground w-16">
                            {insumo.unidad}
                          </span>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeInsumo(index)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Resultados */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Desglose de Costos
              </CardTitle>
              <CardDescription>Calculo automatico del costo total</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Costo de Insumos</span>
                  <span>{formatCurrency(calculos.costoInsumos)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Mano de Obra ({duracionMinutos} min x {formatCurrency(tarifaHora)}/hr)
                  </span>
                  <span>{formatCurrency(calculos.costoManoObra)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-medium">
                  <span>Costos Directos</span>
                  <span>{formatCurrency(calculos.costosDirectos)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Costos Indirectos ({formatPercent(costosIndirectos)})
                  </span>
                  <span>{formatCurrency(calculos.valorCostosIndirectos)}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>COSTO TOTAL</span>
                  <span>{formatCurrency(calculos.costoTotal)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Precio Sugerido
              </CardTitle>
              <CardDescription>Basado en el margen de utilidad del {formatPercent(margenUtilidad)}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-4xl font-bold text-center py-4">
                {formatCurrency(calculos.precioSugerido)}
              </div>
              <Separator />
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-sm text-muted-foreground">Costo Total</p>
                  <p className="font-semibold">{formatCurrency(calculos.costoTotal)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Utilidad</p>
                  <p className="font-semibold text-green-600">{formatCurrency(calculos.utilidad)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {servicio && (
            <Card>
              <CardHeader>
                <CardTitle>Informacion del Servicio</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Nombre</span>
                    <span className="font-medium">{servicio.nombre}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Categoria</span>
                    <Badge variant="secondary">
                      {CATEGORIAS_INSUMO.find((c) => c.value === servicio.categoria)?.label || servicio.categoria}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Duracion</span>
                    <span>{servicio.duracionMinutos} minutos</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
