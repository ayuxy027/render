import React from "react"
import { useState, useCallback, useMemo, useEffect, useRef } from "react"
import { Link, useLocation } from "react-router-dom"
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion"
import { Scale, Menu, X, ChevronDown, User, Gavel, Briefcase } from "lucide-react"

interface NavItem {
  label: string
  id: string
  path: string
}

interface DashboardOption {
  label: string
  icon: React.ReactNode
  path: string
}

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState<boolean>(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false)
  const [isDashboardOpen, setIsDashboardOpen] = useState<boolean>(false)
  const { scrollY } = useScroll()
  const location = useLocation()
  const dashboardRef = useRef<HTMLDivElement>(null)

  const navItems: ReadonlyArray<NavItem> = useMemo(
    () => [
      { label: "Summarisation", id: "summarisation", path: "/summarisation" },
      { label: "Document Query", id: "doc-query", path: "/query" },
      { label: "Draft", id: "draft", path: "/draft" },
      {
        label: "Advocate Diary",
        id: "advocate-diary",
        path: "/advocate-diary",
      },
      {
        label: "Confi.Doc",
        id: "document-sharing",
        path: "/document-sharing",
      },
    ],
    [],
  )

  const dashboardOptions: ReadonlyArray<DashboardOption> = useMemo(
    () => [
      {
        label: "Judge Dashboard",
        icon: <Gavel className="mr-2 w-4 h-4" />,
        path: "/judge"
      },
      {
        label: "Client Dashboard",
        icon: <User className="mr-2 w-4 h-4" />,
        path: "/user"
      },
      {
        label: "Lawyer Dashboard",
        icon: <Briefcase className="mr-2 w-4 h-4" />,
        path: "/lawyer"
      },
    ],
    []
  )

  const handleScroll = useCallback(() => {
    setIsScrolled(scrollY.get() > 20)
  }, [scrollY])

  useMotionValueEvent(scrollY, "change", handleScroll)

  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen((prev) => !prev)
  }, [])

  const toggleDashboard = useCallback(() => {
    setIsDashboardOpen((prev) => !prev)
  }, [])

  // Close mobile menu when location changes
  useEffect(() => {
    if (isMobileMenuOpen) {
      setIsMobileMenuOpen(false)
    }
    if (isDashboardOpen) {
      setIsDashboardOpen(false)
    }
  }, [location.pathname])

  // Handle clicks outside of dashboard dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dashboardRef.current && !dashboardRef.current.contains(event.target as Node)) {
        setIsDashboardOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        className={`fixed top-0 left-0 right-0 w-full z-50 transition-all duration-300 ${isScrolled
          ? "py-2 shadow-md backdrop-blur-lg bg-white/90"
          : "py-3 bg-transparent"
          }`}
      >
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-[1px] bg-primary/30 origin-left"
          style={{ scaleX: scrollY }}
        />
        <div className="container px-6 mx-auto">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2 group">
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
                className="relative"
              >
                <Scale className="w-8 h-8 text-primary" />
                <motion.span
                  className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-primary"
                  initial={{ scale: 0.8 }}
                  animate={{ scale: [0.8, 1.2, 0.8] }}
                  transition={{
                    repeat: Infinity,
                    duration: 2,
                    repeatType: "loop"
                  }}
                />
              </motion.div>
              <motion.span
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-dark"
              >
                Legal-E
              </motion.span>
            </Link>

            <motion.div
              className="hidden items-center space-x-8 md:flex"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, staggerChildren: 0.1 }}
            >
              {navItems.map((item) => (
                <motion.div key={item.id} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    to={item.path}
                    className={`text-gray-700 hover:text-primary transition-colors relative ${location.pathname === item.path
                      ? "font-semibold text-primary"
                      : ""
                      }`}
                  >
                    {item.label}
                    {location.pathname === item.path && (
                      <motion.div
                        className="absolute h-[2px] bg-primary bottom-[-4px] left-0 right-0"
                        layoutId="activeNavIndicator"
                      />
                    )}
                  </Link>
                </motion.div>
              ))}

              {/* Dashboard Dropdown */}
              <motion.div
                ref={dashboardRef}
                className="relative"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <button
                  onClick={toggleDashboard}
                  className={`flex items-center text-gray-700 hover:text-primary transition-colors ${['/judge', '/user', '/lawyer'].includes(location.pathname) ? 'font-semibold text-primary' : ''
                    }`}
                >
                  Dashboard
                  <ChevronDown className={`ml-1 w-4 h-4 transition-transform ${isDashboardOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {isDashboardOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 z-50 mt-2 w-56 bg-white rounded-md ring-1 ring-black ring-opacity-5 shadow-lg"
                    >
                      <div className="py-1">
                        {dashboardOptions.map((option, index) => (
                          <Link
                            key={index}
                            to={option.path}
                            className={`flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-primary/10 hover:text-primary ${location.pathname === option.path ? 'bg-primary/5 text-primary' : ''
                              }`}
                            onClick={() => setIsDashboardOpen(false)}
                          >
                            {option.icon}
                            {option.label}
                          </Link>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {['/judge', '/user', '/lawyer'].includes(location.pathname) && (
                  <motion.div
                    className="absolute h-[2px] bg-primary bottom-[-4px] left-0 right-0"
                    layoutId="activeNavIndicator"
                  />
                )}
              </motion.div>
            </motion.div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 md:hidden"
              onClick={toggleMobileMenu}
              aria-label="Toggle mobile menu"
            >
              <AnimatePresence mode="wait" initial={false}>
                {isMobileMenuOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <X className="w-6 h-6 text-gray-700" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Menu className="w-6 h-6 text-gray-700" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>
      </motion.nav>

      {/* Spacer div to prevent content from being hidden behind fixed navbar */}
      <div className="h-[72px]" aria-hidden="true" />

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="fixed inset-x-0 top-[72px] z-40 bg-white/95 backdrop-blur-sm shadow-lg border-b border-gray-200"
          >
            <motion.div
              className="px-6 py-4 space-y-3"
              initial="closed"
              animate="open"
              exit="closed"
              variants={{
                open: { transition: { staggerChildren: 0.07, delayChildren: 0.2 } },
                closed: { transition: { staggerChildren: 0.05, staggerDirection: -1 } },
              }}
            >
              {navItems.map((item) => (
                <motion.div
                  key={item.id}
                  variants={{
                    open: { y: 0, opacity: 1 },
                    closed: { y: -20, opacity: 0 },
                  }}
                  transition={{ duration: 0.2 }}
                >
                  <Link
                    to={item.path}
                    className={`block py-2 text-gray-700 hover:text-primary transition-colors ${location.pathname === item.path ? "font-semibold text-primary" : ""
                      }`}
                    onClick={toggleMobileMenu}
                  >
                    {item.label}
                  </Link>
                  {location.pathname === item.path && (
                    <div className="h-[2px] w-16 bg-primary mt-1" />
                  )}
                </motion.div>
              ))}

              {/* Mobile Dashboard Menu */}
              <motion.div
                variants={{
                  open: { y: 0, opacity: 1 },
                  closed: { y: -20, opacity: 0 },
                }}
                transition={{ duration: 0.2 }}
                className="pt-2 border-t border-gray-200"
              >
                <div className="py-2 font-medium">Dashboards</div>
                {dashboardOptions.map((option, index) => (
                  <Link
                    key={index}
                    to={option.path}
                    className={`flex items-center py-2 pl-4 text-gray-700 hover:text-primary transition-colors ${location.pathname === option.path ? 'font-semibold text-primary' : ''
                      }`}
                    onClick={toggleMobileMenu}
                  >
                    {option.icon}
                    {option.label}
                  </Link>
                ))}
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default Navbar