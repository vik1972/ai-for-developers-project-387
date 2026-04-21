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
  Grid
} from '@mantine/core'
import {
  Calendar,
  Clock,
  Trash2,
  Plus,
  CalendarDays,
  Settings,
  List
} from 'lucide-react'
import { eventsApi } from '../api/events'
import { bookingsApi } from '../api/bookings'
import { useEventsStore } from '../store/events'
import { useBookingsStore } from '../store/bookings'
import type { Booking } from '../types/api'

export function DashboardPage() {
  const { events, loading: eventsLoading, fetchEvents } = useEventsStore()
  const { bookings, loading: bookingsLoading, fetchBookings } = useBookingsStore()
  const [upcomingBookings, setUpcomingBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchEvents()
    fetchBookings()
  }, [fetchEvents, fetchBookings])

  useEffect(() => {
    if (bookings.length > 0) {
      const now = new Date()
      const upcoming = bookings
        .filter(booking => new Date(booking.slot) > now)
        .sort((a, b) => new Date(a.slot).getTime() - new Date(b.slot).getTime())
      setUpcomingBookings(upcoming)
    }
  }, [bookings])

  const handleDeleteEvent = async (eventId: number) => {
    if (!confirm('Вы уверены, что хотите удалить это событие? Все связанные бронирования также будут удалены.')) {
      return
    }
    
    setLoading(true)
    try {
      await eventsApi.delete(eventId)
      fetchEvents()
      fetchBookings()
    } catch (error) {
      console.error('Failed to delete event:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteBooking = async (bookingId: number) => {
    if (!confirm('Вы уверены, что хотите удалить это бронирование?')) {
      return
    }
    
    setLoading(true)
    try {
      await bookingsApi.delete(bookingId)
      fetchBookings()
    } catch (error) {
      console.error('Failed to delete booking:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDateTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString)
    return date.toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}ч ${mins}м`
    }
    return `${mins}м`
  }

  const totalEvents = events.length
  const totalBookings = bookings.length
  const upcomingCount = upcomingBookings.length

  if (eventsLoading || bookingsLoading) {
    return (
      <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <Loader />
      </div>
    )
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <Group justify="space-between" mb="xl">
        <div>
          <Title order={2}>Дашборд владельца</Title>
          <Text c="dimmed" size="sm">
            Управление событиями и бронированиями
          </Text>
        </div>
        <Group>
          <Button
            component={Link}
            to="/dashboard/bookings"
            leftSection={<List size={16} />}
            variant="light"
          >
            Бронирования
          </Button>
          <Button
            component={Link}
            to="/dashboard/availability"
            leftSection={<Settings size={16} />}
            variant="light"
          >
            Доступность
          </Button>
          <Button
            component={Link}
            to="/events"
            leftSection={<Plus size={16} />}
          >
            Создать событие
          </Button>
        </Group>
      </Group>

      {/* Statistics Cards */}
      <Grid mb="xl">
        <Grid.Col span={4}>
          <Card p="md" withBorder>
            <Group>
              <CalendarDays size={24} color="blue" />
              <div>
                <Text size="lg" fw={600}>{totalEvents}</Text>
                <Text size="sm" c="dimmed">Типов событий</Text>
              </div>
            </Group>
          </Card>
        </Grid.Col>
        <Grid.Col span={4}>
          <Card p="md" withBorder>
            <Group>
              <Calendar size={24} color="green" />
              <div>
                <Text size="lg" fw={600}>{totalBookings}</Text>
                <Text size="sm" c="dimmed">Всего бронирований</Text>
              </div>
            </Group>
          </Card>
        </Grid.Col>
        <Grid.Col span={4}>
          <Card p="md" withBorder>
            <Group>
              <Clock size={24} color="orange" />
              <div>
                <Text size="lg" fw={600}>{upcomingCount}</Text>
                <Text size="sm" c="dimmed">Предстоящих встреч</Text>
              </div>
            </Group>
          </Card>
        </Grid.Col>
      </Grid>

      {/* Events Section */}
      <Card p="lg" mb="xl" withBorder>
        <Group justify="space-between" mb="md">
          <Title order={3} size="lg">Типы событий</Title>
          <Text size="sm" c="dimmed">{totalEvents} событий</Text>
        </Group>
        
        {events.length === 0 ? (
          <Text c="dimmed" align="center" py="lg">
            Типы событий еще не созданы
          </Text>
        ) : (
          <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
            {events.map((event) => (
              <Card key={event.id} p="md" withBorder>
                <Group justify="space-between" mb="md">
                  <Title order={4} size="sm">{event.name}</Title>
                  <ActionIcon
                    color="red"
                    variant="subtle"
                    size="sm"
                    onClick={() => handleDeleteEvent(event.id)}
                    loading={loading}
                  >
                    <Trash2 size={14} />
                  </ActionIcon>
                </Group>
                <Text size="sm" c="dimmed" mb="md">{event.description}</Text>
                <Group>
                  <Badge color="blue" variant="light">
                    {formatDuration(event.duration)}
                  </Badge>
                </Group>
              </Card>
            ))}
          </div>
        )}
      </Card>

      {/* Upcoming Bookings Section */}
      <Card p="lg" withBorder>
        <Group justify="space-between" mb="md">
          <Title order={3} size="lg">Предстоящие встречи</Title>
          <Text size="sm" c="dimmed">{upcomingCount} предстоящих</Text>
        </Group>
        
        {upcomingBookings.length === 0 ? (
          <Text c="dimmed" align="center" py="lg">
            Нет предстоящих встреч
          </Text>
        ) : (
          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Событие</Table.Th>
                <Table.Th>Дата и время</Table.Th>
                <Table.Th>Длительность</Table.Th>
                <Table.Th>Действия</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {upcomingBookings.map((booking) => (
                <Table.Tr key={booking.id}>
                  <Table.Td>
                    <Text size="sm">{booking.event?.name || 'Неизвестное событие'}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm">{formatDateTime(booking.slot)}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm" c="dimmed">
                      {booking.event ? formatDuration(booking.event.duration) : '-'}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <ActionIcon
                      color="red"
                      variant="subtle"
                      size="sm"
                      onClick={() => handleDeleteBooking(booking.id)}
                      loading={loading}
                    >
                      <Trash2 size={14} />
                    </ActionIcon>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        )}
      </Card>
    </div>
  )
}