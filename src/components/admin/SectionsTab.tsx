import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { TabsContent } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';

interface Section {
  id: number;
  name: string;
  description: string;
}

interface SectionsTabProps {
  sections: Section[];
  loading: boolean;
  onCreateSection: (section: { name: string; description: string }) => Promise<void>;
  onDeleteSection: (sectionId: number) => void;
}

export default function SectionsTab({ sections, loading, onCreateSection, onDeleteSection }: SectionsTabProps) {
  const [sectionDialogOpen, setSectionDialogOpen] = useState(false);
  const [newSection, setNewSection] = useState({
    name: '',
    description: ''
  });

  const handleCreateSection = async () => {
    await onCreateSection(newSection);
    setSectionDialogOpen(false);
    setNewSection({ name: '', description: '' });
  };

  return (
    <TabsContent value="sections" className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Управление разделами</CardTitle>
              <CardDescription>Создание категорий для группировки материалов</CardDescription>
            </div>
            <Dialog open={sectionDialogOpen} onOpenChange={setSectionDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Icon name="FolderPlus" size={16} className="mr-2" />
                  Добавить раздел
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Новый раздел</DialogTitle>
                  <DialogDescription>Создайте раздел для группировки материалов</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Название раздела</Label>
                    <Input
                      value={newSection.name}
                      onChange={(e) => setNewSection({ ...newSection, name: e.target.value })}
                      placeholder="Например: Пластики"
                    />
                  </div>
                  <div>
                    <Label>Описание</Label>
                    <Input
                      value={newSection.description}
                      onChange={(e) => setNewSection({ ...newSection, description: e.target.value })}
                      placeholder="Краткое описание раздела"
                    />
                  </div>
                  <Button onClick={handleCreateSection} disabled={loading} className="w-full">
                    {loading ? 'Создание...' : 'Создать'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Название</TableHead>
                <TableHead>Описание</TableHead>
                <TableHead className="text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sections.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.name}</TableCell>
                  <TableCell className="text-muted-foreground">{s.description || '—'}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => onDeleteSection(s.id)}
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
