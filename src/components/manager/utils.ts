export const playNotificationSound = () => {
  const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIGGS56+mmUhELTqXh8bhfGwU7k9n1yX4qBSiBzvLZijcIF2K76+aeSxkNUKXj7rdgGQU7ktm1yHwpBSh+zPPaizsIGGC46+aeTBYNVajk67RZFwtAfNKlum4eB2hCbZa8W9lbkL/J1ejkuoj4aSWd0+f7zdmn9Qs0kNvx07xmHQY2iNXyx3wqBiZ7y/Haj');
  audio.play().catch(() => {});
};

export const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    created: 'bg-red-500',
    in_progress: 'bg-yellow-500',
    completed: 'bg-green-500',
    shipped: 'bg-blue-500'
  };
  return colors[status] || 'bg-gray-500';
};

export const getStatusText = (status: string) => {
  const texts: Record<string, string> = {
    created: 'Создана',
    in_progress: 'Выполняется',
    completed: 'Исполнена',
    shipped: 'Отправлено'
  };
  return texts[status] || status;
};

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

export const printOrder = (order: Order) => {
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
        <tr><th>Выполнено</th><td>${order.completed_quantity} / ${order.quantity} шт.</td></tr>
        <tr><th>Статус</th><td><span class="status status-${order.status}">${getStatusText(order.status)}</span></td></tr>
        <tr><th>Дата создания</th><td>${new Date(order.created_at).toLocaleDateString('ru-RU')}</td></tr>
      </table>
      <script>window.print();</script>
    </body>
    </html>
  `;

  printWindow.document.write(content);
  printWindow.document.close();
};

interface Material {
  id: number;
  name: string;
  quantity: number;
}

export const printInventory = (materials: Material[]) => {
  const printContent = `
    <html>
      <head>
        <title>Остатки материалов</title>
        <style>
          body { font-family: Arial; padding: 20px; }
          h1 { text-align: center; margin-bottom: 30px; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #000; padding: 12px; text-align: left; }
          th { background-color: #f0f0f0; font-weight: bold; }
        </style>
      </head>
      <body>
        <h1>Остатки материалов</h1>
        <table>
          <thead>
            <tr>
              <th>Материал</th>
              <th>Количество</th>
            </tr>
          </thead>
          <tbody>
            ${materials.map(m => `
              <tr>
                <td>${m.name}</td>
                <td>${m.quantity}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </body>
    </html>
  `;
  const win = window.open('', '', 'height=800,width=800');
  win?.document.write(printContent);
  win?.document.close();
  win?.print();
};
