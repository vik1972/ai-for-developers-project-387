import { QueryClient, QueryClientProvider } from 'react-query'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { EventTypesPage } from './pages/EventTypesPage'
import { BookingPage } from './pages/BookingPage'
import { DashboardPage } from './pages/DashboardPage'
import { GuestPage } from './pages/GuestPage'
import { PublicProfilePage } from './pages/PublicProfilePage'
import { BookingWizard } from './components/BookingWizard'
import { AvailabilityPage } from './pages/AvailabilityPage'
import { BookingsDashboardPage } from './pages/BookingsDashboardPage'

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
          <Routes>
            <Route path="/" element={<GuestPage />} />
            <Route path="/events" element={<EventTypesPage />} />
            <Route path="/booking/:eventId" element={<BookingPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/dashboard/availability" element={<AvailabilityPage />} />
            <Route path="/dashboard/bookings" element={<BookingsDashboardPage />} />
            <Route path="/:slug" element={<PublicProfilePage />} />
            <Route path="/book/:ownerSlug/:eventId" element={<BookingWizard />} />
          </Routes>
        </div>
      </Router>
    </QueryClientProvider>
  )
}

export default App