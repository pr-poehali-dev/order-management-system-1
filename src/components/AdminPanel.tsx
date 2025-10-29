import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

const USERS_API = 'https://functions.poehali.dev/d545977b-a793-4d1c-bcd3-7a3687a7b0cd';
const MATERIALS_API = 'https://functions.poehali.dev/74905bf8-26b1-4b87-9a75-660316d4ba77';
const SECTIONS_API = 'https://functions.poehali.dev/3cc3d7a9-a873-4328-a15f-947f4bc16e39';

interface User {
  id: number;
  login: string;
  password?: string;
  role: string;
  full_name: string;
}

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

interface AdminPanelProps {
  user: User;
  onLogout: () => void;
}

export default function AdminPanel({ user, onLogout }: AdminPanelProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [materialDialogOpen, setMaterialDialogOpen] = useState(false);
  const [sectionDialogOpen, setSectionDialogOpen] = useState(false);

  const [newUser, setNewUser] = useState({
    login: '',
    password: '',
    role: 'worker',
    full_name: ''
  });

  const [newMaterial, setNewMaterial] = useState({
    name: '',
    size: '',
    color: '',
    quantity: 0,
    material_type: '',
    image_url: '',
    section_id: undefined as number | undefined
  });

  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const [newSection, setNewSection] = useState({
    name: '',
    description: ''
  });

  useEffect(() => {
    loadUsers();
    loadMaterials();
    loadSections();
  }, []);

  const loadUsers = async () => {
    try {
      const response = await fetch(`${USERS_API}?include_passwords=true`);
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      toast.error('Ошибка загрузки пользователей');
    }
  };

  const loadMaterials = async () => {
    try {
      const response = await fetch(MATERIALS_API);
      const data = await response.json();
      setMaterials(data);
    } catch (error) {
      toast.error('Ошибка загрузки материалов');
    }
  };

  const loadSections = async () => {
    try {
      const response = await fetch(SECTIONS_API);
      const data = await response.json();
      setSections(data);
    } catch (error) {
      toast.error('Ошибка загрузки разделов');
    }
  };

  const createUser = async () => {
    if (!newUser.login || !newUser.password || !newUser.full_name) {
      toast.error('Заполните все обязательные поля');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(USERS_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser)
      });

      if (response.ok) {
        toast.success('Пользователь создан');
        setDialogOpen(false);
        setNewUser({ login: '', password: '', role: 'worker', full_name: '' });
        loadUsers();
      }
    } catch (error) {
      toast.error('Ошибка создания пользователя');
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (userId: number) => {
    if (!confirm('Удалить пользователя?')) return;

    try {
      await fetch(USERS_API, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: userId })
      });
      toast.success('Пользователь удален');
      loadUsers();
    } catch (error) {
      toast.error('Ошибка удаления');
    }
  };

  const createMaterial = async () => {
    if (!newMaterial.name) {
      toast.error('Укажите название материала');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(MATERIALS_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMaterial)
      });

      if (response.ok) {
        toast.success('Материал добавлен');
        setMaterialDialogOpen(false);
        setNewMaterial({ name: '', size: '', color: '', quantity: 0, material_type: '', image_url: '', section_id: undefined });
        loadMaterials();
      }
    } catch (error) {
      toast.error('Ошибка добавления материала');
    } finally {
      setLoading(false);
    }
  };

  const updateMaterial = async () => {
    if (!editingMaterial || !editingMaterial.name) {
      toast.error('Укажите название материала');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(MATERIALS_API, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingMaterial)
      });

      if (response.ok) {
        toast.success('Материал обновлён');
        setEditDialogOpen(false);
        setEditingMaterial(null);
        loadMaterials();
      }
    } catch (error) {
      toast.error('Ошибка обновления материала');
    } finally {
      setLoading(false);
    }
  };

  const deleteMaterial = async (id: number) => {
    if (!confirm('Удалить этот материал?')) return;

    try {
      const response = await fetch(`${MATERIALS_API}?id=${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast.success('Материал удалён');
        loadMaterials();
      }
    } catch (error) {
      toast.error('Ошибка удаления материала');
    }
  };

  const createSection = async () => {
    if (!newSection.name) {
      toast.error('Укажите название раздела');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(SECTIONS_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSection)
      });

      if (response.ok) {
        toast.success('Раздел создан');
        setSectionDialogOpen(false);
        setNewSection({ name: '', description: '' });
        loadSections();
      }
    } catch (error) {
      toast.error('Ошибка создания раздела');
    } finally {
      setLoading(false);
    }
  };

  const deleteSection = async (sectionId: number) => {
    if (!confirm('Удалить раздел? Материалы в нем останутся.')) return;

    try {
      await fetch(SECTIONS_API, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: sectionId })
      });
      toast.success('Раздел удален');
      loadSections();
    } catch (error) {
      toast.error('Ошибка удаления');
    }
  };

  const getRoleName = (role: string) => {
    const roles: Record<string, string> = {
      admin: 'Администратор',
      manager: 'Руководитель',
      worker: 'Работник'
    };
    return roles[role] || role;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Icon name="Shield" size={20} className="text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Панель администратора</h1>
              <p className="text-sm text-muted-foreground">{user.full_name}</p>
            </div>
          </div>
          <Button variant="outline" onClick={onLogout}>
            <Icon name="LogOut" size={16} className="mr-2" />
            Выход
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full max-w-2xl grid-cols-3">
            <TabsTrigger value="users">
              <Icon name="Users" size={16} className="mr-2" />
              Пользователи
            </TabsTrigger>
            <TabsTrigger value="sections">
              <Icon name="FolderTree" size={16} className="mr-2" />
              Разделы
            </TabsTrigger>
            <TabsTrigger value="materials">
              <Icon name="Package" size={16} className="mr-2" />
              Материалы
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Управление пользователями</CardTitle>
                    <CardDescription>Создание, редактирование и удаление учетных записей</CardDescription>
                  </div>
                  <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Icon name="UserPlus" size={16} className="mr-2" />
                        Добавить пользователя
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Новый пользователь</DialogTitle>
                        <DialogDescription>Создание учетной записи с назначением роли</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label>ФИО</Label>
                          <Input
                            value={newUser.full_name}
                            onChange={(e) => setNewUser({ ...newUser, full_name: e.target.value })}
                            placeholder="Иванов Иван Иванович"
                          />
                        </div>
                        <div>
                          <Label>Логин</Label>
                          <Input
                            value={newUser.login}
                            onChange={(e) => setNewUser({ ...newUser, login: e.target.value })}
                            placeholder="ivanov"
                          />
                        </div>
                        <div>
                          <Label>Пароль</Label>
                          <Input
                            type="password"
                            value={newUser.password}
                            onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                            placeholder="Введите пароль"
                          />
                        </div>
                        <div>
                          <Label>Роль</Label>
                          <Select value={newUser.role} onValueChange={(value) => setNewUser({ ...newUser, role: value })}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="admin">Администратор</SelectItem>
                              <SelectItem value="manager">Руководитель</SelectItem>
                              <SelectItem value="worker">Работник</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <Button onClick={createUser} className="w-full" disabled={loading}>
                          {loading ? 'Создание...' : 'Создать'}
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
                      <TableHead>ФИО</TableHead>
                      <TableHead>Логин</TableHead>
                      <TableHead>Пароль</TableHead>
                      <TableHead>Роль</TableHead>
                      <TableHead className="text-right">Действия</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((u) => (
                      <TableRow key={u.id}>
                        <TableCell className="font-medium">{u.full_name}</TableCell>
                        <TableCell>{u.login}</TableCell>
                        <TableCell>
                          <code className="px-2 py-1 bg-muted rounded text-sm font-mono">
                            {u.password || '••••••'}
                          </code>
                        </TableCell>
                        <TableCell>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                            {getRoleName(u.role)}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteUser(u.id)}
                            disabled={u.id === user.id}
                          >
                            <Icon name="Trash2" size={16} />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sections" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Разделы материалов</CardTitle>
                    <CardDescription>Создание категорий для группировки материалов</CardDescription>
                  </div>
                  <Dialog open={sectionDialogOpen} onOpenChange={setSectionDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Icon name="Plus" size={16} className="mr-2" />
                        Создать раздел
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Новый раздел</DialogTitle>
                        <DialogDescription>Создание раздела для группировки материалов</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label>Название раздела</Label>
                          <Input
                            value={newSection.name}
                            onChange={(e) => setNewSection({ ...newSection, name: e.target.value })}
                            placeholder="Металлы, Пластики и т.д."
                          />
                        </div>
                        <div>
                          <Label>Описание (необязательно)</Label>
                          <Input
                            value={newSection.description}
                            onChange={(e) => setNewSection({ ...newSection, description: e.target.value })}
                            placeholder="Краткое описание раздела"
                          />
                        </div>
                        <Button onClick={createSection} className="w-full" disabled={loading}>
                          {loading ? 'Создание...' : 'Создать'}
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
                      <TableHead>Описание</TableHead>
                      <TableHead className="text-right">Действия</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sections.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center text-muted-foreground">
                          Разделы не созданы
                        </TableCell>
                      </TableRow>
                    ) : (
                      sections.map((s) => (
                        <TableRow key={s.id}>
                          <TableCell className="font-medium">{s.name}</TableCell>
                          <TableCell>{s.description || '—'}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteSection(s.id)}
                            >
                              <Icon name="Trash2" size={16} />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="materials" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Материалы</CardTitle>
                    <CardDescription>Управление складом материалов и изображениями</CardDescription>
                  </div>
                  <Dialog open={materialDialogOpen} onOpenChange={setMaterialDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Icon name="Plus" size={16} className="mr-2" />
                        Добавить материал
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Новый материал</DialogTitle>
                        <DialogDescription>Добавление материала в систему</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label>Название</Label>
                          <Input
                            value={newMaterial.name}
                            onChange={(e) => setNewMaterial({ ...newMaterial, name: e.target.value })}
                            placeholder="Название материала"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Размер</Label>
                            <Input
                              value={newMaterial.size}
                              onChange={(e) => setNewMaterial({ ...newMaterial, size: e.target.value })}
                              placeholder="Размер"
                            />
                          </div>
                          <div>
                            <Label>Цвет</Label>
                            <Input
                              value={newMaterial.color}
                              onChange={(e) => setNewMaterial({ ...newMaterial, color: e.target.value })}
                              placeholder="Цвет"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Тип материала</Label>
                            <Input
                              value={newMaterial.material_type}
                              onChange={(e) => setNewMaterial({ ...newMaterial, material_type: e.target.value })}
                              placeholder="Тип"
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
                            value={newMaterial.section_id?.toString() || ''} 
                            onValueChange={(value) => setNewMaterial({ ...newMaterial, section_id: value ? Number(value) : undefined })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Выберите раздел (необязательно)" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="">Без раздела</SelectItem>
                              {sections.map((s) => (
                                <SelectItem key={s.id} value={s.id.toString()}>
                                  {s.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>URL изображения</Label>
                          <Input
                            value={newMaterial.image_url}
                            onChange={(e) => setNewMaterial({ ...newMaterial, image_url: e.target.value })}
                            placeholder="https://..."
                          />
                        </div>
                        <Button onClick={createMaterial} className="w-full" disabled={loading}>
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
                      <TableHead>Раздел</TableHead>
                      <TableHead>Размер</TableHead>
                      <TableHead>Цвет</TableHead>
                      <TableHead>Тип</TableHead>
                      <TableHead className="text-right">Количество</TableHead>
                      <TableHead className="text-right">Действия</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {materials.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-muted-foreground">
                          Материалы не добавлены
                        </TableCell>
                      </TableRow>
                    ) : (
                      materials.map((m) => {
                        const section = sections.find(s => s.id === m.section_id);
                        return (
                          <TableRow key={m.id}>
                            <TableCell className="font-medium">{m.name}</TableCell>
                            <TableCell>
                              {section ? (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-secondary text-secondary-foreground">
                                  {section.name}
                                </span>
                              ) : '—'}
                            </TableCell>
                            <TableCell>{m.size || '—'}</TableCell>
                            <TableCell>{m.color || '—'}</TableCell>
                            <TableCell>{m.material_type || '—'}</TableCell>
                            <TableCell className="text-right font-mono">{m.quantity}</TableCell>
                            <TableCell className="text-right space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setEditingMaterial(m);
                                  setEditDialogOpen(true);
                                }}
                              >
                                <Icon name="Pencil" size={14} />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => deleteMaterial(m.id)}
                              >
                                <Icon name="Trash2" size={14} />
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Редактирование материала</DialogTitle>
                  <DialogDescription>Обновление характеристик материала</DialogDescription>
                </DialogHeader>
                {editingMaterial && (
                  <div className="space-y-4">
                    <div>
                      <Label>Название</Label>
                      <Input
                        value={editingMaterial.name}
                        onChange={(e) => setEditingMaterial({ ...editingMaterial, name: e.target.value })}
                        placeholder="Название материала"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Размер</Label>
                        <Input
                          value={editingMaterial.size}
                          onChange={(e) => setEditingMaterial({ ...editingMaterial, size: e.target.value })}
                          placeholder="Размер"
                        />
                      </div>
                      <div>
                        <Label>Цвет</Label>
                        <Input
                          value={editingMaterial.color}
                          onChange={(e) => setEditingMaterial({ ...editingMaterial, color: e.target.value })}
                          placeholder="Цвет"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Тип материала</Label>
                        <Input
                          value={editingMaterial.material_type}
                          onChange={(e) => setEditingMaterial({ ...editingMaterial, material_type: e.target.value })}
                          placeholder="Тип"
                        />
                      </div>
                      <div>
                        <Label>Количество</Label>
                        <Input
                          type="number"
                          value={editingMaterial.quantity}
                          onChange={(e) => setEditingMaterial({ ...editingMaterial, quantity: Number(e.target.value) })}
                          placeholder="0"
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Раздел</Label>
                      <Select 
                        value={editingMaterial.section_id?.toString() || ''} 
                        onValueChange={(value) => setEditingMaterial({ ...editingMaterial, section_id: value ? Number(value) : undefined })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Выберите раздел (необязательно)" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Без раздела</SelectItem>
                          {sections.map((s) => (
                            <SelectItem key={s.id} value={s.id.toString()}>
                              {s.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>URL изображения</Label>
                      <Input
                        value={editingMaterial.image_url}
                        onChange={(e) => setEditingMaterial({ ...editingMaterial, image_url: e.target.value })}
                        placeholder="https://..."
                      />
                    </div>
                    <Button onClick={updateMaterial} className="w-full" disabled={loading}>
                      {loading ? 'Сохранение...' : 'Сохранить'}
                    </Button>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}