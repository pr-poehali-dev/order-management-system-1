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

interface User {
  id: number;
  login: string;
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
}

interface AdminPanelProps {
  user: User;
  onLogout: () => void;
}

export default function AdminPanel({ user, onLogout }: AdminPanelProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [materialDialogOpen, setMaterialDialogOpen] = useState(false);

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
    image_url: ''
  });

  useEffect(() => {
    loadUsers();
    loadMaterials();
  }, []);

  const loadUsers = async () => {
    try {
      const response = await fetch(USERS_API);
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
        setNewMaterial({ name: '', size: '', color: '', quantity: 0, material_type: '', image_url: '' });
        loadMaterials();
      }
    } catch (error) {
      toast.error('Ошибка добавления материала');
    } finally {
      setLoading(false);
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
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="users">
              <Icon name="Users" size={16} className="mr-2" />
              Пользователи
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
                      <TableHead>Размер</TableHead>
                      <TableHead>Цвет</TableHead>
                      <TableHead>Тип</TableHead>
                      <TableHead className="text-right">Количество</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {materials.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground">
                          Материалы не добавлены
                        </TableCell>
                      </TableRow>
                    ) : (
                      materials.map((m) => (
                        <TableRow key={m.id}>
                          <TableCell className="font-medium">{m.name}</TableCell>
                          <TableCell>{m.size || '—'}</TableCell>
                          <TableCell>{m.color || '—'}</TableCell>
                          <TableCell>{m.material_type || '—'}</TableCell>
                          <TableCell className="text-right font-mono">{m.quantity}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
