import { useEffect, useState } from 'react'
import { Button, Group, Card, Title, Text, Loader, Alert } from '@mantine/core'
import { Plus, Home } from 'lucide-react'
import { EventCard } from '../components/EventCard'
import { CreateEventForm } from '../components/CreateEventForm'
import { useEventsStore } from '../store/events'
import { useBookingsStore } from '../store/bookings'

export function EventTypesPage() {
  const { events, loading, error, fetchEvents } = useEventsStore()
  const { fetchBookings } = useBookingsStore()
  const [createModalOpened, setCreateModalOpened] = useState(false)

  useEffect(() => {
    fetchEvents()
    fetchBookings()
  }, [fetchEvents, fetchBookings])

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <Group justify="space-between" mb="xl">
        <div>
          <Title order={2}>Типы событий</Title>
          <Text c="dimmed" size="sm">
            Управляйте типами событий для бронирования
          </Text>
        </div>
        <Group>
          <Button
            component="a"
            href="/"
            variant="subtle"
            leftSection={<Home size={16} />}
          >
            На главную
          </Button>
          <Button
            onClick={() => setCreateModalOpened(true)}
            leftSection={<Plus size={16} />}
          >
            Создать тип события
          </Button>
        </Group>
      </Group>

      {loading && <Loader mb="md" />}

      {error && (
        <Alert color="red" mb="md">
          {error}
        </Alert>
      )}

      {events.length === 0 ? (
        <Card p="lg" withBorder>
          <Text c="dimmed" align="center">
            Типы событий еще не созданы. Создайте первый тип события для начала работы.
          </Text>
        </Card>
      ) : (
        <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))' }}>
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}

      <CreateEventForm
        opened={createModalOpened}
        onClose={() => setCreateModalOpened(false)}
      />
    </div>
  )
}