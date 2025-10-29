import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';
import UsersTab from '@/components/admin/UsersTab';
import MaterialsTab from '@/components/admin/MaterialsTab';
import SectionsTab from '@/components/admin/SectionsTab';
import AnalyticsTab from '@/components/admin/AnalyticsTab';

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

  const createUser = async (newUser: { login: string; password: string; role: string; full_name: string }) => {
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

  const createMaterial = async (newMaterial: any) => {
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
        loadMaterials();
      }
    } catch (error) {
      toast.error('Ошибка добавления материала');
    } finally {
      setLoading(false);
    }
  };

  const updateMaterial = async (material: Material) => {
    if (!material.name) {
      toast.error('Укажите название материала');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(MATERIALS_API, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(material)
      });

      if (response.ok) {
        toast.success('Материал обновлён');
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

  const createSection = async (newSection: { name: string; description: string }) => {
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
          <TabsList className="grid w-full max-w-2xl grid-cols-4">
            <TabsTrigger value="users">
              <Icon name="Users" size={16} className="mr-2" />
              Пользователи
            </TabsTrigger>
            <TabsTrigger value="materials">
              <Icon name="Package" size={16} className="mr-2" />
              Материалы
            </TabsTrigger>
            <TabsTrigger value="sections">
              <Icon name="Folder" size={16} className="mr-2" />
              Разделы
            </TabsTrigger>
            <TabsTrigger value="analytics">
              <Icon name="BarChart3" size={16} className="mr-2" />
              Аналитика
            </TabsTrigger>
          </TabsList>

          <UsersTab
            users={users}
            loading={loading}
            onCreateUser={createUser}
            onDeleteUser={deleteUser}
            getRoleName={getRoleName}
          />

          <MaterialsTab
            materials={materials}
            sections={sections}
            loading={loading}
            onCreateMaterial={createMaterial}
            onUpdateMaterial={updateMaterial}
            onDeleteMaterial={deleteMaterial}
          />

          <SectionsTab
            sections={sections}
            loading={loading}
            onCreateSection={createSection}
            onDeleteSection={deleteSection}
          />

          <AnalyticsTab />
        </Tabs>
      </div>
    </div>
  );
}
