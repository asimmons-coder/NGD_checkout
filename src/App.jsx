import React from 'react'
import NGDCheckout from './components/NGDCheckout'

// Simple Internal Header - Logo only
const Header = () => (
  <header className="bg-white border-b border-ngd-taupe/20">
    <div className="max-w-4xl mx-auto px-4 py-4">
      <div className="flex items-center gap-3">
        <img
          src="https://storage.googleapis.com/boon-public-assets/ngd.jpeg"
          alt="Novice Group Dermatology"
          className="h-12 w-auto"
        />
        <div>
          <div className="text-xl font-semibold text-ngd-dark tracking-wide">
            NOVICE<span className="font-light">GROUP</span>
          </div>
          <div className="text-[10px] tracking-[0.3em] text-ngd-gray uppercase">
            Dermatology
          </div>
        </div>
      </div>
    </div>
  </header>
)

function App() {
  return (
    <div className="min-h-screen flex flex-col bg-ngd-cream">
      <Header />
      <main className="flex-1">
        <NGDCheckout />
      </main>
    </div>
  )
}

export default App
