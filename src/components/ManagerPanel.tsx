import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';
import OrdersSection from './manager/OrdersSection';
import InventorySection from './manager/InventorySection';
import { playNotificationSound, getStatusColor, getStatusText, printOrder, printInventory } from './manager/utils';

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

  const deleteMaterial = async (materialId: number) => {
    if (!confirm('Удалить этот материал?')) return;

    try {
      const response = await fetch(`${MATERIALS_API}?id=${materialId}`, {
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

  const handlePrintInventory = () => {
    printInventory(materials);
  };

  const handlePrintOrder = (order: Order) => {
    printOrder(order);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Icon name="Briefcase" size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Панель руководителя</h1>
              <p className="text-sm text-gray-600">{user.full_name}</p>
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

          <OrdersSection
            orders={orders}
            materials={materials}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            dialogOpen={dialogOpen}
            setDialogOpen={setDialogOpen}
            loading={loading}
            newOrder={newOrder}
            setNewOrder={setNewOrder}
            onCreateOrder={createOrder}
            onDeleteOrder={deleteOrder}
            onPrintOrder={handlePrintOrder}
            getStatusColor={getStatusColor}
            getStatusText={getStatusText}
          />

          <InventorySection
            materials={materials}
            onUpdateInventory={updateInventory}
            onDeleteMaterial={deleteMaterial}
            onPrintInventory={handlePrintInventory}
          />
        </Tabs>
      </div>
    </div>
  );
}
