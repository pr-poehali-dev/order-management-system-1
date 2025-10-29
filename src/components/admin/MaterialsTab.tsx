import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { TabsContent } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';

interface Material {
  id: number;
  name: string;
  size: string;
  color: string;
  quantity: number;
  material_type: string;
  image_url: string;
  section_id?: number;
}

interface Section {
  id: number;
  name: string;
  description: string;
}

interface MaterialsTabProps {
  materials: Material[];
  sections: Section[];
  loading: boolean;
  onCreateMaterial: (material: any) => Promise<void>;
  onUpdateMaterial: (material: Material) => Promise<void>;
  onDeleteMaterial: (id: number) => void;
}

export default function MaterialsTab({
  materials,
  sections,
  loading,
  onCreateMaterial,
  onUpdateMaterial,
  onDeleteMaterial
}: MaterialsTabProps) {
  const [materialDialogOpen, setMaterialDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);

  const [newMaterial, setNewMaterial] = useState({
    name: '',
    size: '',
    color: '',
    quantity: 0,
    material_type: '',
    image_url: '',
    section_id: undefined as number | undefined
  });

  const handleCreateMaterial = async () => {
    await onCreateMaterial(newMaterial);
    setMaterialDialogOpen(false);
    setNewMaterial({ name: '', size: '', color: '', quantity: 0, material_type: '', image_url: '', section_id: undefined });
  };

  const handleUpdateMaterial = async () => {
    if (editingMaterial) {
      await onUpdateMaterial(editingMaterial);
      setEditDialogOpen(false);
      setEditingMaterial(null);
    }
  };

  const openEditDialog = (material: Material) => {
    setEditingMaterial({ ...material });
    setEditDialogOpen(true);
  };

  return (
    <TabsContent value="materials" className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Управление материалами</CardTitle>
              <CardDescription>Добавление и редактирование каталога материалов</CardDescription>
            </div>
            <Dialog open={materialDialogOpen} onOpenChange={setMaterialDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Icon name="Plus" size={16} className="mr-2" />
                  Добавить материал
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Новый материал</DialogTitle>
                  <DialogDescription>Заполните данные материала</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Название</Label>
                      <Input
                        value={newMaterial.name}
                        onChange={(e) => setNewMaterial({ ...newMaterial, name: e.target.value })}
                        placeholder="Например: Полипропилен"
                      />
                    </div>
                    <div>
                      <Label>Тип материала</Label>
                      <Input
                        value={newMaterial.material_type}
                        onChange={(e) => setNewMaterial({ ...newMaterial, material_type: e.target.value })}
                        placeholder="Например: Пластик"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label>Размер</Label>
                      <Input
                        value={newMaterial.size}
                        onChange={(e) => setNewMaterial({ ...newMaterial, size: e.target.value })}
                        placeholder="Например: 100x50"
                      />
                    </div>
                    <div>
                      <Label>Цвет</Label>
                      <Input
                        value={newMaterial.color}
                        onChange={(e) => setNewMaterial({ ...newMaterial, color: e.target.value })}
                        placeholder="Например: Синий"
                      />
                    </div>
                    <div>
                      <Label>Количество</Label>
                      <Input
                        type="number"
                        value={newMaterial.quantity}
                        onChange={(e) => setNewMaterial({ ...newMaterial, quantity: Number(e.target.value) })}
                        placeholder="0"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Раздел</Label>
                    <Select
                      value={newMaterial.section_id?.toString()}
                      onValueChange={(val) => setNewMaterial({ ...newMaterial, section_id: Number(val) })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите раздел" />
                      </SelectTrigger>
                      <SelectContent>
                        {sections.map(s => (
                          <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>URL изображения</Label>
                    <Input
                      value={newMaterial.image_url}
                      onChange={(e) => setNewMaterial({ ...newMaterial, image_url: e.target.value })}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                  <Button onClick={handleCreateMaterial} disabled={loading} className="w-full">
                    {loading ? 'Добавление...' : 'Добавить'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Название</TableHead>
                <TableHead>Тип</TableHead>
                <TableHead>Размер</TableHead>
                <TableHead>Цвет</TableHead>
                <TableHead className="text-right">Количество</TableHead>
                <TableHead>Раздел</TableHead>
                <TableHead className="text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {materials.map((m) => (
                <TableRow key={m.id}>
                  <TableCell className="font-medium">{m.name}</TableCell>
                  <TableCell>{m.material_type || '—'}</TableCell>
                  <TableCell>{m.size || '—'}</TableCell>
                  <TableCell>{m.color || '—'}</TableCell>
                  <TableCell className="text-right font-mono">{m.quantity}</TableCell>
                  <TableCell>
                    {sections.find(s => s.id === m.section_id)?.name || '—'}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEditDialog(m)}
                    >
                      <Icon name="Edit" size={14} />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => onDeleteMaterial(m.id)}
                    >
                      <Icon name="Trash2" size={14} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {editingMaterial && (
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Редактировать материал</DialogTitle>
              <DialogDescription>Измените данные материала</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Название</Label>
                  <Input
                    value={editingMaterial.name}
                    onChange={(e) => setEditingMaterial({ ...editingMaterial, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Тип материала</Label>
                  <Input
                    value={editingMaterial.material_type}
                    onChange={(e) => setEditingMaterial({ ...editingMaterial, material_type: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Размер</Label>
                  <Input
                    value={editingMaterial.size}
                    onChange={(e) => setEditingMaterial({ ...editingMaterial, size: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Цвет</Label>
                  <Input
                    value={editingMaterial.color}
                    onChange={(e) => setEditingMaterial({ ...editingMaterial, color: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Количество</Label>
                  <Input
                    type="number"
                    value={editingMaterial.quantity}
                    onChange={(e) => setEditingMaterial({ ...editingMaterial, quantity: Number(e.target.value) })}
                  />
                </div>
              </div>
              <div>
                <Label>Раздел</Label>
                <Select
                  value={editingMaterial.section_id?.toString()}
                  onValueChange={(val) => setEditingMaterial({ ...editingMaterial, section_id: Number(val) })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите раздел" />
                  </SelectTrigger>
                  <SelectContent>
                    {sections.map(s => (
                      <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>URL изображения</Label>
                <Input
                  value={editingMaterial.image_url}
                  onChange={(e) => setEditingMaterial({ ...editingMaterial, image_url: e.target.value })}
                />
              </div>
              <Button onClick={handleUpdateMaterial} disabled={loading} className="w-full">
                {loading ? 'Сохранение...' : 'Сохранить'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </TabsContent>
  );
}
