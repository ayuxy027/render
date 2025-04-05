import React, { JSX } from "react"
import { useEffect, useCallback, useMemo } from "react"
import { motion, useAnimation, type Variants } from "framer-motion"
import { Scale, Shield, Brain, ArrowRight, Users, MessageSquare, Clock, Lock, ChevronDown, Sparkles } from "lucide-react"
import homeimg from "../assets/homeimg.png"
import Navbar from "../components/Navbar"

interface Feature {
  icon: JSX.Element
  title: string
  description: string
}

interface Statistic {
  value: string
  label: string
}

interface Benefit {
  icon: JSX.Element
  text: string
}

const LandingPage: React.FC = () => {
  const controls = useAnimation()

  const startAnimation = useCallback(() => {
    controls.start((i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1 },
    }))
  }, [controls])

  useEffect(() => {
    startAnimation()
  }, [startAnimation])

  const features: Feature[] = useMemo(
    () => [
      {
        icon: <Brain className="w-6 h-6" />,
        title: "AI-Powered Legal Analysis",
        description: "Advanced machine learning algorithms provide instant legal insights and case analysis",
      },
      {
        icon: <Shield className="w-6 h-6" />,
        title: "Secure Document Management",
        description: "Bank-grade encryption for all your sensitive legal documents",
      },
      {
        icon: <MessageSquare className="w-6 h-6" />,
        title: "Real-time Collaboration",
        description: "Seamless communication between clients, lawyers, and legal staff",
      },
    ],
    [],
  )

  const statistics: Statistic[] = useMemo(
    () => [
      { value: "98%", label: "Success Rate" },
      { value: "50K+", label: "Cases Handled" },
      { value: "24/7", label: "Support" },
      { value: "100+", label: "Legal Experts" },
    ],
    [],
  )

  const benefits: Benefit[] = useMemo(
    () => [
      {
        icon: <Clock />,
        text: "Save up to 70% of your time on legal research",
      },
      { icon: <Shield />, text: "Enterprise-grade security for your data" },
      { icon: <Users />, text: "Collaborate seamlessly with your team" },
      { icon: <Lock />, text: "GDPR and HIPAA compliant" },
    ],
    [],
  )

  const fadeInUp: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  }

  const staggerChildren: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const scaleIn: Variants = {
    hidden: { scale: 0.95, opacity: 0 },
    visible: { scale: 1, opacity: 1, transition: { duration: 0.4 } },
  }

  return (
    <div className="overflow-hidden">
      <Navbar />
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/50">
        {/* Hero Section */}
        <div className="relative">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            className="container px-4 pt-20 pb-32 mx-auto"
          >
            <div className="flex flex-col items-center mx-auto max-w-4xl text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, type: "spring", stiffness: 200 }}
                className="relative p-3 mb-6 rounded-full bg-primary/10"
              >
                <Scale className="w-10 h-10 text-primary" />
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8, duration: 1.5, repeat: Infinity, repeatType: "reverse" }}
                  className="absolute -top-1 -right-1"
                >
                  <Sparkles className="w-4 h-4 text-amber-400" />
                </motion.div>
              </motion.div>
              <motion.h1
                className="mb-6 text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r md:text-7xl from-primary to-primary-dark"
                variants={fadeInUp}
              >
                Legal Innovation Meets Generative AI
              </motion.h1>
              <motion.p className="mb-8 text-xl text-gray-600" variants={fadeInUp}>
                Transform your legal practice with cutting-edge AI technology. Streamline workflows, enhance
                decision-making, and deliver superior legal services.
              </motion.p>
              <motion.div className="flex gap-4" variants={fadeInUp}>
                <motion.button
                  className="flex gap-2 items-center px-8 py-3 rounded-full btn btn-primary group"
                  whileHover={{ scale: 1.05, boxShadow: "0 5px 15px rgba(0, 0, 0, 0.1)" }}
                  whileTap={{ scale: 0.95 }}
                >
                  Get Started <ArrowRight className="w-4 h-4 transition-transform transform group-hover:translate-x-1" />
                </motion.button>
                <motion.button
                  className="px-8 py-3 rounded-full btn btn-outline"
                  whileHover={{ scale: 1.05, boxShadow: "0 5px 15px rgba(0, 0, 0, 0.05)" }}
                  whileTap={{ scale: 0.95 }}
                >
                  Watch Demo
                </motion.button>
              </motion.div>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.8, repeat: Infinity, repeatType: "reverse" }}
            className="absolute bottom-4 left-1/2 transform -translate-x-1/2"
          >
            <ChevronDown className="w-8 h-8 text-primary" />
          </motion.div>
        </div>

        {/* Features Section */}
        <section id="features" className="py-20 bg-white">
          <div className="container px-4 mx-auto">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="mb-12 text-center"
            >
              <h2 className="mb-4 text-3xl font-bold">Powerful <span className="text-primary">Features</span></h2>
              <p className="mx-auto max-w-2xl text-gray-600">Discover how our platform revolutionizes legal workflows</p>
            </motion.div>

            <motion.div
              className="grid gap-8 md:grid-cols-3"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerChildren}
            >
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  className="overflow-hidden relative p-6 bg-white rounded-xl shadow-lg transition-all hover:shadow-xl hover:bg-primary/5 group"
                  whileHover={{ y: -5 }}
                  variants={scaleIn}
                >
                  <div className="absolute top-0 right-0 -mt-4 -mr-4 w-20 h-20 bg-gradient-to-bl to-transparent rounded-full opacity-0 transition-opacity from-primary/10 group-hover:opacity-100"></div>
                  <div className="flex justify-center items-center mb-4 w-12 h-12 rounded-lg bg-primary/10">
                    {feature.icon}
                  </div>
                  <h3 className="mb-2 text-xl font-semibold">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Statistics Section */}
        <section id="statistics" className="py-20 bg-primary/5">
          <div className="container px-4 mx-auto">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="mb-12 text-center"
            >
              <h2 className="mb-4 text-3xl font-bold">Outstanding <span className="text-primary">Results</span></h2>
              <p className="mx-auto max-w-2xl text-gray-600">Our platform delivers measurable success for legal professionals</p>
            </motion.div>

            <motion.div
              className="grid grid-cols-2 gap-8 md:grid-cols-4"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerChildren}
            >
              {statistics.map((stat, index) => (
                <motion.div
                  key={index}
                  className="p-6 text-center bg-white rounded-xl shadow-md transition-shadow hover:shadow-lg"
                  variants={fadeInUp}
                  whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                >
                  <motion.div
                    className="mb-2 text-4xl font-bold text-primary"
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 100, delay: index * 0.1 }}
                  >
                    {stat.value}
                  </motion.div>
                  <div className="text-gray-600">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Benefits Section */}
        <section id="benefits" className="py-20 bg-white">
          <div className="container px-4 mx-auto">
            <motion.div
              className="grid gap-12 items-center md:grid-cols-2"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerChildren}
            >
              <div className="ml-8">
                <motion.h2 className="mb-6 text-4xl font-bold" variants={fadeInUp}>
                  Why Choose <span className="text-primary">Legal-E</span>?
                </motion.h2>
                <motion.div className="space-y-4" variants={staggerChildren}>
                  {benefits.map((item, index) => (
                    <motion.div
                      key={index}
                      className="flex gap-3 items-center p-4 bg-gray-50 rounded-lg transition-all hover:bg-primary/5 hover:shadow-md"
                      variants={fadeInUp}
                      whileHover={{ x: 5 }}
                    >
                      <div className="flex justify-center items-center w-10 h-10 rounded-full bg-primary/10">
                        <div className="text-primary">{item.icon}</div>
                      </div>
                      <span>{item.text}</span>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
              <motion.div
                className="relative h-[400px]"
                initial={{ opacity: 0, x: 100 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <div className="overflow-hidden absolute inset-0 bg-gradient-to-r rounded-2xl shadow-xl from-primary/20 to-secondary/20">
                  <div className="absolute inset-0 z-10 bg-gradient-to-t to-transparent from-black/20"></div>
                  <img
                    src={homeimg || "/placeholder.svg"}
                    alt="Legal-E dashboard"
                    className="object-cover w-full h-full transition-transform duration-500 transform hover:scale-105"
                  />
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-primary">
          <div className="container px-4 mx-auto text-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerChildren}
              className="mx-auto max-w-3xl"
            >
              <motion.h2 className="mb-6 text-4xl font-bold text-white" variants={fadeInUp}>
                Ready to Transform Your Legal Practice?
              </motion.h2>
              <motion.p className="mx-auto mb-8 max-w-2xl text-white/80" variants={fadeInUp}>
                Join thousands of legal professionals who are already using Legal-E to streamline their practice.
              </motion.p>
              <motion.button
                className="px-8 py-3 bg-white rounded-full btn text-primary hover:bg-gray-100"
                whileHover={{ scale: 1.05, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.2)" }}
                whileTap={{ scale: 0.95 }}
                variants={fadeInUp}
              >
                Start Free Trial
              </motion.button>
            </motion.div>
          </div>
        </section>

        {/* Footer */}
        <footer id="footer" className="py-12 text-white bg-gray-900">
          <div className="container px-4 mx-auto">
            <motion.div
              className="grid gap-8 md:grid-cols-4"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerChildren}
            >
              {/* About Section */}
              <motion.div variants={fadeInUp}>
                <div className="flex gap-2 items-center mb-4">
                  <Scale className="w-8 h-8 text-primary" />
                  <span className="text-xl font-bold text-white">Legal-E</span>
                </div>
                <p className="text-gray-400">
                  At Legal-E, we empower legal professionals by leveraging AI to streamline research, documentation,
                  and case management within the Indian legal ecosystem.
                </p>
                <div className="flex gap-3 mt-4">
                  <a href="#" className="flex justify-center items-center w-8 h-8 rounded-full transition-colors bg-white/10 hover:bg-primary/80">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M22.162 5.656a8.384 8.384 0 0 1-2.402.658A4.196 4.196 0 0 0 21.6 4c-.82.488-1.719.83-2.656 1.015a4.182 4.182 0 0 0-7.126 3.814 11.874 11.874 0 0 1-8.62-4.37 4.168 4.168 0 0 0-.566 2.103c0 1.45.738 2.731 1.86 3.481a4.168 4.168 0 0 1-1.894-.523v.052a4.185 4.185 0 0 0 3.355 4.101 4.21 4.21 0 0 1-1.89.072A4.185 4.185 0 0 0 7.97 16.65a8.394 8.394 0 0 1-6.191 1.732 11.83 11.83 0 0 0 6.41 1.88c7.693 0 11.9-6.373 11.9-11.9 0-.18-.005-.362-.013-.54a8.496 8.496 0 0 0 2.087-2.165z" /></svg>
                  </a>
                  <a href="#" className="flex justify-center items-center w-8 h-8 rounded-full transition-colors bg-white/10 hover:bg-primary/80">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" /></svg>
                  </a>
                  <a href="#" className="flex justify-center items-center w-8 h-8 rounded-full transition-colors bg-white/10 hover:bg-primary/80">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c5.51 0 10-4.48 10-10S17.51 2 12 2zm6.605 4.61a8.502 8.502 0 0 1 1.93 5.314c-.281-.054-3.101-.629-5.943-.271-.065-.141-.12-.293-.184-.445a25.416 25.416 0 0 0-.564-1.236c3.145-1.28 4.577-3.124 4.761-3.362zM12 3.475c2.17 0 4.154.813 5.662 2.148-.152.216-1.443 1.941-4.48 3.08-1.399-2.57-2.95-4.675-3.189-5A8.687 8.687 0 0 1 12 3.475zm-3.633.803a53.896 53.896 0 0 1 3.167 4.935c-3.992 1.063-7.517 1.04-7.896 1.04a8.581 8.581 0 0 1 4.729-5.975zM3.453 12.01v-.26c.37.01 4.512.065 8.775-1.215.25.477.477.965.694 1.453-.109.033-.228.065-.336.098-4.404 1.42-6.747 5.303-6.942 5.629a8.522 8.522 0 0 1-2.19-5.705zM12 20.547a8.482 8.482 0 0 1-5.239-1.8c.152-.315 1.888-3.656 6.703-5.337.022-.01.033-.01.054-.022a35.318 35.318 0 0 1 1.823 6.475 8.4 8.4 0 0 1-3.341.684zm4.761-1.465c-.086-.52-.542-3.015-1.659-6.084 2.679-.423 5.022.271 5.314.369a8.468 8.468 0 0 1-3.655 5.715z" clipRule="evenodd" /></svg>
                  </a>
                </div>
              </motion.div>

              {/* Product Section */}
              <motion.div variants={fadeInUp}>
                <h3 className="mb-4 font-semibold">Product</h3>
                <ul className="space-y-2 text-gray-400">
                  <li className="transition-colors cursor-pointer hover:text-primary">Case Research Tool</li>
                  <li className="transition-colors cursor-pointer hover:text-primary">Legal Document Drafting</li>
                  <li className="transition-colors cursor-pointer hover:text-primary">Case Management</li>
                  <li className="transition-colors cursor-pointer hover:text-primary">Analytics Dashboard</li>
                </ul>
              </motion.div>

              {/* Company Section */}
              <motion.div variants={fadeInUp}>
                <h3 className="mb-4 font-semibold">Company</h3>
                <ul className="space-y-2 text-gray-400">
                  <li className="transition-colors cursor-pointer hover:text-primary">About Us</li>
                  <li className="transition-colors cursor-pointer hover:text-primary">Careers</li>
                  <li className="transition-colors cursor-pointer hover:text-primary">Press</li>
                  <li className="transition-colors cursor-pointer hover:text-primary">Contact</li>
                </ul>
              </motion.div>

              {/* Resources Section */}
              <motion.div variants={fadeInUp}>
                <h3 className="mb-4 font-semibold">Resources</h3>
                <ul className="space-y-2 text-gray-400">
                  <li className="transition-colors cursor-pointer hover:text-primary">Blog</li>
                  <li className="transition-colors cursor-pointer hover:text-primary">Legal Insights</li>
                  <li className="transition-colors cursor-pointer hover:text-primary">Case Studies</li>
                  <li className="transition-colors cursor-pointer hover:text-primary">Help Center</li>
                </ul>
              </motion.div>
            </motion.div>

            <motion.div
              className="pt-8 mt-12 text-center text-gray-400 border-t border-gray-800"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <p>© {new Date().getFullYear()} Legal-E. All rights reserved.</p>
              <p className="mt-2">Made with <span className="text-red-500">❤️</span> by Team PartTimeHumans</p>
              <p className="mt-2">
                Follow us on
                <a href="https://x.com/mai3dalvi" className="mx-1 text-primary hover:underline">
                  X
                </a>
                &
                <a href="https://www.linkedin.com/in/maitridalvi13/" className="mx-1 text-primary hover:underline">
                  LinkedIn
                </a>
              </p>
            </motion.div>
          </div>
        </footer>
      </div>
    </div>
  )
}

export default LandingPage

