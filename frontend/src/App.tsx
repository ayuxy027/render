import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { useTranslation } from './utils/useTranslation';
import { Home } from './pages/Home';
import DiseaseDetection  from './pages/DiseaseDetection';
import CropAdvisory from './pages/CropAdvisory';
import { MarketInsights } from './pages/MarketInsights';
import Water from './pages/SmartFarming'; 
import Chatbot from './components/Chatbot';


function App() {
  const { language, setLanguage, translations, t } = useTranslation();

  if (!translations) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-12 h-12 rounded-full border-b-2 animate-spin border-primary-600"></div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar language={language} setLanguage={setLanguage} t={t} />
        {/* @ts-ignore  */}
        <Chatbot t={t} />
        <main className="pt-16">
          <Routes>
            {/* @ts-ignore  */}
            <Route path="/" element={<Home t={t} />} />
            <Route path="/disease-detection" element={<DiseaseDetection t={t} />} />
            {/* @ts-ignore  */}
            <Route path="/crop-advisory" element={<CropAdvisory t={t} />} />
            <Route path="/market-insights" element={<MarketInsights t={t} />} />
            {/* @ts-ignore  */}
            <Route path="/prediction" element={<Water t={t} />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;