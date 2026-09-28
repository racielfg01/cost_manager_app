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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { useStore } from "@/lib/store"
import { formatCurrency, formatNumber } from "@/lib/format"
import { CATEGORIAS_INSUMO, type Insumo, type CategoriaInsumo } from "@/lib/types"
import { Plus, Pencil, Trash2, Package, AlertTriangle, RefreshCw } from "lucide-react"
import { toast } from "sonner"

export default function InventarioPage() {
  const { insumos, addInsumo, updateInsumo, deleteInsumo } = useStore()
  const [isOpen, setIsOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [selectedCategoria, setSelectedCategoria] = useState<CategoriaInsumo | "all">("all")
  const [formData, setFormData] = useState<Omit<Insumo, "id">>({
    categoria: "masajes",
    producto: "",
    presentacion: "",
    costo: 0,
    costoUnitario: 0,
    unidad: "u",
    stock: 0,
    stockMinimo: 1,
    esReutilizable: false,
  })

  const filteredInsumos = useMemo(() => {
    if (selectedCategoria === "all") return insumos
    return insumos.filter((i) => i.categoria === selectedCategoria)
  }, [insumos, selectedCategoria])

  const stats = useMemo(() => {
    const stockBajo = insumos.filter((i) => i.stock <= i.stockMinimo)
    const valorTotal = insumos.reduce((sum, i) => sum + i.costo * i.stock, 0)
    const reutilizables = insumos.filter((i) => i.esReutilizable)
    return { stockBajo, valorTotal, reutilizables }
  }, [insumos])

  const handleSubmit = () => {
    if (!formData.producto || formData.costo <= 0) {
      toast.error("Por favor complete todos los campos requeridos")
      return
    }

    if (editingId) {
      updateInsumo(editingId, formData)
      toast.success("Insumo actualizado correctamente")
    } else {
      addInsumo(formData)
      toast.success("Insumo agregado correctamente")
    }

    setIsOpen(false)
    resetForm()
  }

  const handleEdit = (insumo: Insumo) => {
    setEditingId(insumo.id)
    setFormData({
      categoria: insumo.categoria,
      producto: insumo.producto,
      presentacion: insumo.presentacion,
      costo: insumo.costo,
      costoUnitario: insumo.costoUnitario,
      unidad: insumo.unidad,
      stock: insumo.stock,
      stockMinimo: insumo.stockMinimo,
      esReutilizable: insumo.esReutilizable,
    })
    setIsOpen(true)
  }

  const handleDelete = (id: string) => {
    deleteInsumo(id)
    toast.success("Insumo eliminado correctamente")
  }

  const resetForm = () => {
    setEditingId(null)
    setFormData({
      categoria: "masajes",
      producto: "",
      presentacion: "",
      costo: 0,
      costoUnitario: 0,
      unidad: "u",
      stock: 0,
      stockMinimo: 1,
      esReutilizable: false,
    })
  }

  const getCategoriaLabel = (value: string) => {
    return CATEGORIAS_INSUMO.find((c) => c.value === value)?.label || value
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Inventario de Insumos</h1>
          <p className="text-muted-foreground">Gestiona los productos y materiales por categoria</p>
        </div>
        <Dialog open={isOpen} onOpenChange={(open) => {
          setIsOpen(open)
          if (!open) resetForm()
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Agregar Insumo
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingId ? "Editar Insumo" : "Nuevo Insumo"}</DialogTitle>
              <DialogDescription>
                {editingId
                  ? "Modifica los datos del insumo"
                  : "Agrega un nuevo producto al inventario"}
              </DialogDescription>
            </DialogHeader>
            <FieldGroup>
              <Field>
                <FieldLabel>Categoria</FieldLabel>
                <Select
                  value={formData.categoria}
                  onValueChange={(value: CategoriaInsumo) =>
                    setFormData({ ...formData, categoria: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIAS_INSUMO.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field>
                <FieldLabel>Producto</FieldLabel>
                <Input
                  value={formData.producto}
                  onChange={(e) => setFormData({ ...formData, producto: e.target.value })}
                  placeholder="Ej: Aceite esencial"
                />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel>Presentacion</FieldLabel>
                  <Input
                    value={formData.presentacion}
                    onChange={(e) => setFormData({ ...formData, presentacion: e.target.value })}
                    placeholder="Ej: 240ml, 100 unidades"
                  />
                </Field>
                <Field>
                  <FieldLabel>Unidad</FieldLabel>
                  <Select
                    value={formData.unidad}
                    onValueChange={(value) => setFormData({ ...formData, unidad: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="u">Unidad (u)</SelectItem>
                      <SelectItem value="ml">Mililitros (ml)</SelectItem>
                      <SelectItem value="g">Gramos (g)</SelectItem>
                      <SelectItem value="par">Par</SelectItem>
                      <SelectItem value="frasco">Frasco</SelectItem>
                      <SelectItem value="infusion">Infusion</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel>Costo (CUP)</FieldLabel>
                  <Input
                    type="number"
                    value={formData.costo || ""}
                    onChange={(e) => setFormData({ ...formData, costo: Number(e.target.value) })}
                    placeholder="0"
                  />
                </Field>
                <Field>
                  <FieldLabel>Costo Unitario</FieldLabel>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.costoUnitario || ""}
                    onChange={(e) => setFormData({ ...formData, costoUnitario: Number(e.target.value) })}
                    placeholder="0.00"
                  />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel>Stock Actual</FieldLabel>
                  <Input
                    type="number"
                    value={formData.stock || ""}
                    onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                    placeholder="0"
                  />
                </Field>
                <Field>
                  <FieldLabel>Stock Minimo</FieldLabel>
                  <Input
                    type="number"
                    value={formData.stockMinimo || ""}
                    onChange={(e) => setFormData({ ...formData, stockMinimo: Number(e.target.value) })}
                    placeholder="1"
                  />
                </Field>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="reutilizable"
                  checked={formData.esReutilizable}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, esReutilizable: checked === true })
                  }
                />
                <label htmlFor="reutilizable" className="text-sm">
                  Es reutilizable (no se consume en cada servicio)
                </label>
              </div>
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

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Valor Inventario</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.valorTotal)}</div>
            <p className="text-xs text-muted-foreground">Total en stock</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Productos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{insumos.length}</div>
            <p className="text-xs text-muted-foreground">Insumos registrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Stock Bajo</CardTitle>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{stats.stockBajo.length}</div>
            <p className="text-xs text-muted-foreground">Necesitan reposicion</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Reutilizables</CardTitle>
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.reutilizables.length}</div>
            <p className="text-xs text-muted-foreground">No consumibles</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" onValueChange={(v) => setSelectedCategoria(v as CategoriaInsumo | "all")}>
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="all">Todos</TabsTrigger>
          {CATEGORIAS_INSUMO.map((cat) => (
            <TabsTrigger key={cat.value} value={cat.value}>
              {cat.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={selectedCategoria} className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>
                {selectedCategoria === "all" ? "Todos los Insumos" : getCategoriaLabel(selectedCategoria)}
              </CardTitle>
              <CardDescription>{filteredInsumos.length} productos</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Producto</TableHead>
                    <TableHead>Presentacion</TableHead>
                    <TableHead className="text-right">Costo</TableHead>
                    <TableHead className="text-right">CUP/{formData.unidad || "u"}</TableHead>
                    <TableHead className="text-right">Stock</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="w-[100px]">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInsumos.map((insumo) => (
                    <TableRow key={insumo.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{insumo.producto}</span>
                          {insumo.esReutilizable && (
                            <RefreshCw className="h-3 w-3 text-muted-foreground" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{insumo.presentacion}</TableCell>
                      <TableCell className="text-right">{formatCurrency(insumo.costo)}</TableCell>
                      <TableCell className="text-right">
                        {formatNumber(insumo.costoUnitario)} / {insumo.unidad}
                      </TableCell>
                      <TableCell className="text-right">{insumo.stock}</TableCell>
                      <TableCell>
                        {insumo.stock <= insumo.stockMinimo ? (
                          <Badge variant="destructive">Stock bajo</Badge>
                        ) : (
                          <Badge variant="secondary">OK</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(insumo)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(insumo.id)}
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
        </TabsContent>
      </Tabs>
    </div>
  )
}
