"use client"

import { useState } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field"
import { Badge } from "@/components/ui/badge"
import { useStore } from "@/lib/store"
import { formatCurrency } from "@/lib/format"
import { CATEGORIAS_COSTO, PERIODICIDADES, type CostoFijo } from "@/lib/types"
import { Plus, Pencil, Trash2 } from "lucide-react"
import { toast } from "sonner"

export default function CostosFijosPage() {
  const { costosFijos, addCostoFijo, updateCostoFijo, deleteCostoFijo } = useStore()
  const [isOpen, setIsOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<Omit<CostoFijo, "id">>({
    concepto: "",
    monto: 0,
    detalle: "",
    periodicidad: "mensual",
    categoria: "alquiler",
  })

  const totalMensual = costosFijos.reduce((sum, c) => {
    if (c.periodicidad === "mensual") return sum + c.monto
    if (c.periodicidad === "trimestral") return sum + c.monto / 3
    return sum + c.monto / 12
  }, 0)

  const handleSubmit = () => {
    if (!formData.concepto || formData.monto <= 0) {
      toast.error("Por favor complete todos los campos requeridos")
      return
    }

    if (editingId) {
      updateCostoFijo(editingId, formData)
      toast.success("Costo actualizado correctamente")
    } else {
      addCostoFijo(formData)
      toast.success("Costo agregado correctamente")
    }

    setIsOpen(false)
    resetForm()
  }

  const handleEdit = (costo: CostoFijo) => {
    setEditingId(costo.id)
    setFormData({
      concepto: costo.concepto,
      monto: costo.monto,
      detalle: costo.detalle,
      periodicidad: costo.periodicidad,
      categoria: costo.categoria,
    })
    setIsOpen(true)
  }

  const handleDelete = (id: string) => {
    deleteCostoFijo(id)
    toast.success("Costo eliminado correctamente")
  }

  const resetForm = () => {
    setEditingId(null)
    setFormData({
      concepto: "",
      monto: 0,
      detalle: "",
      periodicidad: "mensual",
      categoria: "alquiler",
    })
  }

  const getCategoriaLabel = (value: string) => {
    return CATEGORIAS_COSTO.find((c) => c.value === value)?.label || value
  }

  const getPeriodicidadLabel = (value: string) => {
    return PERIODICIDADES.find((p) => p.value === value)?.label || value
  }

  const getMontoMensual = (costo: CostoFijo) => {
    if (costo.periodicidad === "mensual") return costo.monto
    if (costo.periodicidad === "trimestral") return Math.round(costo.monto / 3)
    return Math.round(costo.monto / 12)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Costos Fijos</h1>
          <p className="text-muted-foreground">Gestiona los gastos recurrentes del negocio</p>
        </div>
        <Dialog open={isOpen} onOpenChange={(open) => {
          setIsOpen(open)
          if (!open) resetForm()
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Agregar Costo
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? "Editar Costo" : "Nuevo Costo Fijo"}</DialogTitle>
              <DialogDescription>
                {editingId
                  ? "Modifica los datos del costo fijo"
                  : "Agrega un nuevo costo fijo al sistema"}
              </DialogDescription>
            </DialogHeader>
            <FieldGroup>
              <Field>
                <FieldLabel>Concepto</FieldLabel>
                <Input
                  value={formData.concepto}
                  onChange={(e) => setFormData({ ...formData, concepto: e.target.value })}
                  placeholder="Ej: Alquiler del local"
                />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel>Monto (CUP)</FieldLabel>
                  <Input
                    type="number"
                    value={formData.monto || ""}
                    onChange={(e) => setFormData({ ...formData, monto: Number(e.target.value) })}
                    placeholder="0"
                  />
                </Field>
                <Field>
                  <FieldLabel>Periodicidad</FieldLabel>
                  <Select
                    value={formData.periodicidad}
                    onValueChange={(value: CostoFijo["periodicidad"]) =>
                      setFormData({ ...formData, periodicidad: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PERIODICIDADES.map((p) => (
                        <SelectItem key={p.value} value={p.value}>
                          {p.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              </div>
              <Field>
                <FieldLabel>Categoria</FieldLabel>
                <Select
                  value={formData.categoria}
                  onValueChange={(value: CostoFijo["categoria"]) =>
                    setFormData({ ...formData, categoria: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIAS_COSTO.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field>
                <FieldLabel>Detalle / Calculo</FieldLabel>
                <Textarea
                  value={formData.detalle}
                  onChange={(e) => setFormData({ ...formData, detalle: e.target.value })}
                  placeholder="Descripcion o formula de calculo"
                  rows={3}
                />
              </Field>
            </FieldGroup>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSubmit}>
                {editingId ? "Actualizar" : "Agregar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Total Mensual</CardTitle>
          <CardDescription>Suma de todos los costos fijos prorrateados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{formatCurrency(totalMensual)}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Costos Fijos</CardTitle>
          <CardDescription>{costosFijos.length} registros</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Concepto</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Periodicidad</TableHead>
                <TableHead className="text-right">Monto</TableHead>
                <TableHead className="text-right">Mensual</TableHead>
                <TableHead className="w-[100px]">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {costosFijos.map((costo) => (
                <TableRow key={costo.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{costo.concepto}</div>
                      {costo.detalle && (
                        <div className="text-sm text-muted-foreground">{costo.detalle}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{getCategoriaLabel(costo.categoria)}</Badge>
                  </TableCell>
                  <TableCell>{getPeriodicidadLabel(costo.periodicidad)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(costo.monto)}</TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(getMontoMensual(costo))}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(costo)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(costo.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
