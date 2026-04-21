import { Card, Text, Group, Badge } from '@mantine/core'
import { Calendar, Clock } from 'lucide-react'

interface TimeSlotGridProps {
  availableSlots: string[]
  occupiedSlots?: string[]
  selectedSlot?: string | null
  onSlotSelect: (slot: string) => void
  loading?: boolean
}

export function TimeSlotGrid({ availableSlots, occupiedSlots = [], selectedSlot, onSlotSelect, loading }: TimeSlotGridProps) {
  const groupSlotsByHour = (slots: string[]) => {
    const grouped: Record<string, string[]> = {}
    
    slots.forEach(slot => {
      const date = new Date(slot)
      const hourKey = date.toLocaleDateString('ru-RU', { 
        weekday: 'short', 
        day: 'numeric', 
        month: 'short' 
      })
      
      if (!grouped[hourKey]) {
        grouped[hourKey] = []
      }
      
      grouped[hourKey].push(slot)
    })
    
    return grouped
  }

  const normalizeSlot = (slot: string) => {
    // Преобразуем "2026-04-06 00:00" в "2026-04-06T00:00:00" для надежного сравнения
    return slot.replace(' ', 'T')
  }

  const allSlots = Array.from(new Set([...availableSlots, ...occupiedSlots].map(normalizeSlot)))
    .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
  const groupedSlots = groupSlotsByHour(allSlots)
  const availableSet = new Set(availableSlots.map(normalizeSlot))
  const occupiedSet = new Set(occupiedSlots.map(normalizeSlot))

  return (
    <Card p="lg" withBorder>
      <Group mb="lg" align="center">
        <Calendar size={20} />
        <Text size="lg" fw={500}>Доступные слоты</Text>
        <Badge color="green" variant="light">
          {availableSlots.length} доступно
        </Badge>
      </Group>

      {loading ? (
        <Text c="dimmed" ta="center">Загрузка...</Text>
      ) : allSlots.length === 0 ? (
        <Text c="dimmed" ta="center">
          На выбранную дату нет доступных слотов
        </Text>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Text size="sm" c="blue">
            Доступно: {availableSlots.length}, Занято: {occupiedSlots.length}
          </Text>
          {Object.entries(groupedSlots).map(([date, slotList]) => (
            <div key={date}>
              <Text size="sm" c="dimmed" mb="md">{date}</Text>
              <div style={{ display: 'grid', gap: '0.5rem', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))' }}>
                {slotList.map((slot) => {
                  const time = new Date(slot).toLocaleTimeString('ru-RU', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })
                  const isOccupied = occupiedSet.has(slot)
                  const isAvailable = availableSet.has(slot) && !isOccupied
                  const isSelected = selectedSlot && normalizeSlot(selectedSlot) === slot
                  
                  return (
                    <button
                      key={slot}
                      onClick={() => isAvailable && onSlotSelect(slot)}
                      disabled={isOccupied || !isAvailable}
                      style={{
                        padding: '8px 16px',
                        borderRadius: '4px',
                        border: isSelected ? 'none' : isOccupied ? '1px solid #ff6b6b' : '1px solid #51cf66',
                        backgroundColor: isSelected ? '#2b8a3e' : isOccupied ? '#ffe3e3' : '#d3f9d8',
                        color: isSelected ? 'white' : isOccupied ? '#c92a2a' : '#2b8a3e',
                        cursor: isOccupied ? 'not-allowed' : 'pointer',
                        opacity: isOccupied ? 0.7 : 1,
                        fontSize: '14px',
                        fontWeight: 500,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        width: '100%',
                      }}
                    >
                      <Clock size={14} />
                      {time}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}
