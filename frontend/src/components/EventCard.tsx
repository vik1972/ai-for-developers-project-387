import { Card, Text, Group, Badge, ActionIcon } from '@mantine/core'
import { Trash, Clock } from 'lucide-react'
import type { Event } from '../types/api'
import { useEventsStore } from '../store/events'

interface EventCardProps {
  event: Event
}

export function EventCard({ event }: EventCardProps) {
  const { deleteEvent, loading } = useEventsStore()

  const handleDelete = async () => {
    if (window.confirm(`Вы уверены, что хотите удалить "${event.name}"?`)) {
      await deleteEvent(event.id)
    }
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
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Group justify="space-between" mb="md">
        <Text size="lg" fw={500}>
          {event.name}
        </Text>
        <Badge color="blue" variant="light">
          {formatDuration(event.duration)}
        </Badge>
      </Group>
      
      <Text size="sm" c="dimmed" mb="md">
        {event.description}
      </Text>
      
      <Group justify="space-between">
        <Text size="xs" c="dimmed">
          <Clock size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />
          Длительность: {formatDuration(event.duration)}
        </Text>
        
        <ActionIcon
          color="red"
          variant="subtle"
          onClick={handleDelete}
          loading={loading}
          size="sm"
        >
          <Trash size={16} />
        </ActionIcon>
      </Group>
    </Card>
  )
}