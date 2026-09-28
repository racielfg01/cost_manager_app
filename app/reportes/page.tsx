"use client"

import { useMemo } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useStore } from "@/lib/store"
import { formatCurrency, formatNumber } from "@/lib/format"
import { CATEGORIAS_INSUMO, CATEGORIAS_COSTO } from "@/lib/types"
import {
  FileDown,
  FileSpreadsheet,
  TrendingUp,
  Target,
  DollarSign,
  BarChart3,
} from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts"

const COLORS = ["#0f172a", "#334155", "#64748b", "#94a3b8", "#cbd5e1", "#e2e8f0"]

export default function ReportesPage() {
  const { costosFijos, equipos, textiles, insumos, servicios } = useStore()

  const totals = useMemo(() => {
    const totalCostosFijos = costosFijos.reduce((sum, c) => {
      if (c.periodicidad === "mensual") return sum + c.monto
      if (c.periodicidad === "trimestral") return sum + c.monto / 3
      return sum + c.monto / 12
    }, 0)

    const totalDepreciacion = equipos.reduce((sum, e) => sum + e.depreciacionMensual, 0)
    const totalTextiles = textiles.reduce((sum, t) => sum + t.costoMensual, 0)
    const valorInventario = insumos.reduce((sum, i) => sum + i.costo * i.stock, 0)
    const totalMensual = totalCostosFijos + totalDepreciacion + totalTextiles

    return {
      totalCostosFijos,
      totalDepreciacion,
      totalTextiles,
      totalMensual,
      valorInventario,
    }
  }, [costosFijos, equipos, textiles, insumos])

  const costosPorCategoria = useMemo(() => {
    const categorias: Record<string, number> = {}
    costosFijos.forEach((c) => {
      const monto =
        c.periodicidad === "mensual"
          ? c.monto
          : c.periodicidad === "trimestral"
          ? c.monto / 3
          : c.monto / 12
      categorias[c.categoria] = (categorias[c.categoria] || 0) + monto
    })
    return Object.entries(categorias).map(([name, value]) => ({
      name: CATEGORIAS_COSTO.find((c) => c.value === name)?.label || name,
      value: Math.round(value),
    }))
  }, [costosFijos])

  const rentabilidadServicios = useMemo(() => {
    return servicios.map((servicio) => {
      const costoInsumos = servicio.insumosRequeridos.reduce((total, req) => {
        const insumo = insumos.find((i) => i.id === req.insumoId)
        if (!insumo || insumo.esReutilizable) return total
        return total + insumo.costoUnitario * req.cantidad
      }, 0)

      const costoManoObra = (servicio.duracionMinutos / 60) * servicio.tarifaHora
      const costosDirectos = costoInsumos + costoManoObra
      const valorCostosIndirectos = costosDirectos * (servicio.costosIndirectosPorcentaje / 100)
      const costoTotal = costosDirectos + valorCostosIndirectos
      const precioSugerido = costoTotal / (1 - servicio.margenUtilidad / 100)
      const utilidad = precioSugerido - costoTotal

      return {
        nombre: servicio.nombre,
        categoria: servicio.categoria,
        costoTotal: Math.round(costoTotal),
        precioSugerido: Math.round(precioSugerido),
        utilidad: Math.round(utilidad),
        margen: servicio.margenUtilidad,
      }
    })
  }, [servicios, insumos])

  const puntoEquilibrio = useMemo(() => {
    const costosFijosTotal = totals.totalMensual
    const promedioUtilidad =
      rentabilidadServicios.reduce((sum, s) => sum + s.utilidad, 0) / rentabilidadServicios.length || 1

    return Math.ceil(costosFijosTotal / promedioUtilidad)
  }, [totals.totalMensual, rentabilidadServicios])

  const exportToCSV = (data: Record<string, unknown>[], filename: string) => {
    if (data.length === 0) return

    const headers = Object.keys(data[0])
    const csvContent = [
      headers.join(","),
      ...data.map((row) =>
        headers.map((h) => {
          const value = row[h]
          return typeof value === "string" && value.includes(",") ? `"${value}"` : value
        }).join(",")
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = `${filename}.csv`
    link.click()
  }

  const exportCostosFijos = () => {
    const data = costosFijos.map((c) => ({
      Concepto: c.concepto,
      Categoria: CATEGORIAS_COSTO.find((cat) => cat.value === c.categoria)?.label || c.categoria,
      Periodicidad: c.periodicidad,
      Monto: c.monto,
      "Monto Mensual":
        c.periodicidad === "mensual" ? c.monto : c.periodicidad === "trimestral" ? Math.round(c.monto / 3) : Math.round(c.monto / 12),
    }))
    exportToCSV(data, "costos_fijos")
  }

  const exportInventario = () => {
    const data = insumos.map((i) => ({
      Categoria: CATEGORIAS_INSUMO.find((c) => c.value === i.categoria)?.label || i.categoria,
      Producto: i.producto,
      Presentacion: i.presentacion,
      Costo: i.costo,
      "Costo Unitario": i.costoUnitario,
      Unidad: i.unidad,
      Stock: i.stock,
      "Stock Minimo": i.stockMinimo,
      Reutilizable: i.esReutilizable ? "Si" : "No",
    }))
    exportToCSV(data, "inventario_insumos")
  }

  const exportEquipos = () => {
    const data = equipos.map((e) => ({
      Equipo: e.nombre,
      "Costo Total": e.costoTotal,
      "Vida Util (anos)": e.vidaUtilAnios,
      "Depreciacion Mensual": e.depreciacionMensual,
    }))
    exportToCSV(data, "depreciacion_equipos")
  }

  const exportRentabilidad = () => {
    const data = rentabilidadServicios.map((s) => ({
      Servicio: s.nombre,
      Categoria: CATEGORIAS_INSUMO.find((c) => c.value === s.categoria)?.label || s.categoria,
      "Costo Total": s.costoTotal,
      "Precio Sugerido": s.precioSugerido,
      Utilidad: s.utilidad,
      "Margen (%)": s.margen,
    }))
    exportToCSV(data, "rentabilidad_servicios")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Reportes</h1>
          <p className="text-muted-foreground">Analisis financiero y exportacion de datos</p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Costos Mensuales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totals.totalMensual)}</div>
            <p className="text-xs text-muted-foreground">Total de gastos fijos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Punto de Equilibrio</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{puntoEquilibrio}</div>
            <p className="text-xs text-muted-foreground">Servicios/mes para cubrir costos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Margen Promedio</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(
                rentabilidadServicios.reduce((sum, s) => sum + s.margen, 0) / rentabilidadServicios.length || 0,
                0
              )}%
            </div>
            <p className="text-xs text-muted-foreground">En todos los servicios</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Valor Inventario</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totals.valorInventario)}</div>
            <p className="text-xs text-muted-foreground">{insumos.length} productos</p>
          </CardContent>
        </Card>
      </div>

      {/* Exportacion */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Exportar Datos
          </CardTitle>
          <CardDescription>Descarga los datos en formato CSV</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" onClick={exportCostosFijos}>
              <FileDown className="mr-2 h-4 w-4" />
              Costos Fijos
            </Button>
            <Button variant="outline" onClick={exportEquipos}>
              <FileDown className="mr-2 h-4 w-4" />
              Depreciacion Equipos
            </Button>
            <Button variant="outline" onClick={exportInventario}>
              <FileDown className="mr-2 h-4 w-4" />
              Inventario
            </Button>
            <Button variant="outline" onClick={exportRentabilidad}>
              <FileDown className="mr-2 h-4 w-4" />
              Rentabilidad
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Distribucion de Costos Fijos</CardTitle>
            <CardDescription>Por categoria de gasto</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={costosPorCategoria}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {costosPorCategoria.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0" }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Rentabilidad por Servicio</CardTitle>
            <CardDescription>Costo vs Precio Sugerido</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={rentabilidadServicios} layout="vertical">
                  <XAxis type="number" tickFormatter={(v) => `${v / 1000}k`} />
                  <YAxis
                    dataKey="nombre"
                    type="category"
                    width={120}
                    tick={{ fontSize: 11 }}
                  />
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0" }}
                  />
                  <Legend />
                  <Bar dataKey="costoTotal" name="Costo" fill="#94a3b8" radius={[0, 2, 2, 0]} />
                  <Bar dataKey="precioSugerido" name="Precio" fill="#0f172a" radius={[0, 2, 2, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabla de Rentabilidad */}
      <Card>
        <CardHeader>
          <CardTitle>Analisis de Rentabilidad por Servicio</CardTitle>
          <CardDescription>Desglose completo de costos y margenes</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Servicio</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead className="text-right">Costo Total</TableHead>
                <TableHead className="text-right">Precio Sugerido</TableHead>
                <TableHead className="text-right">Utilidad</TableHead>
                <TableHead className="text-right">Margen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rentabilidadServicios.map((servicio, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{servicio.nombre}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {CATEGORIAS_INSUMO.find((c) => c.value === servicio.categoria)?.label || servicio.categoria}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">{formatCurrency(servicio.costoTotal)}</TableCell>
                  <TableCell className="text-right font-medium">{formatCurrency(servicio.precioSugerido)}</TableCell>
                  <TableCell className="text-right text-green-600">{formatCurrency(servicio.utilidad)}</TableCell>
                  <TableCell className="text-right">{servicio.margen}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Resumen Financiero */}
      <Card>
        <CardHeader>
          <CardTitle>Resumen Financiero Mensual</CardTitle>
          <CardDescription>Desglose de todos los costos operativos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Costos Fijos (alquiler, servicios, personal)</span>
              <span className="font-medium">{formatCurrency(totals.totalCostosFijos)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Depreciacion de Equipos</span>
              <span className="font-medium">{formatCurrency(totals.totalDepreciacion)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Reposicion de Textiles</span>
              <span className="font-medium">{formatCurrency(totals.totalTextiles)}</span>
            </div>
            <Separator />
            <div className="flex items-center justify-between text-lg font-bold">
              <span>TOTAL COSTOS MENSUALES</span>
              <span>{formatCurrency(totals.totalMensual)}</span>
            </div>
            <Separator />
            <div className="flex items-center justify-between text-muted-foreground">
              <span>Punto de equilibrio estimado</span>
              <span>{puntoEquilibrio} servicios/mes</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
