import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';
import OrdersTab from '@/components/worker/OrdersTab';
import InventoryTab from '@/components/worker/InventoryTab';
import DefectsTab from '@/components/worker/DefectsTab';
import ScheduleTab from '@/components/worker/ScheduleTab';

const ORDERS_API = 'https://functions.poehali.dev/0ffd935b-d2ee-48e1-a9e4-2b8fe0ffb3dd';
const MATERIALS_API = 'https://functions.poehali.dev/74905bf8-26b1-4b87-9a75-660316d4ba77';
const SCHEDULE_API = 'https://functions.poehali.dev/f617714b-d72a-41e1-87ec-519f6dff2f28';

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

interface ScheduleRecord {
  id: number;
  user_id: number;
  work_date: string;
  hours: number;
  full_name: string;
  login: string;
}

interface ScheduleUser {
  id: number;
  full_name: string;
  login: string;
}

interface WorkerPanelProps {
  user: User;
  onLogout: () => void;
}

export default function WorkerPanel({ user, onLogout }: WorkerPanelProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [activeTab, setActiveTab] = useState('all');
  const [schedule, setSchedule] = useState<ScheduleRecord[]>([]);
  const [scheduleUsers, setScheduleUsers] = useState<ScheduleUser[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    loadOrders();
    loadMaterials();
    loadSchedule();
    const interval = setInterval(loadOrders, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    loadSchedule();
  }, [currentMonth]);

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

  const loadSchedule = async () => {
    try {
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth() + 1;
      const response = await fetch(`${SCHEDULE_API}?year=${year}&month=${month}`);
      const data = await response.json();
      setSchedule(data.schedule || []);
      setScheduleUsers(data.users || []);
    } catch (error) {
      toast.error('Ошибка загрузки графика');
    }
  };

  const handleSaveSchedule = async (userId: number, date: string, hours: number) => {
    if (!date || !userId || hours < 0) {
      toast.error('Заполните все поля');
      return;
    }

    try {
      await fetch(SCHEDULE_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          work_date: date,
          hours: hours
        })
      });

      toast.success('Часы внесены');
      loadSchedule();
    } catch (error) {
      toast.error('Ошибка сохранения');
    }
  };

  const updateOrderProgress = async (order: Order, completedAmount: number) => {
    if (completedAmount <= 0) {
      toast.error('Укажите корректное количество');
      return;
    }

    const newCompleted = order.completed_quantity + completedAmount;

    if (newCompleted > order.quantity) {
      toast.error('Количество превышает заказанное');
      return;
    }

    try {
      await fetch(ORDERS_API, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: order.id, completed_quantity: newCompleted })
      });

      toast.success('Прогресс обновлен');
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

  const deleteOrder = async (orderId: number) => {
    if (!confirm('Удалить эту заявку?')) return;

    try {
      const response = await fetch(`${ORDERS_API}?id=${orderId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast.success('Заявка удалена');
        loadOrders();
      }
    } catch (error) {
      toast.error('Ошибка удаления заявки');
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
          <TabsList className="grid w-full max-w-2xl grid-cols-4">
            <TabsTrigger value="orders">
              <Icon name="ClipboardList" size={16} className="mr-2" />
              Заявки
            </TabsTrigger>
            <TabsTrigger value="inventory">
              <Icon name="Package" size={16} className="mr-2" />
              Остатки
            </TabsTrigger>
            <TabsTrigger value="defects">
              <Icon name="AlertTriangle" size={16} className="mr-2" />
              Брак
            </TabsTrigger>
            <TabsTrigger value="schedule">
              <Icon name="Calendar" size={16} className="mr-2" />
              График
            </TabsTrigger>
          </TabsList>

          <OrdersTab
            orders={orders}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onUpdateProgress={updateOrderProgress}
            onMarkAsShipped={markAsShipped}
            onDeleteOrder={deleteOrder}
            getStatusColor={getStatusColor}
            getStatusText={getStatusText}
          />

          <InventoryTab
            materials={materials}
            onUpdateInventory={updateInventory}
          />

          <DefectsTab />

          <ScheduleTab
            schedule={schedule}
            scheduleUsers={scheduleUsers}
            currentMonth={currentMonth}
            setCurrentMonth={setCurrentMonth}
            onSaveSchedule={handleSaveSchedule}
          />
        </Tabs>
      </div>
    </div>
  );
}