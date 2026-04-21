import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Card,
  Title,
  Text,
  Button,
  Loader,
  Group,
  Badge,
  Table,
  ActionIcon,
  Select,
  TextInput,
  Checkbox,
  Menu,
  Pagination,
  Modal,
  Textarea,
  Stack,
  Container
} from '@mantine/core'
import {
  Trash2,
  Plus,
  CalendarDays,
  Search,
  Filter,
  MoreVertical,
  X,
  RotateCcw,
  Check,
  UserX
} from 'lucide-react'
import { bookingsApi } from '../api/bookings'
import { useEventsStore } from '../store/events'
import type { Booking, BookingStatus } from '../types/api'
import dayjs from 'dayjs'

const STATUS_COLORS: Record<BookingStatus, string> = {
  pending: 'yellow',
  confirmed: 'green',
  cancelled: 'red',
  completed: 'blue',
  no_show: 'gray'
}

const STATUS_LABELS: Record<BookingStatus, string> = {
  pending: 'Ожидает',
  confirmed: 'Подтверждено',
  cancelled: 'Отменено',
  completed: 'Завершено',
  no_show: 'Неявка'
}

export function BookingsDashboardPage() {
  const { events } = useEventsStore()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [meta, setMeta] = useState({
    total_count: 0,
    page: 1,
    per_page: 20,
    total_pages: 1
  })

  // Filters
  const [filters, setFilters] = useState({
    status: '',
    event_id: '',
    time_filter: 'upcoming',
    search: '',
    sort_by: 'slot',
    sort_order: 'asc' as 'asc' | 'desc',
    page: 1
  })

  // Selection
  const [selectedIds, setSelectedIds] = useState<number[]>([])

  // Modal states
  const [cancelModalOpen, setCancelModalOpen] = useState(false)
  const [cancelReason, setCancelReason] = useState('')
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false)
  const [newSlot, setNewSlot] = useState('')
  const [activeBooking, setActiveBooking] = useState<Booking | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const response = await bookingsApi.getAll({
          ...filters,
          per_page: 20
        })
        setBookings(response.bookings)
        setMeta(response.meta)
        setSelectedIds([])
      } catch (err) {
        console.error('Failed to load bookings:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [filters])

  const loadBookings = async () => {
    const response = await bookingsApi.getAll({
      ...filters,
      per_page: 20
    })
    setBookings(response.bookings)
    setMeta(response.meta)
    setSelectedIds([])
  }

  const handleCancel = async (booking: Booking) => {
    setActiveBooking(booking)
    setCancelModalOpen(true)
  }

  const confirmCancel = async () => {
    if (!activeBooking) return
    try {
      await bookingsApi.cancel(activeBooking.id, cancelReason)
      loadBookings()
      setCancelModalOpen(false)
      setCancelReason('')
      setActiveBooking(null)
    } catch (err) {
      console.error('Failed to cancel booking:', err)
    }
  }

  const handleReschedule = async (booking: Booking) => {
    setActiveBooking(booking)
    setNewSlot(dayjs(booking.slot).format('YYYY-MM-DDTHH:mm'))
    setRescheduleModalOpen(true)
  }

  const confirmReschedule = async () => {
    if (!activeBooking || !newSlot) return
    try {
      await bookingsApi.reschedule(activeBooking.id, newSlot)
      loadBookings()
      setRescheduleModalOpen(false)
      setActiveBooking(null)
    } catch (err) {
      console.error('Failed to reschedule booking:', err)
    }
  }

  const handleStatusChange = async (bookingId: number, status: BookingStatus) => {
    try {
      await bookingsApi.updateStatus(bookingId, status)
      loadBookings()
    } catch (err) {
      console.error('Failed to update status:', err)
    }
  }

  const handleBulkCancel = async () => {
    if (selectedIds.length === 0) return
    if (!confirm(`Отменить ${selectedIds.length} бронирований?`)) return

    try {
      await bookingsApi.bulkCancel(selectedIds)
      loadBookings()
    } catch (err) {
      console.error('Failed to bulk cancel:', err)
    }
  }

  const handleBulkStatusUpdate = async (status: BookingStatus) => {
    if (selectedIds.length === 0) return
    try {
      await bookingsApi.bulkUpdateStatus(selectedIds, status)
      loadBookings()
    } catch (err) {
      console.error('Failed to bulk update status:', err)
    }
  }

  const toggleSelectAll = () => {
    if (selectedIds.length === bookings.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(bookings.map(b => b.id))
    }
  }

  const toggleSelect = (id: number) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id))
    } else {
      setSelectedIds([...selectedIds, id])
    }
  }

  const formatDateTime = (dateTimeString: string) => {
    return dayjs(dateTimeString).format('D MMM YYYY, HH:mm')
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}ч ${mins}м`
    }
    return `${mins}м`
  }

  return (
    <Container size="xl" py="xl">
      <Group justify="space-between" mb="xl">
        <div>
          <Title order={2}>Управление бронированиями</Title>
          <Text c="dimmed" size="sm">
            Все бронирования: {meta.total_count}
          </Text>
        </div>
        <Group>
          <Button
            component={Link}
            to="/dashboard"
            variant="light"
            leftSection={<CalendarDays size={16} />}
          >
            Дашборд
          </Button>
          <Button
            component={Link}
            to="/"
            leftSection={<Plus size={16} />}
          >
            Новое бронирование
          </Button>
        </Group>
      </Group>

      {/* Filters */}
      <Card p="md" mb="xl" withBorder>
        <Group gap="sm" wrap="wrap">
          <Select
            placeholder="Статус"
            clearable
            value={filters.status}
            onChange={(val) => setFilters({ ...filters, status: val || '', page: 1 })}
            data={[
              { value: 'pending', label: 'Ожидает' },
              { value: 'confirmed', label: 'Подтверждено' },
              { value: 'cancelled', label: 'Отменено' },
              { value: 'completed', label: 'Завершено' },
              { value: 'no_show', label: 'Неявка' }
            ]}
            style={{ width: 150 }}
          />

          <Select
            placeholder="Тип события"
            clearable
            value={filters.event_id}
            onChange={(val) => setFilters({ ...filters, event_id: val || '', page: 1 })}
            data={events.map(e => ({ value: e.id.toString(), label: e.name }))}
            style={{ width: 200 }}
          />

          <Select
            placeholder="Время"
            value={filters.time_filter}
            onChange={(val) => setFilters({ ...filters, time_filter: val || 'upcoming', page: 1 })}
            data={[
              { value: 'upcoming', label: 'Предстоящие' },
              { value: 'past', label: 'Прошедшие' },
              { value: 'today', label: 'Сегодня' }
            ]}
            style={{ width: 150 }}
          />

          <TextInput
            placeholder="Поиск..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
            leftSection={<Search size={16} />}
            style={{ width: 200 }}
          />

          <Button
            variant="light"
            leftSection={<Filter size={16} />}
            onClick={loadBookings}
          >
            Применить
          </Button>
        </Group>
      </Card>

      {/* Bulk Actions */}
      {selectedIds.length > 0 && (
        <Card p="md" mb="md" withBorder style={{ background: '#f8f9fa' }}>
          <Group justify="space-between">
            <Text size="sm">Выбрано: {selectedIds.length}</Text>
            <Group>
              <Button size="xs" variant="light" onClick={() => handleBulkStatusUpdate('confirmed')}>
                Подтвердить
              </Button>
              <Button size="xs" variant="light" onClick={() => handleBulkStatusUpdate('completed')}>
                Завершить
              </Button>
              <Button size="xs" color="red" variant="light" onClick={handleBulkCancel}>
                Отменить
              </Button>
            </Group>
          </Group>
        </Card>
      )}

      {/* Bookings Table */}
      <Card withBorder>
        {loading ? (
          <Group justify="center" p="xl">
            <Loader />
          </Group>
        ) : bookings.length === 0 ? (
          <Text c="dimmed" ta="center" py="xl">
            Нет бронирований
          </Text>
        ) : (
          <>
            <Table>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th style={{ width: 40 }}>
                    <Checkbox
                      checked={selectedIds.length === bookings.length && bookings.length > 0}
                      onChange={toggleSelectAll}
                    />
                  </Table.Th>
                  <Table.Th>Событие</Table.Th>
                  <Table.Th>Гость</Table.Th>
                  <Table.Th>Дата и время</Table.Th>
                  <Table.Th>Статус</Table.Th>
                  <Table.Th>Действия</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {bookings.map((booking) => (
                  <Table.Tr key={booking.id} style={{ opacity: booking.status === 'cancelled' ? 0.6 : 1 }}>
                    <Table.Td>
                      <Checkbox
                        checked={selectedIds.includes(booking.id)}
                        onChange={() => toggleSelect(booking.id)}
                      />
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm" fw={500}>{booking.event?.name}</Text>
                      <Text size="xs" c="dimmed">
                        {booking.event ? formatDuration(booking.event.duration) : '-'}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm">{booking.guest_name || 'Не указано'}</Text>
                      <Text size="xs" c="dimmed">{booking.guest_email}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm">{formatDateTime(booking.slot)}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Badge color={STATUS_COLORS[booking.status]}>
                        {STATUS_LABELS[booking.status]}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Menu>
                        <Menu.Target>
                          <ActionIcon variant="subtle">
                            <MoreVertical size={16} />
                          </ActionIcon>
                        </Menu.Target>
                        <Menu.Dropdown>
                          {booking.status !== 'cancelled' && (
                            <>
                              <Menu.Item
                                leftSection={<Check size={14} />}
                                onClick={() => handleStatusChange(booking.id, 'confirmed')}
                              >
                                Подтвердить
                              </Menu.Item>
                              <Menu.Item
                                leftSection={<RotateCcw size={14} />}
                                onClick={() => handleReschedule(booking)}
                              >
                                Перенести
                              </Menu.Item>
                              <Menu.Item
                                leftSection={<X size={14} />}
                                color="red"
                                onClick={() => handleCancel(booking)}
                              >
                                Отменить
                              </Menu.Item>
                            </>
                          )}
                          {booking.status === 'confirmed' && (
                            <Menu.Item
                              leftSection={<Check size={14} />}
                              onClick={() => handleStatusChange(booking.id, 'completed')}
                            >
                              Отметить завершенным
                            </Menu.Item>
                          )}
                          {booking.status === 'confirmed' && (
                            <Menu.Item
                              leftSection={<UserX size={14} />}
                              onClick={() => handleStatusChange(booking.id, 'no_show')}
                            >
                              Неявка
                            </Menu.Item>
                          )}
                          <Menu.Divider />
                          <Menu.Item
                            leftSection={<Trash2 size={14} />}
                            color="red"
                            onClick={() => {
                              if (confirm('Удалить бронирование?')) {
                                bookingsApi.delete(booking.id).then(loadBookings)
                              }
                            }}
                          >
                            Удалить
                          </Menu.Item>
                        </Menu.Dropdown>
                      </Menu>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>

            {/* Pagination */}
            {meta.total_pages > 1 && (
              <Group justify="center" mt="md">
                <Pagination
                  total={meta.total_pages}
                  value={meta.page}
                  onChange={(page) => setFilters({ ...filters, page })}
                />
              </Group>
            )}
          </>
        )}
      </Card>

      {/* Cancel Modal */}
      <Modal
        opened={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        title="Отмена бронирования"
      >
        <Stack>
          <Text size="sm">Укажите причину отмены (опционально):</Text>
          <Textarea
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            placeholder="Причина отмены..."
          />
          <Group justify="flex-end">
            <Button variant="light" onClick={() => setCancelModalOpen(false)}>
              Отмена
            </Button>
            <Button color="red" onClick={confirmCancel}>
              Подтвердить отмену
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Reschedule Modal */}
      <Modal
        opened={rescheduleModalOpen}
        onClose={() => setRescheduleModalOpen(false)}
        title="Перенос бронирования"
      >
        <Stack>
          <Text size="sm">Выберите новое время:</Text>
          <input
            type="datetime-local"
            value={newSlot}
            onChange={(e) => setNewSlot(e.target.value)}
            style={{
              padding: '8px',
              borderRadius: '4px',
              border: '1px solid #ddd'
            }}
          />
          <Group justify="flex-end">
            <Button variant="light" onClick={() => setRescheduleModalOpen(false)}>
              Отмена
            </Button>
            <Button onClick={confirmReschedule}>
              Перенести
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  )
}


