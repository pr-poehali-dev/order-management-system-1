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

interface Material {
  id: number;
  name: string;
  quantity: number;
}

interface OrdersSectionProps {
  orders: Order[];
  materials: Material[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
  dialogOpen: boolean;
  setDialogOpen: (open: boolean) => void;
  loading: boolean;
  newOrder: {
    order_number: string;
    material: string;
    quantity: number;
    size: string;
    color: string;
  };
  setNewOrder: (order: any) => void;
  onCreateOrder: () => void;
  onDeleteOrder: (orderId: number) => void;
  onPrintOrder: (order: Order) => void;
  getStatusColor: (status: string) => string;
  getStatusText: (status: string) => string;
}

export default function OrdersSection({
  orders,
  materials,
  activeTab,
  setActiveTab,
  dialogOpen,
  setDialogOpen,
  loading,
  newOrder,
  setNewOrder,
  onCreateOrder,
  onDeleteOrder,
  onPrintOrder,
  getStatusColor,
  getStatusText
}: OrdersSectionProps) {
  const filteredOrders = orders.filter(order => {
    if (activeTab === 'all') return true;
    if (activeTab === 'created') return order.status === 'created';
    if (activeTab === 'in_progress') return order.status === 'in_progress';
    if (activeTab === 'completed') return order.status === 'completed';
    if (activeTab === 'shipped') return order.status === 'shipped';
    return true;
  });

  return (
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
                  <DialogDescription>Создайте заявку на производство</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Номер заявки</Label>
                    <Input
                      value={newOrder.order_number}
                      onChange={(e) => setNewOrder({ ...newOrder, order_number: e.target.value })}
                      placeholder="2024-001"
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
                  <Button onClick={onCreateOrder} className="w-full" disabled={loading}>
                    {loading ? 'Создание...' : 'Создать'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
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
              Созданы
            </Button>
            <Button
              variant={activeTab === 'in_progress' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('in_progress')}
            >
              Выполняются
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
                    <TableCell className="text-right space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onPrintOrder(order)}
                      >
                        <Icon name="Printer" size={14} className="mr-1" />
                        Печать
                      </Button>
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
