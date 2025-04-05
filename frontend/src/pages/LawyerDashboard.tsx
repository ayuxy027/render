import React, { useState, useEffect } from 'react';
import { Clock, FileText, BookOpen, Bell, CheckCircle, AlertTriangle, Briefcase, UserSquare, Search, ChevronRight } from 'lucide-react';
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
  const [animateTab, setAnimateTab] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCaseDetails, setSelectedCaseDetails] = useState<{ label: string; value: string; }[]>([]);
  const [events, setEvents] = useState<Array<{
    date: string;
    title: string;
    type: 'hearing' | 'meeting' | 'deadline' | 'appointment';
    time?: string;
    details?: string;
  }>>([]);

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

  // Generate dynamic events based on cases
  useEffect(() => {
    const baseEvents = [
      { date: '2024-06-16', title: 'Corporate Merger Meeting', type: 'meeting' as const, time: '2:00 PM', details: 'Client boardroom' },
      { date: '2024-06-19', title: 'IP Dispute Hearing', type: 'hearing' as const, time: '9:30 AM', details: 'Federal Court, Room 303' },
      { date: '2024-06-21', title: 'Employment Law Consultation', type: 'deadline' as const, time: '11:15 AM', details: 'Conference room B' },
      { date: '2024-06-25', title: 'Real Estate Transaction Discussion', type: 'meeting' as const, time: '3:45 PM', details: 'Client office' },
      { date: '2024-06-28', title: 'Mergers and Acquisitions Strategy', type: 'meeting' as const, time: '10:00 AM', details: 'Conference call with international team' },
      { date: '2024-07-02', title: 'Family Law Case Review', type: 'hearing' as const, time: '1:30 PM', details: 'Family Court, Courtroom 2' },
      { date: '2024-07-07', title: 'Bankruptcy Filing Consultation', type: 'deadline' as const, time: '4:00 PM', details: 'Document review and submission' },
    ];

    // Add some randomized events to make calendar look more dynamic
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    const randomEvents = [];
    const eventTypes = ['hearing', 'meeting', 'deadline', 'appointment'] as const;
    const eventTitles = [
      'Client Meeting', 'Document Review', 'Due Diligence',
      'Court Appearance', 'Case Preparation', 'Settlement Negotiation',
      'Expert Witness Interview'
    ];

    // Generate 6 random events for the current month
    for (let i = 0; i < 6; i++) {
      const randomDay = Math.floor(Math.random() * 28) + 1;
      const randomHour = Math.floor(Math.random() * 8) + 9; // 9 AM to 5 PM
      const randomMinute = [0, 15, 30, 45][Math.floor(Math.random() * 4)];
      const randomType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
      const randomTitle = eventTitles[Math.floor(Math.random() * eventTitles.length)];

      const eventDate = new Date(currentYear, currentMonth, randomDay);
      // Skip if the date is in the past
      if (eventDate < today) continue;

      randomEvents.push({
        date: eventDate.toISOString().split('T')[0],
        title: randomTitle,
        type: randomType,
        time: `${randomHour}:${randomMinute.toString().padStart(2, '0')} ${randomHour >= 12 ? 'PM' : 'AM'}`,
        details: `Case-related activity`
      });
    }

    setEvents([...baseEvents, ...randomEvents]);
  }, []);

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

  const handleTabChange = (tab: 'cases' | 'documents' | 'notifications') => {
    setAnimateTab(true);
    setTimeout(() => {
      setActiveTab(tab);
      setAnimateTab(false);
    }, 150);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/50">
      <div className="container px-6 mx-auto py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <div className="p-3 bg-primary/10 rounded-full mr-4">
              <UserSquare className="w-10 h-10 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-primary-dark">Lawyer Dashboard</h1>
              <p className="text-gray-500">Welcome back, Attorney Name</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
              <input
                type="text"
                placeholder="Search cases..."
                className="py-2 pl-10 pr-4 rounded-full border border-gray-200 bg-white/80 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
              />
              <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
            </div>
            <div className="relative">
              <button className="p-2 rounded-full bg-secondary hover:bg-secondary/80 transition-colors relative">
                <Bell className="text-primary-dark" />
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 border-2 border-white text-white text-xs flex items-center justify-center">5</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex p-1 mb-8 rounded-full bg-secondary/50 shadow-sm border border-gray-100">
          {[
            { id: 'cases', label: 'Cases', icon: <FileText /> },
            { id: 'documents', label: 'Documents', icon: <BookOpen /> },
            { id: 'notifications', label: 'Notifications', icon: <Bell /> }
          ].map((tab) => (
            <button
              key={tab.id}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              onClick={() => handleTabChange(tab.id as any)}
              className={`
                flex-1 flex items-center justify-center py-3 px-4 rounded-full transition-all duration-200
                ${activeTab === tab.id
                  ? 'bg-primary text-white shadow-md'
                  : 'text-primary-dark hover:bg-secondary/80'}
              `}
            >
              {tab.icon}
              <span className="hidden ml-2 md:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Cases / Documents / Notifications Sections */}
          <div className={`space-y-6 md:col-span-2 transition-opacity duration-150 ${animateTab ? 'opacity-0' : 'opacity-100'}`}>
            {activeTab === 'cases' && (
              <>
                <div className="flex justify-between items-center">
                  <h2 className="flex items-center text-xl font-semibold text-primary-dark">
                    <Briefcase className="mr-2 text-primary" /> Active Cases
                  </h2>
                  <button className="text-primary text-sm font-medium flex items-center hover:underline">
                    View All <ChevronRight className="w-4 h-4 ml-1" />
                  </button>
                </div>
                <div className="space-y-4">
                  {cases.map((case_, index) => (
                    <CaseCard key={index} {...case_} onClick={() => handleCaseClick(case_)} />
                  ))}
                </div>
              </>
            )}

            {activeTab === 'documents' && (
              <>
                <div className="flex justify-between items-center">
                  <h2 className="flex items-center text-xl font-semibold text-primary-dark">
                    <BookOpen className="mr-2 text-primary" /> Case Documents
                  </h2>
                  <button className="text-primary text-sm font-medium flex items-center hover:underline">
                    Upload New <FileText className="w-4 h-4 ml-1" />
                  </button>
                </div>
                <div className="space-y-4">
                  {documents.map((doc, index) => (
                    <div
                      key={index}
                      className="p-4 transition-all rounded-lg bg-white border border-gray-100 shadow-sm hover:shadow-md cursor-pointer"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-primary-dark">{doc.title}</h3>
                          <p className="text-sm text-gray-600">{doc.type}</p>
                        </div>
                        <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{doc.date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {activeTab === 'notifications' && (
              <>
                <div className="flex justify-between items-center">
                  <h2 className="flex items-center text-xl font-semibold text-primary-dark">
                    <Bell className="mr-2 text-primary" /> Recent Notifications
                  </h2>
                  <button className="text-primary text-sm font-medium flex items-center hover:underline">
                    Mark All as Read <CheckCircle className="w-4 h-4 ml-1" />
                  </button>
                </div>
                <div className="space-y-4">
                  {notifications.map((notification, index) => (
                    <div
                      key={index}
                      className="flex items-center p-4 transition-all rounded-lg bg-white border border-gray-100 shadow-sm hover:shadow-md cursor-pointer"
                    >
                      <div className="p-2 rounded-full bg-gray-50 mr-4">{notification.icon}</div>
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
          <div className="space-y-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <h3 className="text-lg font-semibold text-primary-dark mb-4">Upcoming Events</h3>
              <Calendar customEvents={events} />
            </div>

            {/* Quick Stats */}
            <div className="p-6 rounded-xl bg-white shadow-sm border border-gray-100">
              <h3 className="mb-4 text-lg font-semibold text-primary-dark">Case Statistics</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 text-center rounded-lg bg-primary/5 border border-primary/10">
                  <h4 className="text-sm text-gray-600 mb-1">Active Cases</h4>
                  <p className="text-2xl font-bold text-primary">15</p>
                </div>
                <div className="p-4 text-center rounded-lg bg-green-50 border border-green-100">
                  <h4 className="text-sm text-gray-600 mb-1">Won Cases</h4>
                  <p className="text-2xl font-bold text-green-600">8</p>
                </div>
                <div className="p-4 text-center rounded-lg bg-amber-50 border border-amber-100">
                  <h4 className="text-sm text-gray-600 mb-1">Pending Appeals</h4>
                  <p className="text-2xl font-bold text-amber-600">3</p>
                </div>
                <div className="p-4 text-center rounded-lg bg-blue-50 border border-blue-100">
                  <h4 className="text-sm text-gray-600 mb-1">Success Rate</h4>
                  <p className="text-2xl font-bold text-blue-600">85%</p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="p-6 rounded-xl bg-white shadow-sm border border-gray-100">
              <h3 className="mb-4 text-lg font-semibold text-primary-dark">Quick Actions</h3>
              <div className="space-y-2">
                <button className="w-full p-2 text-left rounded-lg hover:bg-primary/5 transition-colors flex items-center">
                  <FileText className="mr-2 w-5 h-5 text-primary" />
                  <span>Add New Case</span>
                </button>
                <button className="w-full p-2 text-left rounded-lg hover:bg-primary/5 transition-colors flex items-center">
                  <BookOpen className="mr-2 w-5 h-5 text-primary" />
                  <span>Draft Document</span>
                </button>
                <button className="w-full p-2 text-left rounded-lg hover:bg-primary/5 transition-colors flex items-center">
                  <Bell className="mr-2 w-5 h-5 text-primary" />
                  <span>Set Reminder</span>
                </button>
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