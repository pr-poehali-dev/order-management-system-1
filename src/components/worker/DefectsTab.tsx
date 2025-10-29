import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TabsContent } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';

export default function DefectsTab() {
  return (
    <TabsContent value="defects" className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Учет брака</CardTitle>
          <CardDescription>Списание бракованных материалов и изделий</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Icon name="AlertTriangle" size={48} className="mx-auto mb-4 opacity-50" />
            <p>Функция учета брака в разработке</p>
          </div>
        </CardContent>
      </Card>
    </TabsContent>
  );
}
