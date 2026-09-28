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
import type { Equipo } from "@/lib/types"
import { Plus, Pencil, Trash2, Cog } from "lucide-react"
import { toast } from "sonner"

export default function DepreciacionPage() {
  const { equipos, addEquipo, updateEquipo, deleteEquipo } = useStore()
  const [isOpen, setIsOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    nombre: "",
    costoTotal: 0,
    vidaUtilAnios: 5,
  })

  const totalDepreciacion = equipos.reduce((sum, e) => sum + e.depreciacionMensual, 0)
  const totalInversion = equipos.reduce((sum, e) => sum + e.costoTotal, 0)

  const handleSubmit = () => {
    if (!formData.nombre || formData.costoTotal <= 0 || formData.vidaUtilAnios <= 0) {
      toast.error("Por favor complete todos los campos correctamente")
      return
    }

    if (editingId) {
      updateEquipo(editingId, formData)
      toast.success("Equipo actualizado correctamente")
    } else {
      addEquipo(formData)
      toast.success("Equipo agregado correctamente")
    }

    setIsOpen(false)
    resetForm()
  }

  const handleEdit = (equipo: Equipo) => {
    setEditingId(equipo.id)
    setFormData({
      nombre: equipo.nombre,
      costoTotal: equipo.costoTotal,
      vidaUtilAnios: equipo.vidaUtilAnios,
    })
    setIsOpen(true)
  }

  const handleDelete = (id: string) => {
    deleteEquipo(id)
    toast.success("Equipo eliminado correctamente")
  }

  const resetForm = () => {
    setEditingId(null)
    setFormData({
      nombre: "",
      costoTotal: 0,
      vidaUtilAnios: 5,
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Depreciacion de Equipos</h1>
          <p className="text-muted-foreground">Gestiona el desgaste mensual del equipamiento</p>
        </div>
        <Dialog open={isOpen} onOpenChange={(open) => {
          setIsOpen(open)
          if (!open) resetForm()
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Agregar Equipo
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? "Editar Equipo" : "Nuevo Equipo"}</DialogTitle>
              <DialogDescription>
                {editingId
                  ? "Modifica los datos del equipo"
                  : "La depreciacion se calculara automaticamente"}
              </DialogDescription>
            </DialogHeader>
            <FieldGroup>
              <Field>
                <FieldLabel>Nombre del Equipo</FieldLabel>
                <Input
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  placeholder="Ej: Camilla de masaje"
                />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel>Costo Total (CUP)</FieldLabel>
                  <Input
                    type="number"
                    value={formData.costoTotal || ""}
                    onChange={(e) => setFormData({ ...formData, costoTotal: Number(e.target.value) })}
                    placeholder="0"
                  />
                </Field>
                <Field>
                  <FieldLabel>Vida Util (anos)</FieldLabel>
                  <Input
                    type="number"
                    value={formData.vidaUtilAnios || ""}
                    onChange={(e) => setFormData({ ...formData, vidaUtilAnios: Number(e.target.value) })}
                    placeholder="5"
                    min={1}
                    max={20}
                  />
                </Field>
              </div>
              {formData.costoTotal > 0 && formData.vidaUtilAnios > 0 && (
                <div className="rounded-lg bg-muted p-4">
                  <p className="text-sm text-muted-foreground">Depreciacion mensual calculada:</p>
                  <p className="text-xl font-bold">
                    {formatCurrency(Math.round(formData.costoTotal / (formData.vidaUtilAnios * 12)))}
                  </p>
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
            <Cog className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalInversion)}</div>
            <p className="text-xs text-muted-foreground">Valor total de equipos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Depreciacion Mensual</CardTitle>
            <Cog className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalDepreciacion)}</div>
            <p className="text-xs text-muted-foreground">Desgaste total mensual</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Equipos Registrados</CardTitle>
            <Cog className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{equipos.length}</div>
            <p className="text-xs text-muted-foreground">Total de activos</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Equipos</CardTitle>
          <CardDescription>Formula: Depreciacion = Costo / (Vida Util x 12)</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Equipo</TableHead>
                <TableHead className="text-right">Costo Total</TableHead>
                <TableHead className="text-right">Vida Util</TableHead>
                <TableHead className="text-right">Dep. Mensual</TableHead>
                <TableHead className="w-[100px]">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {equipos.map((equipo) => (
                <TableRow key={equipo.id}>
                  <TableCell className="font-medium">{equipo.nombre}</TableCell>
                  <TableCell className="text-right">{formatCurrency(equipo.costoTotal)}</TableCell>
                  <TableCell className="text-right">{equipo.vidaUtilAnios} anos</TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(equipo.depreciacionMensual)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(equipo)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(equipo.id)}
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
