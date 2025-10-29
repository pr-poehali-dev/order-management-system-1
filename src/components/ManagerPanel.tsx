import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const ORDERS_API = 'https://functions.poehali.dev/0ffd935b-d2ee-48e1-a9e4-2b8fe0ffb3dd';
const MATERIALS_API = 'https://functions.poehali.dev/74905bf8-26b1-4b87-9a75-660316d4ba77';

interface User {
  id: number;
  login: string;
  role: string;
  full_name: string;
}

interface Order {
  id: number;
  order_number: string;
  material: string;
  quantity: number;
  size: string;
  color: string;
  status: string;
  completed_quantity: number;
  created_at: string;
}

interface Material {
  id: number;
  name: string;
  quantity: number;
}

interface ManagerPanelProps {
  user: User;
  onLogout: () => void;
}

export default function ManagerPanel({ user, onLogout }: ManagerPanelProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  const [newOrder, setNewOrder] = useState({
    order_number: '',
    material: '',
    quantity: 0,
    size: '',
    color: ''
  });

  useEffect(() => {
    loadOrders();
    loadMaterials();
  }, []);

  const loadOrders = async () => {
    try {
      const response = await fetch(ORDERS_API);
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      toast.error('Ошибка загрузки заявок');
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

  const createOrder = async () => {
    if (!newOrder.order_number || !newOrder.material || newOrder.quantity <= 0) {
      toast.error('Заполните все обязательные поля');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(ORDERS_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newOrder, created_by: user.id })
      });

      if (response.ok) {
        toast.success('Заявка создана');
        playNotificationSound();
        setDialogOpen(false);
        setNewOrder({ order_number: '', material: '', quantity: 0, size: '', color: '' });
        loadOrders();
      }
    } catch (error) {
      toast.error('Ошибка создания заявки');
    } finally {
      setLoading(false);
    }
  };

  const playNotificationSound = () => {
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIGGS56+mmUhELTqXh8bhfGwU7k9n1yX4qBSiBzvLZijcIF2K76+aeSxkNUKXj7rdgGQU7ktm1yHwpBSh+zPPaizsIGGC46+aeTBYNVajk67RZFwtAfNKlum4eB2hCbZa8W9lbkL/J1ejkuoj4aSWd0+f7zdmn9Qs0kNvx07xmHQY2iNXyx3wqBiZ7y/Haj');
    audio.play().catch(() => {});
  };

  const updateInventory = async (materialId: number, change: number) => {
    try {
      await fetch(MATERIALS_API, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: materialId, quantity_change: change, updated_by: user.id })
      });
      toast.success('Остатки обновлены');
      loadMaterials();
    } catch (error) {
      toast.error('Ошибка обновления остатков');
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      created: 'bg-red-500',
      in_progress: 'bg-yellow-500',
      completed: 'bg-green-500',
      shipped: 'bg-blue-500'
    };
    return colors[status] || 'bg-gray-500';
  };

  const getStatusText = (status: string) => {
    const texts: Record<string, string> = {
      created: 'Создана',
      in_progress: 'Выполняется',
      completed: 'Исполнена',
      shipped: 'Отправлено'
    };
    return texts[status] || status;
  };

  const printOrder = (order: Order) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const content = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Заявка ${order.order_number}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; }
          h1 { color: #333; border-bottom: 2px solid #333; padding-bottom: 10px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { padding: 12px; text-align: left; border: 1px solid #ddd; }
          th { background-color: #f5f5f5; font-weight: bold; }
          .status { display: inline-block; padding: 4px 12px; border-radius: 4px; font-weight: bold; }
          .status-created { background-color: #fee; color: #c00; }
          .status-in_progress { background-color: #ffc; color: #860; }
          .status-completed { background-color: #efe; color: #060; }
          .status-shipped { background-color: #eef; color: #06c; }
          @media print { body { padding: 20px; } }
        </style>
      </head>
      <body>
        <h1>Производственная заявка № ${order.order_number}</h1>
        <table>
          <tr><th>Материал</th><td>${order.material}</td></tr>
          <tr><th>Количество</th><td>${order.quantity} шт.</td></tr>
          <tr><th>Размеры</th><td>${order.size || '—'}</td></tr>
          <tr><th>Цвет</th><td>${order.color || '—'}</td></tr>
          <tr><th>Выполнено</th><td>${order.completed_quantity} из ${order.quantity} шт.</td></tr>
          <tr><th>Статус</th><td><span class="status status-${order.status}">${getStatusText(order.status)}</span></td></tr>
          <tr><th>Дата создания</th><td>${new Date(order.created_at).toLocaleString('ru-RU')}</td></tr>
        </table>
        <script>
          window.onload = () => {
            window.print();
            window.onafterprint = () => window.close();
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(content);
    printWindow.document.close();
  };

  const filteredOrders = orders.filter(order => {
    if (activeTab === 'all') return true;
    return order.status === activeTab;
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Icon name="Briefcase" size={20} className="text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Панель руководителя</h1>
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
        <Tabs defaultValue="orders" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="orders">
              <Icon name="ClipboardList" size={16} className="mr-2" />
              Заявки
            </TabsTrigger>
            <TabsTrigger value="inventory">
              <Icon name="Package" size={16} className="mr-2" />
              Остатки
            </TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Управление заявками</CardTitle>
                    <CardDescription>Создание и отслеживание производственных заявок</CardDescription>
                  </div>
                  <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Icon name="Plus" size={16} className="mr-2" />
                        Создать заявку
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Новая заявка</DialogTitle>
                        <DialogDescription>Создание производственного заказа</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label>Номер заказа</Label>
                          <Input
                            value={newOrder.order_number}
                            onChange={(e) => setNewOrder({ ...newOrder, order_number: e.target.value })}
                            placeholder="№ 001"
                          />
                        </div>
                        <div>
                          <Label>Материал</Label>
                          <Select value={newOrder.material} onValueChange={(value) => setNewOrder({ ...newOrder, material: value })}>
                            <SelectTrigger>
                              <SelectValue placeholder="Выберите материал" />
                            </SelectTrigger>
                            <SelectContent>
                              {materials.length === 0 ? (
                                <SelectItem value="none" disabled>Материалы не добавлены</SelectItem>
                              ) : (
                                materials.map((m) => (
                                  <SelectItem key={m.id} value={m.name}>
                                    {m.name}
                                  </SelectItem>
                                ))
                              )}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Количество</Label>
                            <Input
                              type="number"
                              value={newOrder.quantity}
                              onChange={(e) => setNewOrder({ ...newOrder, quantity: Number(e.target.value) })}
                              placeholder="0"
                            />
                          </div>
                          <div>
                            <Label>Размеры</Label>
                            <Input
                              value={newOrder.size}
                              onChange={(e) => setNewOrder({ ...newOrder, size: e.target.value })}
                              placeholder="100x200"
                            />
                          </div>
                        </div>
                        <div>
                          <Label>Цвет</Label>
                          <Input
                            value={newOrder.color}
                            onChange={(e) => setNewOrder({ ...newOrder, color: e.target.value })}
                            placeholder="Красный"
                          />
                        </div>
                        <Button onClick={createOrder} className="w-full" disabled={loading}>
                          {loading ? 'Создание...' : 'Создать'}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-4 flex gap-2">
                  <Button
                    variant={activeTab === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setActiveTab('all')}
                  >
                    Все
                  </Button>
                  <Button
                    variant={activeTab === 'created' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setActiveTab('created')}
                  >
                    Созданные
                  </Button>
                  <Button
                    variant={activeTab === 'in_progress' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setActiveTab('in_progress')}
                  >
                    В исполнении
                  </Button>
                  <Button
                    variant={activeTab === 'completed' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setActiveTab('completed')}
                  >
                    Исполнены
                  </Button>
                  <Button
                    variant={activeTab === 'shipped' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setActiveTab('shipped')}
                  >
                    Отправлено
                  </Button>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Статус</TableHead>
                      <TableHead>Номер</TableHead>
                      <TableHead>Материал</TableHead>
                      <TableHead>Размеры</TableHead>
                      <TableHead>Цвет</TableHead>
                      <TableHead className="text-right">Прогресс</TableHead>
                      <TableHead className="text-right">Действия</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-muted-foreground">
                          Заявки не найдены
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredOrders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell>
                            <Badge className={cn('text-white', getStatusColor(order.status))}>
                              {getStatusText(order.status)}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-medium">{order.order_number}</TableCell>
                          <TableCell>{order.material}</TableCell>
                          <TableCell>{order.size || '—'}</TableCell>
                          <TableCell>{order.color || '—'}</TableCell>
                          <TableCell className="text-right font-mono">
                            {order.completed_quantity} / {order.quantity}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => printOrder(order)}
                            >
                              <Icon name="Printer" size={14} className="mr-1" />
                              Печать
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

          <TabsContent value="inventory" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Остатки материалов</CardTitle>
                <CardDescription>Учет складских остатков</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Материал</TableHead>
                      <TableHead className="text-right">Количество</TableHead>
                      <TableHead className="text-right">Действия</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {materials.map((m) => (
                      <TableRow key={m.id}>
                        <TableCell className="font-medium">{m.name}</TableCell>
                        <TableCell className="text-right font-mono">{m.quantity}</TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              const amount = prompt('Количество для добавления:');
                              if (amount) updateInventory(m.id, Number(amount));
                            }}
                          >
                            <Icon name="Plus" size={14} />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              const amount = prompt('Количество для списания:');
                              if (amount) updateInventory(m.id, -Number(amount));
                            }}
                          >
                            <Icon name="Minus" size={14} />
                          </Button>
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
    </div>
  );
}