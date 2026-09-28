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
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field"
import { useStore } from "@/lib/store"
import { formatCurrency } from "@/lib/format"
import type { Textil } from "@/lib/types"
import { Plus, Pencil, Trash2, Shirt } from "lucide-react"
import { toast } from "sonner"

export default function TextilesPage() {
  const { textiles, addTextil, updateTextil, deleteTextil } = useStore()
  const [isOpen, setIsOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    tipo: "",
    cantidad: 1,
    precioUnitario: 0,
    vidaUtilMeses: 12,
  })

  const totalMensual = textiles.reduce((sum, t) => sum + t.costoMensual, 0)
  const totalInversion = textiles.reduce((sum, t) => sum + t.total, 0)

  const handleSubmit = () => {
    if (!formData.tipo || formData.precioUnitario <= 0 || formData.cantidad <= 0) {
      toast.error("Por favor complete todos los campos correctamente")
      return
    }

    if (editingId) {
      updateTextil(editingId, formData)
      toast.success("Textil actualizado correctamente")
    } else {
      addTextil(formData)
      toast.success("Textil agregado correctamente")
    }

    setIsOpen(false)
    resetForm()
  }

  const handleEdit = (textil: Textil) => {
    setEditingId(textil.id)
    setFormData({
      tipo: textil.tipo,
      cantidad: textil.cantidad,
      precioUnitario: textil.precioUnitario,
      vidaUtilMeses: textil.vidaUtilMeses,
    })
    setIsOpen(true)
  }

  const handleDelete = (id: string) => {
    deleteTextil(id)
    toast.success("Textil eliminado correctamente")
  }

  const resetForm = () => {
    setEditingId(null)
    setFormData({
      tipo: "",
      cantidad: 1,
      precioUnitario: 0,
      vidaUtilMeses: 12,
    })
  }

  const calculatedTotal = formData.cantidad * formData.precioUnitario
  const calculatedMensual = formData.vidaUtilMeses > 0 ? Math.round(calculatedTotal / formData.vidaUtilMeses) : 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Reposicion de Textiles</h1>
          <p className="text-muted-foreground">Gestiona sabanas, toallas, batas y pantuflas</p>
        </div>
        <Dialog open={isOpen} onOpenChange={(open) => {
          setIsOpen(open)
          if (!open) resetForm()
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Agregar Textil
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? "Editar Textil" : "Nuevo Textil"}</DialogTitle>
              <DialogDescription>
                {editingId
                  ? "Modifica los datos del textil"
                  : "El costo mensual se calculara automaticamente"}
              </DialogDescription>
            </DialogHeader>
            <FieldGroup>
              <Field>
                <FieldLabel>Tipo de Textil</FieldLabel>
                <Input
                  value={formData.tipo}
                  onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                  placeholder="Ej: Sabanas, Toallas grandes"
                />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel>Cantidad</FieldLabel>
                  <Input
                    type="number"
                    value={formData.cantidad || ""}
                    onChange={(e) => setFormData({ ...formData, cantidad: Number(e.target.value) })}
                    placeholder="1"
                    min={1}
                  />
                </Field>
                <Field>
                  <FieldLabel>Precio Unitario (CUP)</FieldLabel>
                  <Input
                    type="number"
                    value={formData.precioUnitario || ""}
                    onChange={(e) => setFormData({ ...formData, precioUnitario: Number(e.target.value) })}
                    placeholder="0"
                  />
                </Field>
              </div>
              <Field>
                <FieldLabel>Vida Util (meses)</FieldLabel>
                <Input
                  type="number"
                  value={formData.vidaUtilMeses || ""}
                  onChange={(e) => setFormData({ ...formData, vidaUtilMeses: Number(e.target.value) })}
                  placeholder="12"
                  min={1}
                  max={60}
                />
              </Field>
              {calculatedTotal > 0 && (
                <div className="rounded-lg bg-muted p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Total inversion:</span>
                    <span className="font-medium">{formatCurrency(calculatedTotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Costo mensual:</span>
                    <span className="text-lg font-bold">{formatCurrency(calculatedMensual)}</span>
                  </div>
                </div>
              )}
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

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Inversion</CardTitle>
            <Shirt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalInversion)}</div>
            <p className="text-xs text-muted-foreground">Valor total de textiles</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Costo Mensual</CardTitle>
            <Shirt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalMensual)}</div>
            <p className="text-xs text-muted-foreground">Reposicion prorrateada</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Tipos de Textiles</CardTitle>
            <Shirt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{textiles.length}</div>
            <p className="text-xs text-muted-foreground">Total registrados</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Textiles</CardTitle>
          <CardDescription>Formula: Costo Mensual = Total / Vida Util (meses)</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tipo</TableHead>
                <TableHead className="text-right">Cantidad</TableHead>
                <TableHead className="text-right">Precio Unit.</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Vida Util</TableHead>
                <TableHead className="text-right">Mensual</TableHead>
                <TableHead className="w-[100px]">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {textiles.map((textil) => (
                <TableRow key={textil.id}>
                  <TableCell className="font-medium">{textil.tipo}</TableCell>
                  <TableCell className="text-right">{textil.cantidad}</TableCell>
                  <TableCell className="text-right">{formatCurrency(textil.precioUnitario)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(textil.total)}</TableCell>
                  <TableCell className="text-right">{textil.vidaUtilMeses} meses</TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(textil.costoMensual)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(textil)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(textil.id)}
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
