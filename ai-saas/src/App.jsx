import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import DashboardHome from './pages/DashboardHome'
import TextGenerator from './pages/TextGenerator'
import ImageGenerator from './pages/ImageGenerator'
import Summarizer from './pages/Summarizer'
import Translator from './pages/Translator'
import History from './pages/History'
import Billing from './pages/Billing'
import AdminDashboard from './pages/AdminDashboard'
import DashboardLayout from './layouts/DashboardLayout'
import { UsageProvider } from './context/UsageContext'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/app" element={
          <UsageProvider>
            <DashboardLayout />
          </UsageProvider>
        }>
          <Route index element={<DashboardHome />} />
          <Route path="text-generator" element={<TextGenerator />} />
          <Route path="image-generator" element={<ImageGenerator />} />
          <Route path="summarizer" element={<Summarizer />} />
          <Route path="translator" element={<Translator />} />
          <Route path="history" element={<History />} />
          <Route path="billing" element={<Billing />} />
          <Route path="admin" element={<AdminDashboard />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
