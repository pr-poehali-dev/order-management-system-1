import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface User {
  id: number;
  login: string;
  password?: string;
  role: string;
  full_name: string;
}

interface UsersTabProps {
  users: User[];
  loading: boolean;
  onCreateUser: (user: { login: string; password: string; role: string; full_name: string }) => Promise<void>;
  onDeleteUser: (userId: number) => void;
  getRoleName: (role: string) => string;
}

export default function UsersTab({ users, loading, onCreateUser, onDeleteUser, getRoleName }: UsersTabProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    login: '',
    password: '',
    role: 'worker',
    full_name: ''
  });

  const handleCreateUser = async () => {
    await onCreateUser(newUser);
    setDialogOpen(false);
    setNewUser({ login: '', password: '', role: 'worker', full_name: '' });
  };

  return (
    <TabsContent value="users" className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Управление пользователями</CardTitle>
              <CardDescription>Создание и настройка доступов</CardDescription>
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
                  <DialogDescription>Заполните данные для создания учетной записи</DialogDescription>
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
                      placeholder="••••••••"
                    />
                  </div>
                  <div>
                    <Label>Роль</Label>
                    <Select value={newUser.role} onValueChange={(role) => setNewUser({ ...newUser, role })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="worker">Работник</SelectItem>
                        <SelectItem value="manager">Руководитель</SelectItem>
                        <SelectItem value="admin">Администратор</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={handleCreateUser} disabled={loading} className="w-full">
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
                  <TableCell className="font-mono text-sm">{u.login}</TableCell>
                  <TableCell className="font-mono text-sm">{u.password || '••••••••'}</TableCell>
                  <TableCell>
                    <Badge variant={u.role === 'admin' ? 'default' : 'secondary'}>
                      {getRoleName(u.role)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => onDeleteUser(u.id)}
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
    </TabsContent>
  );
}
