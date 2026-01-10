import React, { useState } from 'react'
import NGDCheckout from './components/NGDCheckout'

// NGD Logo Component
const NGDLogo = ({ className = "h-12" }) => (
  <img
    src="https://storage.googleapis.com/boon-public-assets/ngd.jpeg"
    alt="Novice Group Dermatology"
    className={className}
  />
)

// Header Component matching NGD branding
const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="bg-white">
      {/* Top bar with contact info */}
      <div className="bg-ngd-cream border-b border-ngd-taupe/20">
        <div className="max-w-7xl mx-auto px-4 py-2 flex justify-between items-center text-sm">
          <div className="hidden md:flex items-center gap-6 text-ngd-gray">
            <a href="tel:248-932-3376" className="hover:text-ngd-dark flex items-center gap-1">
              <span className="font-medium">P:</span> 248.932.3376
            </a>
            <a href="tel:248-932-1046" className="hover:text-ngd-dark flex items-center gap-1">
              <span className="font-medium">F:</span> 248.932.1046
            </a>
            <span className="text-ngd-gray">4120 W MAPLE RD, SUITE 206</span>
          </div>
          <a
            href="#schedule"
            className="ml-auto px-4 py-1.5 border border-ngd-dark text-ngd-dark text-xs font-medium tracking-wider uppercase hover:bg-ngd-dark hover:text-white transition-colors"
          >
            Schedule a Visit
          </a>
        </div>
      </div>

      {/* Main navigation */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <NGDLogo className="h-14 w-auto" />
            <div className="hidden sm:block">
              <div className="text-xl font-display font-semibold text-ngd-dark tracking-wide">
                NOVICE<span className="font-light">GROUP</span>
              </div>
              <div className="text-[10px] tracking-[0.3em] text-ngd-gray uppercase">
                Dermatology
              </div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            <a href="#story" className="text-sm font-medium text-ngd-gray hover:text-ngd-dark tracking-wide uppercase">
              Our Story
            </a>
            <a href="#services" className="text-sm font-medium text-ngd-gray hover:text-ngd-dark tracking-wide uppercase">
              Our Services
            </a>
            <a href="#visit" className="text-sm font-medium text-ngd-gray hover:text-ngd-dark tracking-wide uppercase">
              Visit Us
            </a>
            <a
              href="#shop"
              className="px-5 py-2 bg-ngd-taupe text-white text-sm font-medium tracking-wide uppercase hover:bg-ngd-brown transition-colors rounded"
            >
              Skin Shop
            </a>
          </nav>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-ngd-gray hover:text-ngd-dark"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="lg:hidden pb-4 border-t border-ngd-cream">
            <div className="flex flex-col gap-2 pt-4">
              <a href="#story" className="py-2 text-sm font-medium text-ngd-gray hover:text-ngd-dark tracking-wide uppercase">
                Our Story
              </a>
              <a href="#services" className="py-2 text-sm font-medium text-ngd-gray hover:text-ngd-dark tracking-wide uppercase">
                Our Services
              </a>
              <a href="#visit" className="py-2 text-sm font-medium text-ngd-gray hover:text-ngd-dark tracking-wide uppercase">
                Visit Us
              </a>
              <a
                href="#shop"
                className="mt-2 px-5 py-2 bg-ngd-taupe text-white text-sm font-medium tracking-wide uppercase hover:bg-ngd-brown transition-colors rounded text-center"
              >
                Skin Shop
              </a>
              <div className="mt-4 pt-4 border-t border-ngd-cream text-sm text-ngd-gray">
                <p className="mb-1"><span className="font-medium">P:</span> 248.932.3376</p>
                <p className="mb-1"><span className="font-medium">F:</span> 248.932.1046</p>
                <p>4120 W Maple Rd, Suite 206</p>
              </div>
            </div>
          </nav>
        )}
      </div>
    </header>
  )
}

// Footer Component
const Footer = () => (
  <footer className="bg-ngd-dark text-white mt-auto">
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid md:grid-cols-3 gap-8">
        {/* Logo & tagline */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <NGDLogo className="h-10 w-auto rounded" />
            <div>
              <div className="text-lg font-display font-semibold tracking-wide">
                NOVICE<span className="font-light">GROUP</span>
              </div>
              <div className="text-[10px] tracking-[0.25em] text-ngd-taupe uppercase">
                Dermatology
              </div>
            </div>
          </div>
          <p className="text-sm text-stone-400 italic">
            Love Your Skin<br />From Generation to Generation
          </p>
        </div>

        {/* Contact */}
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wider mb-4 text-ngd-taupe">Contact</h4>
          <div className="text-sm text-stone-300 space-y-2">
            <p>4120 W Maple Rd, Suite 206</p>
            <p>Bloomfield Hills, MI 48301</p>
            <p className="pt-2">
              <a href="tel:248-932-3376" className="hover:text-white">P: 248.932.3376</a>
            </p>
            <p>
              <a href="tel:248-932-1046" className="hover:text-white">F: 248.932.1046</a>
            </p>
          </div>
        </div>

        {/* Hours */}
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wider mb-4 text-ngd-taupe">Office Hours</h4>
          <div className="text-sm text-stone-300 space-y-1">
            <p>Monday - Thursday: 8am - 5pm</p>
            <p>Friday: 8am - 3pm</p>
            <p>Saturday - Sunday: Closed</p>
          </div>
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-stone-700 text-center text-xs text-stone-500">
        <p>&copy; {new Date().getFullYear()} Novice Group Dermatology. All rights reserved.</p>
      </div>
    </div>
  </footer>
)

function App() {
  return (
    <div className="min-h-screen flex flex-col bg-ngd-cream">
      <Header />

      {/* Page Title Banner */}
      <div className="bg-gradient-to-r from-ngd-light to-ngd-cream border-b border-ngd-taupe/20">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-2xl md:text-3xl font-display font-light text-ngd-dark tracking-wide">
            Patient <span className="font-semibold">Checkout</span>
          </h1>
          <p className="text-sm text-ngd-gray mt-1">
            Complete your visit with Novice Group Dermatology
          </p>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1">
        <NGDCheckout />
      </main>

      <Footer />
    </div>
  )
}

export default App
