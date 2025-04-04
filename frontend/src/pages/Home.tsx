import React from 'react';
import { motion, useScroll, useTransform, useSpring, useInView } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Plane as Plant,
  Brain,
  BarChart3,
  MessageSquare,
  ArrowRight,
  ChevronRight,
  MousePointer2,
  ArrowDown
} from 'lucide-react';
import Market from '../components/Market';

interface Feature {
  icon: React.ElementType;
  title: string;
  description: string;
  color: string;
  size?: 'default' | 'large' | 'wide' | 'tall';
  link?: boolean;
  badge?: string;
}

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

const ScrollDownIndicator = () => (
  <motion.div
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{
      duration: 1,
      repeat: Infinity,
      repeatType: "reverse"
    }}
    className="flex absolute bottom-10 left-1/2 flex-col items-center text-gray-500 transform -translate-x-1/2"
  >
    <ArrowDown className="mb-2 w-5 h-5" />
    <span className="text-sm font-medium">Scroll to explore</span>
  </motion.div>
);

const FeatureCard: React.FC<Feature & { index: number }> = ({
  icon: Icon,
  title,
  description,
  color,
  size = 'default',
  index,
  link,
  badge
}) => {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-10%" });

  return (
    <motion.div
      ref={ref}
      initial="initial"
      animate={isInView ? "animate" : "initial"}
      variants={{
        initial: { opacity: 0, y: 50 },
        animate: {
          opacity: 1,
          y: 0,
          transition: {
            duration: 0.8,
            ease: [0.22, 1, 0.36, 1],
            delay: index * 0.15
          }
        }
      }}
      whileHover={{ scale: 1.02, translateY: -8 }}
      className={`
        ${color} 
        rounded-2xl p-6 
        transition-all duration-500 
        shadow-lg hover:shadow-2xl
        relative 
        overflow-hidden
        group
        flex flex-col
        backdrop-blur-sm
        ${size === 'large' ? 'md:col-span-2 md:row-span-2' : ''}
        ${size === 'wide' ? 'md:col-span-2' : ''}
        ${size === 'tall' ? 'md:row-span-2' : ''}
      `}
    >
      <div className="flex relative z-10 flex-col h-full">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-start space-x-3">
            <motion.div
              whileHover={{ rotate: 12, scale: 1.1 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="bg-white/20 p-2.5 rounded-xl backdrop-blur-sm"
            >
              <Icon className="w-5 h-5" />
            </motion.div>
            <div>
              {badge && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="inline-block px-2.5 py-1 mb-2 text-xs font-medium rounded-full bg-white/20"
                >
                  {badge}
                </motion.span>
              )}
              <h3 className="text-lg font-semibold leading-tight">{title}</h3>
            </div>
          </div>
          {link && (
            <Link
              to="#"
              className="opacity-0 transition-all duration-300 group-hover:opacity-100"
            >
              <motion.div
                whileHover={{ x: 5, scale: 1.1 }}
                transition={{ type: "spring", stiffness: 400 }}
                className="p-2 rounded-lg hover:bg-white/10"
              >
                <ChevronRight className="w-4 h-4" />
              </motion.div>
            </Link>
          )}
        </div>

        <p className="flex-1 max-w-lg opacity-90 text-sm/relaxed">
          {description}
        </p>
      </div>

      <motion.div
        className="absolute inset-0 bg-gradient-to-br to-transparent pointer-events-none from-white/10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      />
      <motion.div
        className="absolute -right-8 -bottom-8 w-40 h-40 rounded-full opacity-40 blur-3xl transition-opacity duration-500 bg-white/10"
        whileHover={{ opacity: 0.8, scale: 1.2 }}
      />
    </motion.div>
  );
};

export const Home: React.FC = () => {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  const features: Feature[] = [
    {
      icon: Plant,
      title: "Early Disease Detection",
      description: "Take a photo of your crops to instantly identify diseases and get treatment recommendations",
      color: 'bg-gradient-to-br from-primary-600 to-primary-700 text-white',
      size: 'large',
      badge: 'New AI Model',
      link: true
    },
    {
      icon: Brain,
      title: "Smart Crop Advisory",
      description: "Get personalized advice based on your soil, weather, and crop conditions",
      color: 'bg-gradient-to-br from-emerald-600 to-emerald-700 text-white',
      size: 'tall',
      badge: 'Beta',
      link: true
    },
    {
      icon: BarChart3,
      title: "Market Prices",
      description: "Stay updated with real-time market prices and connect with buyers directly",
      color: 'bg-gradient-to-br from-green-600 to-green-700 text-white',
      link: true
    },
    {
      icon: MessageSquare,
      title: "24/7 Farming Assistant",
      description: "Get instant answers to your farming questions in your preferred language",
      color: 'bg-gradient-to-br from-primary-600 to-primary-700 text-white',
      size: 'wide',
      badge: 'Popular',
      link: true
    }
  ];

  return (
    <div className="overflow-hidden relative min-h-screen bg-white">
      <ScrollIndicator />

      <div className="relative">
        <motion.div
          style={{ y }}
          className="absolute top-0 right-0 w-1/2 h-screen bg-gradient-to-bl to-transparent blur-3xl from-primary-50/30 -z-10"
        />
        <motion.div
          style={{ y }}
          className="absolute left-0 top-1/2 w-1/2 h-screen bg-gradient-to-tr to-transparent blur-3xl from-emerald-50/30 -z-10"
        />
      </div>

      <div className="px-4 py-20 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative mx-auto mb-20 max-w-2xl text-center"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-block mb-4"
          >
            <motion.span
              whileHover={{ scale: 1.05 }}
              className="px-4 py-1.5 rounded-full bg-primary-50 text-primary-600 text-sm font-medium inline-flex items-center gap-2"
            >
              <MousePointer2 className="w-4 h-4" />
              Launching Soon
            </motion.span>
          </motion.div>

          <motion.h1
            className="mb-6 text-4xl font-bold leading-tight text-transparent bg-clip-text bg-gradient-to-r md:text-5xl lg:text-6xl from-primary-600 to-primary-500"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            Smart Farming Made Simple
          </motion.h1>

          <motion.p
            className="mx-auto mb-8 max-w-xl text-lg text-gray-600"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            Use AI to make better farming decisions, detect crop diseases early, and maximize your yield
          </motion.p>

          <motion.div
            className="flex flex-wrap gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                to="/crop-advisory"
                className="inline-flex items-center px-6 py-3 text-white rounded-xl shadow-lg transition-all duration-300 bg-primary-600 hover:bg-primary-700 shadow-primary-500/20 hover:shadow-xl hover:shadow-primary-500/30"
              >
                Get Started
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                to="/disease-detection"
                className="inline-flex items-center px-6 py-3 text-gray-700 bg-white rounded-xl border border-gray-200 shadow-lg transition-all duration-300 hover:bg-gray-50 hover:border-gray-300 shadow-gray-200/40 hover:shadow-xl"
              >
                Try Disease Detection AI
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>

        <ScrollDownIndicator />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-20"
        >
          <Market />
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[minmax(200px,auto)]">
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} index={index} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
