import { Routes, Route, Link } from 'react-router-dom'
import { Home, History, About } from './pages'
import { Header, Footer } from './components/layout'
import { NewsProvider } from './contexts/NewsContext'

function App() {
  return (
    <NewsProvider>
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        
        <main className="flex-1 container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/history" element={<History />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </main>
        
        <Footer />
      </div>
    </NewsProvider>
  )
}

export default App