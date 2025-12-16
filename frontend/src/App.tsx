import { HashRouter } from 'react-router-dom'
import AppRoutes from './routes/AppRoute'
import { GenerationProvider } from "@/context/GenerationContext";
import { AuthProvider } from "@/context/AuthContext";

function App() {

  return (
    <HashRouter>
      <AuthProvider>
        <GenerationProvider>
          <AppRoutes />
        </GenerationProvider>
      </AuthProvider>
    </HashRouter>

  )
}

export default App
