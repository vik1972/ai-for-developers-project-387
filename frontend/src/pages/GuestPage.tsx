import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Card,
  Title,
  Text,
  Button,
  Loader,
  Alert,
  Group,
  Badge,
  Divider
} from '@mantine/core'
import {
  Calendar,
  User,
  ArrowRight
} from 'lucide-react'
import { useEventsStore } from '../store/events'
import type { Event } from '../types/api'

export function GuestPage() {
  const { events, loading, error, fetchEvents } = useEventsStore()

  useEffect(() => {
    fetchEvents()
  }, [fetchEvents])

  return (
    <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
      {/* Header */}
      <Card p="lg" mb="xl" withBorder style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
        <Group justify="space-between">
          <div>
            <Title order={1} style={{ color: 'white' }}>Система бронирования встреч</Title>
            <Text size="lg" style={{ color: 'rgba(255,255,255,0.9)' }} mt="md">
              Выберите тип события и забронируйте удобное время для встречи
            </Text>
          </div>
          <Group>
            <User size={24} />
            <div style={{ textAlign: 'right' }}>
              <Text size="sm" style={{ color: 'rgba(255,255,255,0.8)' }}>Гость</Text>
              <Text size="xs" style={{ color: 'rgba(255,255,255,0.6)' }}>Без регистрации</Text>
            </div>
          </Group>
        </Group>
      </Card>

      {/* Instructions */}
      <Card p="lg" mb="xl" withBorder>
        <Title order={3} mb="md">Как забронировать встречу</Title>
        <Group gap="lg">
          <div style={{ textAlign: 'center', flex: 1 }}>
            <div style={{ 
              width: '60px', 
              height: '60px', 
              borderRadius: '50%', 
              background: '#e3f2fd', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              margin: '0 auto 1rem'
            }}>
              <span style={{ fontSize: '24px', fontWeight: 'bold' }}>1</span>
            </div>
            <Text size="sm" fw={500}>Выберите событие</Text>
            <Text size="xs" c="dimmed" mt={4}>Изучите доступные типы встреч</Text>
          </div>
          <div style={{ textAlign: 'center', flex: 1 }}>
            <div style={{ 
              width: '60px', 
              height: '60px', 
              borderRadius: '50%', 
              background: '#f3e5f5', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              margin: '0 auto 1rem'
            }}>
              <span style={{ fontSize: '24px', fontWeight: 'bold' }}>2</span>
            </div>
            <Text size="sm" fw={500}>Выберите время</Text>
            <Text size="xs" c="dimmed" mt={4}>Найдите свободный слот в календаре</Text>
          </div>
          <div style={{ textAlign: 'center', flex: 1 }}>
            <div style={{ 
              width: '60px', 
              height: '60px', 
              borderRadius: '50%', 
              background: '#e8f5e8', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              margin: '0 auto 1rem'
            }}>
              <span style={{ fontSize: '24px', fontWeight: 'bold' }}>3</span>
            </div>
            <Text size="sm" fw={500}>Забронируйте</Text>
            <Text size="xs" c="dimmed" mt={4}>Подтвердите встречу без регистрации</Text>
          </div>
        </Group>
      </Card>

      {/* Events List */}
      <div>
        <Group justify="space-between" mb="xl">
          <div>
            <Title order={2}>Доступные события для бронирования</Title>
            <Text c="dimmed" size="sm">
              Выберите тип события для продолжения
            </Text>
          </div>
          <Badge color="green" variant="light">
            {events.length} доступно
          </Badge>
        </Group>

        {loading && <Loader mb="md" />}

        {error && (
          <Alert color="red" mb="md">
            {error}
          </Alert>
        )}

        {events.length === 0 ? (
          <Card p="lg" withBorder>
            <Text c="dimmed" align="center" size="lg">
              В настоящее время нет доступных событий для бронирования.
              Пожалуйста, вернитесь позже.
            </Text>
          </Card>
        ) : (
          <div style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))' }}>
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <Card p="md" mt="xl" withBorder style={{ textAlign: 'center', background: '#f8f9fa' }}>
        <Text size="sm" c="dimmed">
          Система бронирования встреч • Без регистрации • 24/7 доступ
        </Text>
      </Card>
    </div>
  )
}

function EventCard({ event }: { event: Event }) {
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}ч ${mins}м`
    }
    return `${mins}м`
  }

  return (
    <Card p="lg" h="100%" withBorder component={Link} to={`/booking/${event.id}`} style={{ textDecoration: 'none' }}>
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Group justify="space-between" mb="md">
          <Title order={4} size="lg" style={{ flex: 1 }}>{event.name}</Title>
          <Badge color="blue" variant="light">
            {formatDuration(event.duration)}
          </Badge>
        </Group>
        
        <Text size="sm" c="dimmed" mb="md" style={{ flex: 1 }}>
          {event.description}
        </Text>
        
        <Divider mb="md" />
        
        <Group justify="space-between" align="center">
          <Text size="xs" c="dimmed">
            <Calendar size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />
            Доступно для бронирования
          </Text>
          <Button 
            size="sm" 
            rightSection={<ArrowRight size={14} />}
            style={{ flex: 1 }}
          >
            Забронировать
          </Button>
        </Group>
      </div>
    </Card>
  )
}