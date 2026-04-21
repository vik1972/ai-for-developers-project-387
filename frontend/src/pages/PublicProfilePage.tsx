import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  Card,
  Title,
  Text,
  Loader,
  Alert,
  Group,
  Avatar,
  Stack,
  Container,
  Button
} from '@mantine/core'
import {
  Clock,
  User,
  ArrowRight,
  Globe
} from 'lucide-react'
import type { Event } from '../types/api'

interface OwnerProfile {
  slug: string
  name: string
  email: string
  bio: string | null
  avatar_url: string | null
  timezone: string
  is_public: boolean
}

export function PublicProfilePage() {
  const { slug } = useParams<{ slug: string }>()
  const [profile, setProfile] = useState<OwnerProfile | null>(null)
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (slug) {
      fetchProfile(slug)
      fetchEvents(slug)
    }
  }, [slug])

  const fetchProfile = async (ownerSlug: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/public/${ownerSlug}`)
      if (!response.ok) {
        throw new Error('Profile not found')
      }
      const data = await response.json()
      setProfile(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  const fetchEvents = async (ownerSlug: string) => {
    try {
      const response = await fetch(`/api/public/${ownerSlug}/events`)
      if (!response.ok) {
        throw new Error('Failed to load events')
      }
      const data = await response.json()
      setEvents(data)
    } catch (err) {
      console.error('Failed to fetch events:', err)
    }
  }

  if (loading) {
    return (
      <Container size="md" py="xl">
        <Loader size="lg" />
      </Container>
    )
  }

  if (error || !profile) {
    return (
      <Container size="md" py="xl">
        <Alert color="red" icon={<User size={16} />}>
          {error || 'Profile not found'}
        </Alert>
      </Container>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', padding: '2rem 0' }}>
      <Container size="md">
        {/* Profile Header */}
        <Card p="xl" mb="xl" withBorder radius="lg" shadow="sm">
          <Stack align="center" gap="md">
            <Avatar
              src={profile.avatar_url}
              alt={profile.name}
              size={80}
              radius="50%"
              style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
            >
              <User size={40} />
            </Avatar>
            
            <Title order={1} ta="center">{profile.name}</Title>
            
            {profile.bio && (
              <Text c="dimmed" ta="center" maw={400}>
                {profile.bio}
              </Text>
            )}
            
            <Group gap="xs" c="dimmed">
              <Globe size={16} />
              <Text size="sm">{profile.timezone}</Text>
            </Group>
          </Stack>
        </Card>

        {/* Events Section */}
        <Card p="xl" withBorder radius="lg" shadow="sm">
          <Title order={2} mb="lg">Доступные типы встреч</Title>
          
          {events.length === 0 ? (
            <Text c="dimmed" ta="center" py="xl">
              В настоящее время нет доступных событий для бронирования.
            </Text>
          ) : (
            <div style={{ display: 'grid', gap: '1rem' }}>
              {events.map((event) => (
                <EventCard key={event.id} event={event} ownerSlug={slug!} />
              ))}
            </div>
          )}
        </Card>

        {/* Footer */}
        <Text c="dimmed" ta="center" mt="xl" size="sm">
          Система бронирования встреч • Бронируйте удобное время
        </Text>
      </Container>
    </div>
  )
}

function EventCard({ event, ownerSlug }: { event: Event; ownerSlug: string }) {
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}ч ${mins}м`
    }
    return `${mins}м`
  }

  const getEventIcon = (duration: number) => {
    if (duration <= 30) return '⚡'
    if (duration <= 60) return '💼'
    return '☕'
  }

  return (
    <Card p="lg" withBorder radius="md" style={{ transition: 'transform 0.2s, box-shadow 0.2s' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
        <div
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '12px',
            background: '#f3f4f6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
            flexShrink: 0
          }}
        >
          {getEventIcon(event.duration)}
        </div>
        
        <div style={{ flex: 1, minWidth: 0 }}>
          <Title order={4} size="lg" style={{ marginBottom: '0.25rem' }}>{event.name}</Title>
          <Text size="sm" c="dimmed" style={{ wordWrap: 'break-word', marginBottom: '0.5rem' }}>
            {event.description}
          </Text>
          
          <Group gap="xs" mb="md">
            <Clock size={14} />
            <Text size="sm" c="dimmed">{formatDuration(event.duration)}</Text>
          </Group>
          
          <Button
            component={Link}
            to={`/book/${ownerSlug}/${event.id}`}
            rightSection={<ArrowRight size={16} />}
            size="sm"
          >
            Выбрать время
          </Button>
        </div>
      </div>
    </Card>
  )
}
