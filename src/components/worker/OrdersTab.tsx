import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { cn } from '@/lib/utils';

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

interface OrdersTabProps {
  orders: Order[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onUpdateProgress: (order: Order, amount: number) => void;
  onMarkAsShipped: (orderId: number) => void;
  onDeleteOrder: (orderId: number) => void;
  getStatusColor: (status: string) => string;
  getStatusText: (status: string) => string;
}

export default function OrdersTab({
  orders,
  activeTab,
  setActiveTab,
  onUpdateProgress,
  onMarkAsShipped,
  onDeleteOrder,
  getStatusColor,
  getStatusText
}: OrdersTabProps) {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [completedAmount, setCompletedAmount] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);

  const filteredOrders = orders.filter(order => {
    if (activeTab === 'all') return true;
    return order.status === activeTab;
  });

  const handleUpdateProgress = () => {
    if (selectedOrder) {
      onUpdateProgress(selectedOrder, completedAmount);
      setDialogOpen(false);
      setCompletedAmount(0);
      setSelectedOrder(null);
    }
  };

  const ordersByStatus = {
    all: orders.length,
    created: orders.filter(o => o.status === 'created').length,
    in_progress: orders.filter(o => o.status === 'in_progress').length,
    completed: orders.filter(o => o.status === 'completed').length
  };

  return (
    <TabsContent value="orders" className="space-y-4">
      <div className="grid gap-4 md:grid-cols-4">
        {[
          { key: 'all', label: 'Все', icon: 'List', color: 'text-gray-600' },
          { key: 'created', label: 'Новые', icon: 'FileText', color: 'text-red-600' },
          { key: 'in_progress', label: 'В работе', icon: 'Clock', color: 'text-yellow-600' },
          { key: 'completed', label: 'Готовые', icon: 'CheckCircle2', color: 'text-green-600' }
        ].map(({ key, label, icon, color }) => (
          <Card
            key={key}
            className={cn(
              'cursor-pointer transition-all hover:shadow-md',
              activeTab === key && 'ring-2 ring-primary'
            )}
            onClick={() => setActiveTab(key)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">{label}</CardTitle>
                <Icon name={icon as any} size={18} className={color} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{ordersByStatus[key as keyof typeof ordersByStatus]}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Список заявок</CardTitle>
          <CardDescription>Управление производственными заявками</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>№ Заявки</TableHead>
                <TableHead>Материал</TableHead>
                <TableHead>Размер</TableHead>
                <TableHead>Цвет</TableHead>
                <TableHead className="text-right">Количество</TableHead>
                <TableHead className="text-center">Прогресс</TableHead>
                <TableHead className="text-center">Статус</TableHead>
                <TableHead className="text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    Нет заявок для отображения
                  </TableCell>
                </TableRow>
              ) : (
                filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.order_number}</TableCell>
                    <TableCell>{order.material}</TableCell>
                    <TableCell>{order.size}</TableCell>
                    <TableCell>{order.color}</TableCell>
                    <TableCell className="text-right font-mono">
                      {order.completed_quantity} / {order.quantity}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col items-center gap-1">
                        <div className="w-full bg-secondary rounded-full h-2">
                          <div
                            className={cn('h-full rounded-full', getStatusColor(order.status))}
                            style={{
                              width: `${(order.completed_quantity / order.quantity) * 100}%`
                            }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {Math.round((order.completed_quantity / order.quantity) * 100)}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge className={cn('text-white', getStatusColor(order.status))}>
                        {getStatusText(order.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      {order.status !== 'shipped' && order.completed_quantity < order.quantity ? (
                        <Dialog open={dialogOpen && selectedOrder?.id === order.id} onOpenChange={(open) => {
                          setDialogOpen(open);
                          if (!open) {
                            setSelectedOrder(null);
                            setCompletedAmount(0);
                          }
                        }}>
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              onClick={() => {
                                setSelectedOrder(order);
                                setDialogOpen(true);
                              }}
                            >
                              <Icon name="Plus" size={14} className="mr-1" />
                              Добавить
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Обновить прогресс</DialogTitle>
                              <DialogDescription>
                                Заявка: {order.order_number} — {order.material}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="p-4 bg-secondary rounded-lg">
                                <div className="text-sm text-muted-foreground mb-1">Текущий прогресс</div>
                                <div className="text-2xl font-bold">
                                  {order.completed_quantity} / {order.quantity}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  Осталось: {order.quantity - order.completed_quantity}
                                </div>
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
                              <Button onClick={handleUpdateProgress} className="w-full">
                                Обновить
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      ) : order.status === 'completed' ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onMarkAsShipped(order.id)}
                        >
                          <Icon name="Truck" size={14} className="mr-1" />
                          Отправить
                        </Button>
                      ) : null}
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => onDeleteOrder(order.id)}
                      >
                        <Icon name="Trash2" size={14} />
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
  );
}