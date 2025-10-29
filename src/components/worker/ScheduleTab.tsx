import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { TabsContent } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
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
}

export default function ScheduleTab({
  schedule,
  scheduleUsers,
  currentMonth,
  setCurrentMonth,
  onSaveSchedule
}: ScheduleTabProps) {
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedUserId, setSelectedUserId] = useState<number>(0);
  const [hours, setHours] = useState<number>(0);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);

  const handleSaveSchedule = () => {
    onSaveSchedule(selectedUserId, selectedDate, hours);
    setScheduleDialogOpen(false);
    setSelectedDate('');
    setSelectedUserId(0);
    setHours(0);
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
                      <div className="grid grid-cols-7 gap-1 mt-3">
                        {userRecords.sort((a, b) => new Date(a.work_date).getTime() - new Date(b.work_date).getTime()).map(record => {
                          const date = new Date(record.work_date);
                          return (
                            <div
                              key={record.id}
                              className="border rounded p-2 text-center hover:bg-accent cursor-pointer"
                              title={`${date.toLocaleDateString('ru-RU')}: ${record.hours} ч`}
                            >
                              <div className="text-xs text-muted-foreground">
                                {date.getDate()}
                              </div>
                              <div className="text-sm font-semibold">
                                {record.hours}
                              </div>
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
