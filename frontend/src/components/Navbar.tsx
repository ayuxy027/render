import React from "react"
import { useState, useCallback, useMemo } from "react"
import { Link, useLocation } from "react-router-dom"
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion"
import { Scale, Menu, X, LogIn, UserPlus } from "lucide-react"

interface NavItem {
  label: string
  id: string
  path: string
}

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState<boolean>(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false)
  const { scrollY } = useScroll()
  const location = useLocation()

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

  const handleScroll = useCallback(() => {
    setIsScrolled(scrollY.get() > 20)
  }, [scrollY])

  useMotionValueEvent(scrollY, "change", handleScroll)

  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen((prev) => !prev)
  }, [])

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? "shadow-lg backdrop-blur-lg bg-white/80" : "bg-transparent"
          }`}
      >
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary origin-left"
          style={{ scaleX: scrollY }}
        />
        <div className="container px-4 mx-auto">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2 group">
              <motion.div whileHover={{ rotate: 360 }} transition={{ duration: 0.5 }}>
                <Scale className="w-8 h-8 text-primary" />
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
                    className={`text-gray-700 hover:text-primary transition-colors ${location.pathname === item.path ? "font-semibold text-primary" : ""
                      }`}
                  >
                    {item.label}
                  </Link>
                </motion.div>
              ))}
            </motion.div>

            <motion.div
              className="hidden items-center space-x-4 md:flex"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 text-sm font-medium text-white rounded-md transition-colors bg-primary hover:bg-primary-dark"
              >
                <LogIn className="inline-block mr-2 w-4 h-4" />
                Login
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 text-sm font-medium bg-white rounded-md border transition-colors text-primary border-primary hover:bg-primary hover:text-white"
              >
                <UserPlus className="inline-block mr-2 w-4 h-4" />
                Sign Up
              </motion.button>
            </motion.div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 md:hidden"
              onClick={toggleMobileMenu}
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

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="fixed inset-x-0 top-16 z-40 bg-white shadow-lg"
          >
            <motion.div
              className="px-4 py-2 space-y-2"
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
                </motion.div>
              ))}
              <motion.div
                className="flex flex-col pt-2 space-y-2 border-t border-gray-200"
                variants={{
                  open: { y: 0, opacity: 1 },
                  closed: { y: -20, opacity: 0 },
                }}
                transition={{ duration: 0.2 }}
              >
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="py-2 text-sm font-medium text-white rounded-md transition-colors bg-primary hover:bg-primary-dark"
                >
                  <LogIn className="inline-block mr-2 w-4 h-4" />
                  Login
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="py-2 text-sm font-medium bg-white rounded-md border transition-colors text-primary border-primary hover:bg-primary hover:text-white"
                >
                  <UserPlus className="inline-block mr-2 w-4 h-4" />
                  Sign Up
                </motion.button>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default Navbar