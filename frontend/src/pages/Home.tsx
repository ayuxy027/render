import React from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import Market from '../components/Market';

const ScrollIndicator = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <motion.div
      style={{ scaleX }}
      className="fixed top-0 right-0 left-0 z-50 h-1 origin-left bg-primary-500"
    />
  );
};

const GradientOrb = ({ className }: { className: string }) => (
  <motion.div
    className={`absolute rounded-full mix-blend-multiply filter blur-xl ${className}`}
    animate={{
      scale: [1, 1.2, 1],
      opacity: [0.4, 0.7, 0.4],
    }}
    transition={{
      duration: 8,
      repeat: Infinity,
      ease: "easeInOut",
    }}
  />
);

export const Home: React.FC = () => {
  return (
    <div className="overflow-hidden relative bg-white">
      <ScrollIndicator />

      {/* Hero Section */}
      <section className="flex relative items-center min-h-screen">
        <div className="overflow-hidden absolute inset-0">
          <GradientOrb className="w-[600px] h-[600px] -left-48 -top-48 bg-blue-100/80" />
          <GradientOrb className="w-[700px] h-[700px] -right-48 -bottom-48 bg-emerald-100/80" />
          <GradientOrb className="w-[500px] h-[500px] left-1/4 top-1/4 bg-primary-100/50" />
        </div>

        <div className="relative z-10 w-full">
          <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
            <div className="relative mx-auto max-w-3xl">
              <div className="text-center">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="inline-block mb-8"
                >
                  <motion.div
                    className="inline-flex gap-2 items-center px-5 py-2 text-sm font-medium bg-gradient-to-r to-emerald-50 rounded-full transition-colors duration-300 from-primary-50 text-primary-900 hover:to-emerald-100 hover:from-primary-100"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Sparkles className="w-4 h-4 text-primary-500" />
                    <span className="text-xs font-semibold tracking-wide text-transparent uppercase bg-clip-text bg-gradient-to-r to-emerald-700 from-primary-700">
                      Revolutionizing Agriculture
                    </span>
                  </motion.div>
                </motion.div>

                <div className="relative">
                  <motion.h1
                    className="mb-6 text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.8 }}
                  >
                    <span className="text-gray-900">Smart Farming Made Simple with</span>{' '}
                    <motion.span
                      className="inline-block relative font-black font-['Righteous'] text-transparent bg-clip-text bg-gradient-to-r to-emerald-600 from-primary-600 bg-size-200 hover:scale-105 transition-transform duration-300"
                      animate={{
                        backgroundPosition: ['0%', '200%'],
                      }}
                      transition={{
                        duration: 20,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    >
                      Generative AI
                      <motion.div
                        className="absolute -top-8 -right-8"
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 1, duration: 0.5 }}
                      >
                        <Sparkles className="w-6 h-6 text-primary-400" />
                      </motion.div>
                    </motion.span>
                  </motion.h1>

                  <motion.p
                    className="mx-auto mb-10 max-w-xl text-base leading-relaxed text-gray-600 md:text-lg"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.8 }}
                  >
                    Use AI to make better farming decisions, detect crop diseases early, and maximize your yield
                  </motion.p>

                  <motion.div
                    className="flex flex-wrap gap-4 justify-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.8 }}
                  >
                    <motion.div
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                      className="relative group"
                    >
                      <motion.div
                        className="absolute inset-0 rounded-xl opacity-20 blur-xl transition-all duration-300 bg-primary-500 group-hover:opacity-40 group-hover:scale-105"
                        initial={{ scale: 0.8 }}
                      />
                      <Link
                        to="/crop-advisory"
                        className="inline-flex relative items-center px-6 py-3 text-base font-semibold text-white rounded-xl shadow-lg transition-all duration-300 bg-primary-600 hover:bg-primary-700 shadow-primary-500/20 hover:shadow-xl hover:shadow-primary-500/30"
                      >
                        Get Started
                        <ChevronRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
                      </Link>
                    </motion.div>
                    <motion.div
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                      className="relative group"
                    >
                      <motion.div
                        className="absolute inset-0 bg-gray-100 rounded-xl opacity-20 blur-xl transition-all duration-300 group-hover:opacity-40 group-hover:scale-105"
                        initial={{ scale: 0.8 }}
                      />
                      <Link
                        to="/disease-detection"
                        className="inline-flex relative items-center px-6 py-3 text-base font-semibold text-gray-900 bg-white rounded-xl border border-gray-200 shadow-lg transition-all duration-300 hover:bg-gray-50 hover:border-gray-300 shadow-gray-200/40 hover:shadow-xl"
                      >
                        Try Disease Detection
                        <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
                      </Link>
                    </motion.div>
                  </motion.div>

                  {/* Stats Section */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.8 }}
                    className="grid grid-cols-1 gap-4 mt-16 md:grid-cols-3"
                  >
                    {[
                      { value: "95%", label: "Detection Accuracy", color: "from-primary-500 to-emerald-500" },
                      { value: "24/7", label: "Real-time Monitoring", color: "from-emerald-500 to-green-500" },
                      { value: "50+", label: "Supported Crops", color: "from-primary-500 to-emerald-500" },
                    ].map((stat, index) => (
                      <motion.div
                        key={index}
                        whileHover={{ y: -4, scale: 1.01 }}
                        className="relative group"
                      >
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-br from-gray-100 to-white rounded-xl opacity-50 blur-xl transition-opacity group-hover:opacity-70"
                        />
                        <div className="relative p-6 text-center rounded-xl border border-gray-100 shadow-md backdrop-blur-sm transition-all duration-300 bg-white/90 group-hover:border-gray-200 group-hover:shadow-lg">
                          <div className={`mb-1 text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r ${stat.color}`}>
                            {stat.value}
                          </div>
                          <div className="text-sm font-medium text-gray-600">{stat.label}</div>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Market Section */}
      <div className="relative">
        <Market />
      </div>
    </div>
  );
};

export default Home;
