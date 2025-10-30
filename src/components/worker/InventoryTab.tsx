import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TabsContent } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';

interface Material {
  id: number;
  name: string;
  quantity: number;
}

interface InventoryTabProps {
  materials: Material[];
  onUpdateInventory: (materialId: number, change: number) => void;
  onDeleteMaterial: (materialId: number) => void;
  onPrintInventory: () => void;
}

export default function InventoryTab({ materials, onUpdateInventory, onDeleteMaterial, onPrintInventory }: InventoryTabProps) {
  return (
    <TabsContent value="inventory" className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Остатки материалов</CardTitle>
              <CardDescription>Учет складских остатков</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={onPrintInventory}>
              <Icon name="Printer" size={16} className="mr-1" />
              Печать
            </Button>
          </div>
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
                        if (amount) onUpdateInventory(m.id, Number(amount));
                      }}
                    >
                      <Icon name="Plus" size={14} />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const amount = prompt('Количество для списания:');
                        if (amount) onUpdateInventory(m.id, -Number(amount));
                      }}
                    >
                      <Icon name="Minus" size={14} />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => onDeleteMaterial(m.id)}
                    >
                      <Icon name="Trash2" size={14} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </TabsContent>
  );
}