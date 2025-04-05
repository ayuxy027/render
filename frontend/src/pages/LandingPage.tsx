import React, { JSX } from "react"
import { useEffect, useCallback, useMemo } from "react"
import { motion, useAnimation, type Variants, } from "framer-motion"
import { Scale, Shield, Brain, ArrowRight, Users, MessageSquare, Clock, Lock, ChevronDown } from "lucide-react"
import homeimg from "../assets/homeimg.png"
import Navbar from "../components/Navbar"

interface Feature {
  icon: JSX.Element
  title: strin
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
    visible: { opacity: 1, y: 0 },
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
                className="p-3 mb-6 rounded-full bg-primary/10"
              >
                <Scale className="w-10 h-10 text-primary" />
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
                  className="flex gap-2 items-center px-8 py-3 rounded-full btn btn-primary"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Get Started <ArrowRight className="w-4 h-4" />
                </motion.button>
                <motion.button
                  className="px-8 py-3 rounded-full btn btn-outline"
                  whileHover={{ scale: 1.05 }}
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
            transition={{ delay: 1 }}
            className="absolute bottom-4 left-1/2 transform -translate-x-1/2"
          >
            <ChevronDown className="w-8 h-8 animate-bounce text-primary" />
          </motion.div>
        </div>

        {/* Features Section */}
        <section id="features" className="py-20 bg-white">
          <div className="container px-4 mx-auto">
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
                  className="p-6 bg-white rounded-xl shadow-lg transition-all hover:shadow-xl hover:bg-primary/5"
                  whileHover={{ scale: 1.02 }}
                  variants={fadeInUp}
                >
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
              className="grid grid-cols-2 gap-8 md:grid-cols-4"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerChildren}
            >
              {statistics.map((stat, index) => (
                <motion.div key={index} className="p-6 text-center bg-white rounded-xl shadow-md" variants={fadeInUp}>
                  <motion.div
                    className="mb-2 text-4xl font-bold text-primary"
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 100 }}
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
                  Why Choose Legal-E?
                </motion.h2>
                <motion.div className="space-y-4" variants={staggerChildren}>
                  {benefits.map((item, index) => (
                    <motion.div
                      key={index}
                      className="flex gap-3 items-center p-4 bg-gray-50 rounded-lg transition-colors hover:bg-primary/5"
                      variants={fadeInUp}
                    >
                      <div className="text-primary">{item.icon}</div>
                      <span>{item.text}</span>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
              <motion.div
                className="relative h-[400px]"
                initial={{ opacity: 0, x: 100 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <div className="overflow-hidden absolute inset-0 bg-gradient-to-r rounded-2xl from-primary/20 to-secondary/20">
                  <img
                    src={homeimg || "/placeholder.svg"}
                    alt="Legal-E dashboard"
                    className="object-cover w-full h-full"
                  />
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-primary">
          <div className="container px-4 mx-auto text-center">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerChildren}>
              <motion.h2 className="mb-6 text-4xl font-bold text-white" variants={fadeInUp}>
                Ready to Transform Your Legal Practice?
              </motion.h2>
              <motion.p className="mx-auto mb-8 max-w-2xl text-white/80" variants={fadeInUp}>
                Join thousands of legal professionals who are already using Legal-E to streamline their practice.
              </motion.p>
              <motion.button
                className="px-8 py-3 bg-white rounded-full btn text-primary hover:bg-gray-100"
                whileHover={{ scale: 1.05 }}
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
                <Scale className="mb-4 w-10 h-10 text-primary" />
                <p className="text-gray-400">
                  At Legal-E, we empower legal professionals by leveraging AI to streamline research, documentation,
                  and case management within the Indian legal ecosystem.
                </p>
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
              <p>Made with ❤️ by Team PartTimeHumans</p>
              <p>
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

