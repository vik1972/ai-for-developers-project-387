import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Card,
  Title,
  Text,
  Button,
  Loader,
  Group,
  Stack,
  Container,
  Alert,
  Tabs,
  Switch,
  TextInput,
  Divider,
  Badge,
  ActionIcon,
  Grid
} from '@mantine/core'
import { ArrowLeft, Plus, Trash, Clock, Calendar } from 'lucide-react'
import { availabilityApi } from '../api/availability'
import type { AvailabilitySchedule, AvailabilityException, DaySchedule } from '../types/api'
import dayjs from 'dayjs'

const DAYS_OF_WEEK = [
  { key: 'mon', label: 'Понедельник' },
  { key: 'tue', label: 'Вторник' },
  { key: 'wed', label: 'Среда' },
  { key: 'thu', label: 'Четверг' },
  { key: 'fri', label: 'Пятница' },
  { key: 'sat', label: 'Суббота' },
  { key: 'sun', label: 'Воскресенье' }
]

const DEFAULT_DAY_SCHEDULE: DaySchedule = {
  enabled: true,
  start: '09:00',
  end: '17:00'
}

export function AvailabilityPage() {
  const [schedules, setSchedules] = useState<AvailabilitySchedule[]>([])
  const [exceptions, setExceptions] = useState<AvailabilityException[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<string | null>('schedules')

  useEffect(() => {
    loadAvailability()
  }, [])

  const loadAvailability = async () => {
    try {
      setLoading(true)
      const [schedulesData, exceptionsData] = await Promise.all([
        availabilityApi.getSchedules(),
        availabilityApi.getExceptions()
      ])
      setSchedules(schedulesData)
      setExceptions(exceptionsData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load availability')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container size="xl" py="xl">
      <Group mb="xl">
        <Button
          component={Link}
          to="/dashboard"
          leftSection={<ArrowLeft size={16} />}
          variant="light"
        >
          Назад
        </Button>
        <Title order={2}>Настройки доступности</Title>
      </Group>

      {error && (
        <Alert color="red" mb="md" icon={<Clock size={16} />}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Loader />
      ) : (
        <Tabs value={activeTab} onChange={setActiveTab}>
          <Tabs.List>
            <Tabs.Tab value="schedules" leftSection={<Clock size={16} />}>
              Расписания ({schedules.length})
            </Tabs.Tab>
            <Tabs.Tab value="exceptions" leftSection={<Calendar size={16} />}>
              Исключения ({exceptions.length})
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="schedules" pt="xl">
            <SchedulesTab
              schedules={schedules}
              onUpdate={loadAvailability}
            />
          </Tabs.Panel>

          <Tabs.Panel value="exceptions" pt="xl">
            <ExceptionsTab
              exceptions={exceptions}
              onUpdate={loadAvailability}
            />
          </Tabs.Panel>
        </Tabs>
      )}
    </Container>
  )
}

// Schedules Tab Component
function SchedulesTab({
  schedules,
  onUpdate
}: {
  schedules: AvailabilitySchedule[]
  onUpdate: () => void
}) {
  const [editingSchedule, setEditingSchedule] = useState<AvailabilitySchedule | null>(null)
  const [isCreating, setIsCreating] = useState(false)

  const handleSaveSchedule = async (schedule: AvailabilitySchedule) => {
    try {
      if (schedule.id) {
        await availabilityApi.updateSchedule(schedule.id, {
          name: schedule.name,
          is_default: schedule.is_default,
          schedule: schedule.schedule
        })
      } else {
        await availabilityApi.createSchedule({
          name: schedule.name,
          is_default: schedule.is_default,
          schedule: schedule.schedule
        })
      }
      setEditingSchedule(null)
      setIsCreating(false)
      onUpdate()
    } catch (err) {
      console.error('Failed to save schedule:', err)
    }
  }

  const handleDeleteSchedule = async (id: number) => {
    if (!confirm('Удалить это расписание?')) return
    try {
      await availabilityApi.deleteSchedule(id)
      onUpdate()
    } catch (err) {
      console.error('Failed to delete schedule:', err)
    }
  }

  if (isCreating || editingSchedule) {
    return (
      <ScheduleEditor
        schedule={editingSchedule || {
          id: 0,
          name: 'Новое расписание',
          is_default: false,
          schedule: {
            mon: { ...DEFAULT_DAY_SCHEDULE },
            tue: { ...DEFAULT_DAY_SCHEDULE },
            wed: { ...DEFAULT_DAY_SCHEDULE },
            thu: { ...DEFAULT_DAY_SCHEDULE },
            fri: { ...DEFAULT_DAY_SCHEDULE },
            sat: { ...DEFAULT_DAY_SCHEDULE, enabled: false },
            sun: { ...DEFAULT_DAY_SCHEDULE, enabled: false }
          }
        }}
        onSave={handleSaveSchedule}
        onCancel={() => {
          setEditingSchedule(null)
          setIsCreating(false)
        }}
      />
    )
  }

  return (
    <Stack>
      <Group justify="space-between">
        <Text c="dimmed">Управляйте рабочими часами по дням недели</Text>
        <Button onClick={() => setIsCreating(true)} leftSection={<Plus size={16} />}>
          Новое расписание
        </Button>
      </Group>

      {schedules.map((schedule) => (
        <Card key={schedule.id} p="lg" withBorder>
          <Group justify="space-between" align="flex-start">
            <div>
              <Group gap="xs">
                <Title order={4}>{schedule.name}</Title>
                {schedule.is_default && (
                  <Badge color="blue" variant="light">По умолчанию</Badge>
                )}
              </Group>
              <Text size="sm" c="dimmed" mt="xs">
                {Object.entries(schedule.schedule)
                  .filter(([, day]) => day.enabled)
                  .map(([day]) => DAYS_OF_WEEK.find(d => d.key === day)?.label)
                  .join(', ') || 'Нет рабочих дней'}
              </Text>
            </div>
            <Group>
              <Button variant="light" onClick={() => setEditingSchedule(schedule)}>
                Редактировать
              </Button>
              <ActionIcon
                color="red"
                variant="light"
                onClick={() => handleDeleteSchedule(schedule.id)}
              >
                <Trash size={16} />
              </ActionIcon>
            </Group>
          </Group>
        </Card>
      ))}

      {schedules.length === 0 && (
        <Text c="dimmed" ta="center" py="xl">
          Нет созданных расписаний. Создайте первое расписание рабочих часов.
        </Text>
      )}
    </Stack>
  )
}

// Schedule Editor Component
function ScheduleEditor({
  schedule,
  onSave,
  onCancel
}: {
  schedule: AvailabilitySchedule
  onSave: (schedule: AvailabilitySchedule) => void
  onCancel: () => void
}) {
  const [editedSchedule, setEditedSchedule] = useState(schedule)

  const updateDaySchedule = (day: string, updates: Partial<DaySchedule>) => {
    setEditedSchedule(prev => ({
      ...prev,
      schedule: {
        ...prev.schedule,
        [day]: { ...prev.schedule[day], ...updates }
      }
    }))
  }

  return (
    <Card p="xl" withBorder>
      <Stack gap="lg">
        <TextInput
          label="Название расписания"
          value={editedSchedule.name}
          onChange={(e) => setEditedSchedule({ ...editedSchedule, name: e.target.value })}
          required
        />

        <Switch
          label="Использовать по умолчанию"
          checked={editedSchedule.is_default}
          onChange={(e) => setEditedSchedule({ ...editedSchedule, is_default: e.target.checked })}
        />

        <Divider label="Дни недели" />

        <Grid>
          {DAYS_OF_WEEK.map(({ key, label }) => (
            <Grid.Col span={{ xs: 12, sm: 6, md: 4 }} key={key}>
              <Card p="md" withBorder>
                <Stack gap="xs">
                  <Group justify="space-between">
                    <Text fw={500}>{label}</Text>
                    <Switch
                      checked={editedSchedule.schedule[key]?.enabled || false}
                      onChange={(e) => updateDaySchedule(key, { enabled: e.target.checked })}
                    />
                  </Group>

                  {editedSchedule.schedule[key]?.enabled && (
                    <Group grow>
                      <TextInput
                        label="Начало"
                        type="time"
                        value={editedSchedule.schedule[key]?.start || '09:00'}
                        onChange={(e) => updateDaySchedule(key, { start: e.target.value })}
                        size="xs"
                      />
                      <TextInput
                        label="Конец"
                        type="time"
                        value={editedSchedule.schedule[key]?.end || '17:00'}
                        onChange={(e) => updateDaySchedule(key, { end: e.target.value })}
                        size="xs"
                      />
                    </Group>
                  )}
                </Stack>
              </Card>
            </Grid.Col>
          ))}
        </Grid>

        <Group justify="flex-end" mt="md">
          <Button variant="light" onClick={onCancel}>Отмена</Button>
          <Button onClick={() => onSave(editedSchedule)}>Сохранить</Button>
        </Group>
      </Stack>
    </Card>
  )
}

// Exceptions Tab Component
function ExceptionsTab({
  exceptions,
  onUpdate
}: {
  exceptions: AvailabilityException[]
  onUpdate: () => void
}) {
  const [isCreating, setIsCreating] = useState(false)
  const [newException, setNewException] = useState<Partial<AvailabilityException>>({
    date: dayjs().add(1, 'day').format('YYYY-MM-DD'),
    is_available: false,
    reason: ''
  })

  const handleCreateException = async () => {
    if (!newException.date) return
    try {
      await availabilityApi.createException({
        date: newException.date,
        is_available: newException.is_available || false,
        reason: newException.reason
      })
      setIsCreating(false)
      setNewException({
        date: dayjs().add(1, 'day').format('YYYY-MM-DD'),
        is_available: false,
        reason: ''
      })
      onUpdate()
    } catch (err) {
      console.error('Failed to create exception:', err)
    }
  }

  const handleDeleteException = async (id: number) => {
    if (!confirm('Удалить это исключение?')) return
    try {
      await availabilityApi.deleteException(id)
      onUpdate()
    } catch (err) {
      console.error('Failed to delete exception:', err)
    }
  }

  return (
    <Stack>
      <Group justify="space-between">
        <Text c="dimmed">Добавьте исключения для отпусков, праздников или нерабочих дней</Text>
        <Button
          onClick={() => setIsCreating(true)}
          leftSection={<Plus size={16} />}
          disabled={isCreating}
        >
          Добавить исключение
        </Button>
      </Group>

      {isCreating && (
        <Card p="md" withBorder>
          <Stack gap="md">
            <TextInput
              label="Дата"
              type="date"
              value={newException.date}
              onChange={(e) => setNewException({ ...newException, date: e.target.value })}
              required
            />
            <Switch
              label="День доступен для бронирования"
              checked={newException.is_available}
              onChange={(e) => setNewException({ ...newException, is_available: e.target.checked })}
            />
            <TextInput
              label="Причина (опционально)"
              placeholder="Отпуск, праздник..."
              value={newException.reason || ''}
              onChange={(e) => setNewException({ ...newException, reason: e.target.value })}
            />
            <Group justify="flex-end">
              <Button variant="light" onClick={() => setIsCreating(false)}>Отмена</Button>
              <Button onClick={handleCreateException}>Добавить</Button>
            </Group>
          </Stack>
        </Card>
      )}

      {exceptions.map((exception) => (
        <Card key={exception.id} p="md" withBorder>
          <Group justify="space-between" align="center">
            <div>
              <Group gap="xs">
                <Text fw={500}>
                  {dayjs(exception.date).format('D MMMM YYYY')}
                </Text>
                <Badge
                  color={exception.is_available ? 'green' : 'red'}
                  variant="light"
                >
                  {exception.is_available ? 'Доступен' : 'Выходной'}
                </Badge>
              </Group>
              {exception.reason && (
                <Text size="sm" c="dimmed" mt={4}>
                  {exception.reason}
                </Text>
              )}
            </div>
            <ActionIcon
              color="red"
              variant="light"
              onClick={() => handleDeleteException(exception.id)}
            >
              <Trash size={16} />
            </ActionIcon>
          </Group>
        </Card>
      ))}

      {exceptions.length === 0 && (
        <Text c="dimmed" ta="center" py="xl">
          Нет исключений. Добавьте отпуска, праздники или другие нерабочие дни.
        </Text>
      )}
    </Stack>
  )
}
