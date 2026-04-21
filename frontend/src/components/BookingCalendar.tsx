import { useState, useEffect } from 'react'
import { Card, Text, Group, Loader, Alert, Badge } from '@mantine/core'
import { Calendar } from '@mantine/dates'
import { CalendarDays } from 'lucide-react'
import dayjs from 'dayjs'
import 'dayjs/locale/ru'

interface BookingCalendarProps {
  eventId: number
  onDateSelect: (date: Date) => void
  selectedDate?: Date | null
}

interface AvailableDate {
  date: string
  hasSlots: boolean
}

export function BookingCalendar({ eventId, onDateSelect, selectedDate }: BookingCalendarProps) {
  const [month, setMonth] = useState<Date>(new Date())
  const [availableDates, setAvailableDates] = useState<AvailableDate[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch available dates for the month
  useEffect(() => {
    const fetchDates = async () => {
      try {
        setLoading(true)
        // Fetch for each day of the month (simplified approach)
        const startOfMonth = dayjs(month).startOf('month')
        const endOfMonth = dayjs(month).endOf('month')
        const daysInMonth = endOfMonth.diff(startOfMonth, 'day') + 1

        const dateMap = new Map<string, boolean>()

        // Sample 3 days: beginning, middle, and end of month for performance
        // In production, this could be optimized with a bulk endpoint
        const sampleDates = [
          startOfMonth,
          startOfMonth.add(Math.floor(daysInMonth / 2), 'day'),
          endOfMonth.subtract(1, 'day')
        ]

        for (const sampleDate of sampleDates) {
          const dateStr = sampleDate.format('YYYY-MM-DD')
          try {
            const response = await fetch(
              `/api/available_slots?event_id=${eventId}&date=${dateStr}`
            )
            if (response.ok) {
              const data = await response.json()
              if (data.available_slots && data.available_slots.length > 0) {
                // Mark this date and nearby dates as having slots
                // This is a simplified heuristic
                for (let i = -2; i <= 2; i++) {
                  const nearbyDate = sampleDate.add(i, 'day')
                  dateMap.set(nearbyDate.format('YYYY-MM-DD'), true)
                }
              }
            }
          } catch {
            // Skip failed requests
          }
        }

        // Convert to array
        const dates: AvailableDate[] = Array.from(dateMap.entries()).map(([date, hasSlots]) => ({
          date,
          hasSlots
        }))

        setAvailableDates(dates)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load calendar')
      } finally {
        setLoading(false)
      }
    }

    fetchDates()
  }, [month, eventId])

  const availableSet = new Set(availableDates.map(d => d.date))

  const handleMonthChange = (newMonth: Date) => {
    setMonth(newMonth)
  }

  const renderDay = (date: Date) => {
    const dateKey = dayjs(date).format('YYYY-MM-DD')
    const hasSlots = availableSet.has(dateKey)
    const isSelected = selectedDate && dayjs(date).isSame(selectedDate, 'day')
    const isToday = dayjs(date).isSame(new Date(), 'day')
    const isPast = dayjs(date).isBefore(new Date(), 'day')

    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          cursor: isPast || !hasSlots ? 'not-allowed' : 'pointer',
          opacity: isPast ? 0.3 : 1,
          backgroundColor: isSelected ? '#2b8a3e' : isToday ? '#e3f2fd' : 'transparent',
          color: isSelected ? 'white' : isToday ? '#1976d2' : 'inherit',
          borderRadius: '8px',
          transition: 'all 0.2s'
        }}
      >
        <span style={{ fontSize: '14px', fontWeight: isToday ? 600 : 400 }}>
          {date.getDate()}
        </span>
        {hasSlots && !isPast && (
          <span
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: isSelected ? 'white' : '#22c55e',
              marginTop: '2px'
            }}
          />
        )}
      </div>
    )
  }

  const handleDateSelect = (date: Date) => {
    const dateKey = dayjs(date).format('YYYY-MM-DD')
    const isPast = dayjs(date).isBefore(new Date(), 'day')

    if (!isPast && availableSet.has(dateKey)) {
      onDateSelect(date)
    }
  }

  return (
    <Card p="lg" withBorder>
      <Group mb="lg" align="center">
        <CalendarDays size={20} />
        <Text size="lg" fw={500}>Выберите дату</Text>
        {loading && <Loader size="sm" />}
      </Group>

      {error && (
        <Alert color="red" mb="md">
          {error}
        </Alert>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Calendar
          locale="ru"
          firstDayOfWeek={1}
          value={selectedDate}
          onChange={handleDateSelect}
          onNextMonth={handleMonthChange}
          onPreviousMonth={handleMonthChange}
          renderDay={renderDay}
          styles={{
            calendar: {
              width: '100%'
            },
            day: {
              '&[data-selected]': {
                backgroundColor: '#2b8a3e !important',
                color: 'white'
              }
            }
          }}
        />
      </div>

      <Group mt="md" gap="xs">
        <Badge color="green" variant="dot">Есть свободные слоты</Badge>
        <Badge color="gray" variant="dot">Нет слотов</Badge>
        {selectedDate && (
          <Badge color="blue">
            Выбрано: {dayjs(selectedDate).format('D MMMM YYYY')}
          </Badge>
        )}
      </Group>
    </Card>
  )
}
