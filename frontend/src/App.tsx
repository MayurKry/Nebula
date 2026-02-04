import { HashRouter } from 'react-router-dom'
import AppRoutes from './routes/AppRoute'
import { GenerationProvider } from "@/components/generation/GenerationContext";
import { AuthProvider } from "@/context/AuthContext";
import AnalyticsTracker from "@/components/AnalyticsTracker";

function App() {

  return (
    <HashRouter>
      <AnalyticsTracker />
      <AuthProvider>
        <GenerationProvider>
          <AppRoutes />
        </GenerationProvider>
      </AuthProvider>
    </HashRouter>

  )
}

export default App
