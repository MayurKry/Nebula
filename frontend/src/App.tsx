import { HashRouter } from 'react-router-dom'
import AppRoutes from './routes/AppRoute'
import { GenerationProvider } from "@/components/generation/GenerationContext";

function App() {

  return (
    <HashRouter>
      <GenerationProvider>
        <AppRoutes />
      </GenerationProvider>
    </HashRouter>

  )
}

export default App
