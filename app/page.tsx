"use client"

import { useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useStore } from "@/lib/store"
import { formatCurrency } from "@/lib/format"
import { CATEGORIAS_INSUMO } from "@/lib/types"
import {
  DollarSign,
  TrendingDown,
  Package,
  AlertTriangle,
  Cog,
  Shirt,
} from "lucide-react"
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"

const COLORS = ["#0f172a", "#334155", "#64748b", "#94a3b8", "#cbd5e1", "#e2e8f0"]

export default function DashboardPage() {
  const { costosFijos, equipos, textiles, insumos } = useStore()

  const totals = useMemo(() => {
    const totalCostosFijos = costosFijos.reduce((sum, c) => {
      if (c.periodicidad === "mensual") return sum + c.monto
      if (c.periodicidad === "trimestral") return sum + c.monto / 3
      return sum + c.monto / 12
    }, 0)

    const totalDepreciacion = equipos.reduce((sum, e) => sum + e.depreciacionMensual, 0)
    const totalTextiles = textiles.reduce((sum, t) => sum + t.costoMensual, 0)
    const insumosStockBajo = insumos.filter((i) => i.stock <= i.stockMinimo)
    const valorInventario = insumos.reduce((sum, i) => sum + i.costo * i.stock, 0)

    return {
      totalCostosFijos,
      totalDepreciacion,
      totalTextiles,
      totalMensual: totalCostosFijos,
      insumosStockBajo,
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
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value: Math.round(value),
    }))
  }, [costosFijos])

  const insumosPorCategoria = useMemo(() => {
    return CATEGORIAS_INSUMO.map((cat) => ({
      name: cat.label,
      cantidad: insumos.filter((i) => i.categoria === cat.value).length,
      valor: insumos
        .filter((i) => i.categoria === cat.value)
        .reduce((sum, i) => sum + i.costo * i.stock, 0),
    }))
  }, [insumos])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Resumen de costos y gastos del negocio</p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Costos Fijos Mensuales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totals.totalMensual)}</div>
            <p className="text-xs text-muted-foreground">Total de gastos recurrentes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Depreciacion Equipos</CardTitle>
            <Cog className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totals.totalDepreciacion)}</div>
            <p className="text-xs text-muted-foreground">{equipos.length} equipos registrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Reposicion Textiles</CardTitle>
            <Shirt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totals.totalTextiles)}</div>
            <p className="text-xs text-muted-foreground">{textiles.length} tipos de textiles</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Valor Inventario</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totals.valorInventario)}</div>
            <p className="text-xs text-muted-foreground">{insumos.length} productos</p>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {totals.insumosStockBajo.length > 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-amber-800">
              <AlertTriangle className="h-5 w-5" />
              Alertas de Inventario
            </CardTitle>
            <CardDescription className="text-amber-700">
              Los siguientes productos necesitan reposicion
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {totals.insumosStockBajo.map((insumo) => (
                <Badge key={insumo.id} variant="outline" className="border-amber-300 bg-amber-100 text-amber-800">
                  {insumo.producto} (Stock: {insumo.stock})
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

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
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {costosPorCategoria.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Inventario por Categoria</CardTitle>
            <CardDescription>Valor total en stock</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={insumosPorCategoria} layout="vertical">
                  <XAxis type="number" tickFormatter={(v) => `${v / 1000}k`} />
                  <YAxis
                    dataKey="name"
                    type="category"
                    width={100}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0" }}
                  />
                  <Bar dataKey="valor" fill="#0f172a" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary Table */}
      <Card>
        <CardHeader>
          <CardTitle>Resumen Financiero Mensual</CardTitle>
          <CardDescription>Desglose de todos los costos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <span className="font-medium">Costos Fijos</span>
              <span>{formatCurrency(totals.totalCostosFijos)}</span>
            </div>
            <div className="flex items-center justify-between border-b pb-2">
              <span className="font-medium">Depreciacion de Equipos</span>
              <span>{formatCurrency(totals.totalDepreciacion)}</span>
            </div>
            <div className="flex items-center justify-between border-b pb-2">
              <span className="font-medium">Reposicion de Textiles</span>
              <span>{formatCurrency(totals.totalTextiles)}</span>
            </div>
            <div className="flex items-center justify-between pt-2">
              <span className="text-lg font-bold">TOTAL MENSUAL</span>
              <span className="text-lg font-bold">
                {formatCurrency(totals.totalCostosFijos + totals.totalDepreciacion + totals.totalTextiles)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
