import React, { useState } from 'react';
import { Clock, FileText, BookOpen, Bell, CheckCircle, AlertTriangle, Briefcase, UserSquare } from 'lucide-react';
import Calendar from '../components/Calender';
import CaseDetailsModal from '../components/CaseDetailsModal';

interface CaseCardProps {
  title: string;
  description: string;
  priority: 'Low' | 'Medium' | 'High';
  date: string;
  onClick: () => void;
}

const CaseCard: React.FC<CaseCardProps> = ({ title, description, priority, date, onClick }) => {
  const priorityColors = {
    Low: 'bg-green-50 border-green-200',
    Medium: 'bg-yellow-50 border-yellow-200',
    High: 'bg-red-50 border-red-200'
  };

  return (
    <div 
      className={`
        border rounded-lg p-4 transition-all duration-300 
        hover:shadow-md ${priorityColors[priority]} cursor-pointer
      `}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold text-primary-dark">{title}</h3>
        <span className={`
          px-2 py-1 rounded-full text-xs font-medium
          ${priority === 'High' ? 'bg-red-500 text-white' :
            priority === 'Medium' ? 'bg-yellow-500 text-black' :
            'bg-green-500 text-white'}
        `}>
          {priority} Priority
        </span>
      </div>
      <p className="mb-2 text-sm text-gray-600">{description}</p>
      <div className="flex items-center text-sm text-gray-500">
        <Clock className="w-4 h-4 mr-2" />
        <span>{new Date(date).toLocaleDateString()}</span>
      </div>
    </div>
  );
};

const LawyerDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'cases' | 'documents' | 'notifications'>('cases');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCaseDetails, setSelectedCaseDetails] = useState<{ label: string; value: string; }[]>([]);

  const cases = [
    {
      title: 'Corporate Merger',
      description: 'Advising on legal aspects of a major corporate merger.',
      priority: 'High' as const,
      date: '2024-06-16',
    },
    {
      title: 'Intellectual Property Dispute',
      description: 'Representing client in a patent infringement case.',
      priority: 'Medium' as const,
      date: '2024-06-19',
    },
    {
      title: 'Employment Law Consultation',
      description: 'Providing legal advice on employee rights and regulations.',
      priority: 'Low' as const,
      date: '2024-06-21',
    },
    {
      title: 'Real Estate Transaction',
      description: 'Assisting with a commercial property lease agreement.',
      priority: 'Medium' as const,
      date: '2024-07-01',
    },
    {
      title: 'Mergers and Acquisitions',
      description: 'Consulting on cross-border acquisition strategies.',
      priority: 'High' as const,
      date: '2024-07-03',
    },
    {
      title: 'Family Law Case',
      description: 'Providing legal representation in a child custody dispute.',
      priority: 'Low' as const,
      date: '2024-07-05',
    },
    {
      title: 'Bankruptcy Filing',
      description: 'Advising on the legal process of corporate bankruptcy.',
      priority: 'High' as const,
      date: '2024-07-10',
    },
  ];
  
  const events = [
    { date: '2024-06-16', title: 'Corporate Merger Meeting', type: 'meeting' },
    { date: '2024-06-19', title: 'IP Dispute Hearing', type: 'hearing' },
    { date: '2024-06-21', title: 'Employment Law Consultation', type: 'deadline' },
    { date: '2024-06-25', title: 'Real Estate Transaction Discussion', type: 'meeting' },
    { date: '2024-06-28', title: 'Mergers and Acquisitions Strategy', type: 'meeting' },
    { date: '2024-07-02', title: 'Family Law Case Review', type: 'hearing' },
    { date: '2024-07-07', title: 'Bankruptcy Filing Consultation', type: 'deadline' },
  ];
  
  const notifications = [
    { 
      icon: <AlertTriangle className="text-yellow-500" />, 
      message: "Client documents pending for Corporate Merger case",
      time: "1 hour ago"
    },
    { 
      icon: <CheckCircle className="text-green-500" />, 
      message: "IP Dispute hearing scheduled",
      time: "3 hours ago"
    },
    { 
      icon: <Briefcase className="text-blue-500" />, 
      message: "New client consultation request",
      time: "Yesterday"
    },
    { 
      icon: <AlertTriangle className="text-yellow-500" />, 
      message: "Real Estate Transaction documents incomplete",
      time: "2 hours ago"
    },
    { 
      icon: <CheckCircle className="text-green-500" />, 
      message: "Mergers and Acquisitions strategy approved",
      time: "5 hours ago"
    },
    { 
      icon: <Briefcase className="text-blue-500" />, 
      message: "Family Law case scheduled for review",
      time: "Yesterday"
    },
    { 
      icon: <CheckCircle className="text-green-500" />, 
      message: "Bankruptcy filing completed",
      time: "6 hours ago"
    },
  ];
  
  const documents = [
    { 
      title: "Corporate Merger Agreement", 
      type: "Legal Document", 
      date: "2024-06-10" 
    },
    { 
      title: "Patent Infringement Evidence", 
      type: "Case Evidence", 
      date: "2024-06-12" 
    },
    { 
      title: "Employment Law Brief", 
      type: "Legal Brief", 
      date: "2024-06-14" 
    },
    { 
      title: "Real Estate Lease Agreement", 
      type: "Contract", 
      date: "2024-06-18" 
    },
    { 
      title: "Mergers and Acquisitions Proposal", 
      type: "Proposal", 
      date: "2024-06-20" 
    },
    { 
      title: "Family Law Case File", 
      type: "Case File", 
      date: "2024-06-22" 
    },
    { 
      title: "Bankruptcy Filing Documents", 
      type: "Legal Documents", 
      date: "2024-06-25" 
    },
  ];

  const generateRandomCaseDetails = (caseData: typeof cases[0]): { label: string; value: string; }[] => {
    const clientNames = ['John Doe', 'Jane Smith', 'Acme Corporation', 'Tech Innovators Inc.', 'Global Enterprises LLC'];
    const attorneys = ['Alice Johnson', 'Bob Williams', 'Carol Brown', 'David Miller', 'Eva Garcia'];
    const courts = ['Supreme Court', 'District Court', 'Federal Court', 'State Court', 'Appellate Court'];
    const statuses = ['Active', 'Pending', 'On Hold', 'Closed', 'Under Review'];

    return [
      { label: 'Case Number', value: `${Math.floor(1000 + Math.random() * 9000)}-${new Date().getFullYear()}` },
      { label: 'Client', value: clientNames[Math.floor(Math.random() * clientNames.length)] },
      { label: 'Lead Attorney', value: attorneys[Math.floor(Math.random() * attorneys.length)] },
      { label: 'Court', value: courts[Math.floor(Math.random() * courts.length)] },
      { label: 'Filed Date', value: new Date(caseData.date).toLocaleDateString() },
      { label: 'Status', value: statuses[Math.floor(Math.random() * statuses.length)] },
      { label: 'Priority', value: caseData.priority },
      { label: 'Description', value: caseData.description },
    ];
  };

  const handleCaseClick = (caseData: typeof cases[0]) => {
    const details = generateRandomCaseDetails(caseData);
    setSelectedCaseDetails(details);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen p-6 bg-background">
      <div className="container mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <UserSquare className="w-10 h-10 mr-4 text-primary" />
            <h1 className="text-3xl font-bold text-primary-dark">Lawyer Dashboard</h1>
          </div>
          <div className="p-2 rounded-full bg-secondary">
            <Bell className="text-primary-dark" />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex p-1 mb-6 rounded-full bg-secondary/50">
          {[
            { id: 'cases', label: 'Cases', icon: <FileText /> },
            { id: 'documents', label: 'Documents', icon: <BookOpen /> },
            { id: 'notifications', label: 'Notifications', icon: <Bell /> }
          ].map((tab) => (
            <button
              key={tab.id}
               // eslint-disable-next-line @typescript-eslint/no-explicit-any
              onClick={() => setActiveTab(tab.id as any)}
              className={`
                flex-1 flex items-center justify-center p-3 rounded-full transition-all
                ${activeTab === tab.id 
                  ? 'bg-primary text-white' 
                  : 'text-primary-dark hover:bg-secondary'}
              `}
            >
              {tab.icon}
              <span className="hidden ml-2 md:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Cases / Documents / Notifications Sections */}
          <div className="space-y-6 md:col-span-2">
            {activeTab === 'cases' && (
              <>
                <h2 className="flex items-center text-xl font-semibold text-primary-dark">
                  <Briefcase className="mr-2 text-primary" /> Active Cases
                </h2>
                <div className="space-y-4">
                  {cases.map((case_, index) => (
                    <CaseCard key={index} {...case_} onClick={() => handleCaseClick(case_)} />
                  ))}
                </div>
              </>
            )}

            {activeTab === 'documents' && (
              <>
                <h2 className="flex items-center text-xl font-semibold text-primary-dark">
                  <BookOpen className="mr-2 text-primary" /> Case Documents
                </h2>
                <div className="space-y-4">
                  {documents.map((doc, index) => (
                    <div 
                      key={index} 
                      className="p-4 transition-colors rounded-lg bg-secondary/50 hover:bg-secondary"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-primary-dark">{doc.title}</h3>
                          <p className="text-sm text-gray-600">{doc.type}</p>
                        </div>
                        <span className="text-sm text-gray-500">{doc.date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {activeTab === 'notifications' && (
              <>
                <h2 className="flex items-center text-xl font-semibold text-primary-dark">
                  <Bell className="mr-2 text-primary" /> Recent Notifications
                </h2>
                <div className="space-y-4">
                  {notifications.map((notification, index) => (
                    <div 
                      key={index} 
                      className="flex items-center p-4 transition-colors rounded-lg bg-secondary/50 hover:bg-secondary"
                    >
                      <div className="mr-4">{notification.icon}</div>
                      <div className="flex-grow">
                        <p className="text-sm text-primary-dark">{notification.message}</p>
                        <span className="text-xs text-gray-500">{notification.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Sidebar with Calendar */}
          <div>
            <Calendar customEvents={events.map(event => ({
              ...event,
              type: event.type as 'hearing' | 'meeting' | 'deadline' | 'appointment'
            }))} />
            
            {/* Quick Stats */}
            <div className="p-4 mt-6 rounded-lg bg-secondary/50">
              <h3 className="mb-4 text-lg font-semibold text-primary-dark">Case Statistics</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 text-center bg-white rounded-lg">
                  <h4 className="text-sm text-gray-500">Active Cases</h4>
                  <p className="text-2xl font-bold text-primary-dark">15</p>
                </div>
                <div className="p-3 text-center bg-white rounded-lg">
                  <h4 className="text-sm text-gray-500">Won Cases</h4>
                  <p className="text-2xl font-bold text-primary-dark">8</p>
                </div>
                <div className="p-3 text-center bg-white rounded-lg">
                  <h4 className="text-sm text-gray-500">Pending Appeals</h4>
                  <p className="text-2xl font-bold text-primary-dark">3</p>
                </div>
                <div className="p-3 text-center bg-white rounded-lg">
                  <h4 className="text-sm text-gray-500">Success Rate</h4>
                  <p className="text-2xl font-bold text-primary-dark">85%</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <CaseDetailsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        caseDetails={selectedCaseDetails}
      />
    </div>
  );
};

export default LawyerDashboard;