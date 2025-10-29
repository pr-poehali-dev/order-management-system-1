import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TabsContent } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';

export default function AnalyticsTab() {
  return (
    <TabsContent value="analytics" className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Всего заявок</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">—</div>
            <p className="text-xs text-muted-foreground mt-1">За все время</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Активных пользователей</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">—</div>
            <p className="text-xs text-muted-foreground mt-1">За последний месяц</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Остатков на складе</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">—</div>
            <p className="text-xs text-muted-foreground mt-1">Позиций материалов</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Аналитика и отчеты</CardTitle>
          <CardDescription>Статистика работы системы</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <Icon name="BarChart3" size={64} className="mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium">Раздел аналитики в разработке</p>
            <p className="text-sm mt-2">Здесь будут графики, отчеты и детальная статистика</p>
          </div>
        </CardContent>
      </Card>
    </TabsContent>
  );
}
