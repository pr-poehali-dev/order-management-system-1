import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
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

interface WorkerPanelProps {
  user: User;
  onLogout: () => void;
}

export default function WorkerPanel({ user, onLogout }: WorkerPanelProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [completedAmount, setCompletedAmount] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    loadOrders();
    loadMaterials();
    const interval = setInterval(loadOrders, 10000);
    return () => clearInterval(interval);
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

  const updateOrderProgress = async () => {
    if (!selectedOrder || completedAmount <= 0) {
      toast.error('Укажите корректное количество');
      return;
    }

    const newCompleted = selectedOrder.completed_quantity + completedAmount;

    if (newCompleted > selectedOrder.quantity) {
      toast.error('Количество превышает заказанное');
      return;
    }

    try {
      await fetch(ORDERS_API, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedOrder.id, completed_quantity: newCompleted })
      });

      toast.success('Прогресс обновлен');
      setDialogOpen(false);
      setCompletedAmount(0);
      setSelectedOrder(null);
      loadOrders();
    } catch (error) {
      toast.error('Ошибка обновления');
    }
  };

  const markAsShipped = async (orderId: number) => {
    try {
      await fetch(ORDERS_API, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: orderId, status: 'shipped' })
      });
      toast.success('Заявка отправлена');
      loadOrders();
    } catch (error) {
      toast.error('Ошибка обновления статуса');
    }
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
              <Icon name="Hammer" size={20} className="text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Панель работника</h1>
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
                <CardTitle>Производственные заявки</CardTitle>
                <CardDescription>Просмотр и обновление статуса выполнения</CardDescription>
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
                            {order.status === 'completed' ? (
                              <Button
                                size="sm"
                                onClick={() => markAsShipped(order.id)}
                              >
                                <Icon name="Send" size={14} className="mr-1" />
                                Отправить
                              </Button>
                            ) : order.status !== 'shipped' ? (
                              <Dialog open={dialogOpen && selectedOrder?.id === order.id} onOpenChange={(open) => {
                                setDialogOpen(open);
                                if (!open) setSelectedOrder(null);
                              }}>
                                <DialogTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setSelectedOrder(order)}
                                  >
                                    <Icon name="Edit" size={14} className="mr-1" />
                                    Внести
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Обновить прогресс</DialogTitle>
                                    <DialogDescription>
                                      Заявка {order.order_number} - {order.material}
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <div>
                                      <Label>Выполнено: {order.completed_quantity} / {order.quantity}</Label>
                                    </div>
                                    <div>
                                      <Label>Добавить выполненных изделий</Label>
                                      <Input
                                        type="number"
                                        value={completedAmount}
                                        onChange={(e) => setCompletedAmount(Number(e.target.value))}
                                        placeholder="Количество"
                                        min={1}
                                        max={order.quantity - order.completed_quantity}
                                      />
                                    </div>
                                    <Button onClick={updateOrderProgress} className="w-full">
                                      Обновить
                                    </Button>
                                  </div>
                                </DialogContent>
                              </Dialog>
                            ) : null}
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
