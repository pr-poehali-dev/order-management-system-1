import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { TabsContent } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import Icon from '@/components/ui/icon';

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

interface ScheduleTabProps {
  schedule: ScheduleRecord[];
  scheduleUsers: ScheduleUser[];
  currentMonth: Date;
  setCurrentMonth: (date: Date) => void;
  onSaveSchedule: (userId: number, date: string, hours: number) => void;
  onUpdateSchedule: (scheduleId: number, hours: number) => void;
  onPrintSchedule: () => void;
}

export default function ScheduleTab({
  schedule,
  scheduleUsers,
  currentMonth,
  setCurrentMonth,
  onSaveSchedule,
  onUpdateSchedule,
  onPrintSchedule
}: ScheduleTabProps) {
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedUserId, setSelectedUserId] = useState<number>(0);
  const [hours, setHours] = useState<number>(0);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [editingRecordId, setEditingRecordId] = useState<number | null>(null);
  const [editingHours, setEditingHours] = useState<number>(0);

  const handleSaveSchedule = () => {
    onSaveSchedule(selectedUserId, selectedDate, hours);
    setScheduleDialogOpen(false);
    setSelectedDate('');
    setSelectedUserId(0);
    setHours(0);
  };

  const handleEditHours = (record: ScheduleRecord) => {
    setEditingRecordId(record.id);
    setEditingHours(record.hours);
  };

  const handleSaveEdit = (recordId: number) => {
    if (editingHours < 0 || editingHours > 24) {
      toast.error('Часы должны быть от 0 до 24');
      return;
    }
    onUpdateSchedule(recordId, editingHours);
    setEditingRecordId(null);
  };

  return (
    <TabsContent value="schedule" className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>График работы сотрудников</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {currentMonth.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
              >
                <Icon name="ChevronLeft" size={16} />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentMonth(new Date())}
              >
                Сегодня
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
              >
                <Icon name="ChevronRight" size={16} />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onPrintSchedule}
              >
                <Icon name="Printer" size={16} className="mr-1" />
                Печать
              </Button>
              <Dialog open={scheduleDialogOpen} onOpenChange={setScheduleDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Icon name="Plus" size={16} className="mr-2" />
                    Внести часы
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Внести рабочие часы</DialogTitle>
                    <DialogDescription>Укажите сотрудника, дату и количество часов</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Сотрудник</Label>
                      <select
                        className="w-full border rounded-md p-2"
                        value={selectedUserId}
                        onChange={(e) => setSelectedUserId(Number(e.target.value))}
                      >
                        <option value={0}>Выберите сотрудника</option>
                        {scheduleUsers.map(u => (
                          <option key={u.id} value={u.id}>{u.full_name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Label>Дата</Label>
                      <Input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Количество часов</Label>
                      <Input
                        type="number"
                        step="0.5"
                        min="0"
                        max="24"
                        value={hours}
                        onChange={(e) => setHours(Number(e.target.value))}
                        placeholder="8"
                      />
                    </div>
                    <Button onClick={handleSaveSchedule} className="w-full">
                      Сохранить
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {scheduleUsers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>Нет сотрудников для отображения</p>
            </div>
          ) : (
            <div className="space-y-6">
              {scheduleUsers.map(user => {
                const userRecords = schedule.filter(s => s.user_id === user.id);
                const totalHours = userRecords.reduce((sum, r) => sum + r.hours, 0);
                
                return (
                  <div key={user.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-lg">{user.full_name}</h3>
                        <p className="text-sm text-muted-foreground">@{user.login}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary">{totalHours.toFixed(1)} ч</div>
                        <div className="text-xs text-muted-foreground">Всего за месяц</div>
                      </div>
                    </div>
                    
                    {userRecords.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {userRecords.sort((a, b) => new Date(a.work_date).getTime() - new Date(b.work_date).getTime()).map(record => {
                          const date = new Date(record.work_date);
                          const isEditing = editingRecordId === record.id;
                          return (
                            <div
                              key={record.id}
                              className="border rounded px-3 py-2 text-center hover:bg-accent"
                            >
                              <div className="text-xs text-muted-foreground whitespace-nowrap">
                                {date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' })}
                              </div>
                              {isEditing ? (
                                <div className="flex items-center gap-1 mt-1">
                                  <Input
                                    type="number"
                                    step="0.5"
                                    min="0"
                                    max="24"
                                    value={editingHours}
                                    onChange={(e) => setEditingHours(Number(e.target.value))}
                                    className="w-16 h-6 text-xs"
                                  />
                                  <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => handleSaveEdit(record.id)}>
                                    <Icon name="Check" size={12} />
                                  </Button>
                                  <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => setEditingRecordId(null)}>
                                    <Icon name="X" size={12} />
                                  </Button>
                                </div>
                              ) : (
                                <div className="flex items-center gap-1 mt-1">
                                  <div className="text-sm font-semibold">{record.hours} ч</div>
                                  <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => handleEditHours(record)}>
                                    <Icon name="Pencil" size={12} />
                                  </Button>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </TabsContent>
  );
}