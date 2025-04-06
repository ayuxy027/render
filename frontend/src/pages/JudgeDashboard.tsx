import React, { useState, useEffect } from 'react';
import {
  Scale,
  Clock,
  FileText,
  BookOpen,
  Bell,
  CheckCircle,
  AlertTriangle,
  Briefcase,
  MessageCircle,
  Search,
  ChevronRight
} from 'lucide-react';
import Calendar from '../components/Calender';

interface CaseCardProps {
  title: string;
  description: string;
  priority: 'Low' | 'Medium' | 'High';
  date: string;
  onClick?: () => void;
}

const CaseCard: React.FC<CaseCardProps> = ({ title, description, priority, date, onClick }) => {
  const priorityColors = {
    Low: 'bg-green-50 border-green-200',
    Medium: 'bg-yellow-50 border-yellow-200',
    High: 'bg-red-50 border-red-200'
  };

  return (
    <div
      className={`p-4 rounded-lg border transition-all duration-300 hover:shadow-md ${priorityColors[priority]} ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <div className="flex justify-between items-center mb-2">
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
        <Clock className="mr-2 w-4 h-4" />
        <span>{new Date(date).toLocaleDateString()}</span>
      </div>
    </div>
  );
};

const JudgeDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'cases' | 'documents' | 'notifications'>('cases');
  const [animateTab, setAnimateTab] = useState(false);
  const [events, setEvents] = useState<Array<{
    date: string;
    title: string;
    type: 'hearing' | 'meeting' | 'deadline' | 'appointment';
    time?: string;
    details?: string;
  }>>([]);

  const cases = [
    {
      title: 'Property Dispute',
      description: 'Handling a legal property dispute between two parties.',
      priority: 'High' as const,
      date: '2024-06-15',
    },
    {
      title: 'Contract Violation',
      description: 'Representing the client in a breach of contract lawsuit.',
      priority: 'Medium' as const,
      date: '2024-06-18',
    },
    {
      title: 'Civil Rights Case',
      description: 'Filing a case to protect civil rights under Indian law.',
      priority: 'Low' as const,
      date: '2024-06-20',
    },
    {
      title: 'Fraud Investigation',
      description: 'Investigating a case of alleged fraud involving multiple parties.',
      priority: 'High' as const,
      date: '2024-06-23',
    },
    {
      title: 'Tax Evasion Case',
      description: 'Representing a client accused of tax evasion.',
      priority: 'Medium' as const,
      date: '2024-06-26',
    },
    {
      title: 'Environmental Protection Lawsuit',
      description: 'Taking legal action against a corporation for environmental damage.',
      priority: 'Low' as const,
      date: '2024-06-29',
    },
    {
      title: 'Land Acquisition Dispute',
      description: 'Resolving disputes regarding land acquisition by the government.',
      priority: 'Medium' as const,
      date: '2024-07-01',
    },
  ];

  // Generate dynamic events based on cases
  useEffect(() => {
    const baseEvents = [
      { date: '2024-06-15', title: 'Property Dispute Hearing', type: 'hearing' as const, time: '10:00 AM', details: 'Main Court Room 3' },
      { date: '2024-06-18', title: 'Contract Violation Case', type: 'meeting' as const, time: '2:30 PM', details: 'Pre-trial conference' },
      { date: '2024-06-20', title: 'Civil Rights Case Review', type: 'deadline' as const, time: '5:00 PM', details: 'Document submission deadline' },
      { date: '2024-06-23', title: 'Fraud Investigation Consultation', type: 'meeting' as const, time: '11:15 AM', details: 'Meeting with forensic accountant' },
      { date: '2024-06-26', title: 'Tax Evasion Case Review', type: 'deadline' as const, time: '3:00 PM', details: 'Evidence review deadline' },
      { date: '2024-06-29', title: 'Environmental Lawsuit Strategy', type: 'meeting' as const, time: '9:30 AM', details: 'Strategy session with environmental experts' },
      { date: '2024-07-01', title: 'Land Acquisition Hearing', type: 'hearing' as const, time: '1:00 PM', details: 'District Court, Courtroom B' },
    ];

    // Add some randomized events to make calendar look more dynamic
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    const randomEvents = [];
    const eventTypes = ['hearing', 'meeting', 'deadline', 'appointment'] as const;
    const eventTitles = [
      'Case Status Review', 'Evidence Presentation', 'Witness Preparation',
      'Legal Strategy Meeting', 'Document Review', 'Client Consultation',
      'Pre-trial Conference'
    ];

    // Generate 5 random events for the current month
    for (let i = 0; i < 5; i++) {
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
        details: `Random event #${i + 1}`
      });
    }

    setEvents([...baseEvents, ...randomEvents]);
  }, []);

  const notifications = [
    {
      icon: <AlertTriangle className="text-teal-500" />,
      message: "Pending case documents for Property Dispute",
      time: "2 hours ago"
    },
    {
      icon: <CheckCircle className="text-slate-500" />,
      message: "Case hearing for Contract Violation scheduled",
      time: "Yesterday"
    },
    {
      icon: <Briefcase className="text-blue-500" />,
      message: "New case assignment received",
      time: "3 days ago"
    },
    {
      icon: <AlertTriangle className="text-indigo-500" />,
      message: "Fraud investigation case requires additional evidence",
      time: "1 hour ago"
    },
    {
      icon: <CheckCircle className="text-red-500" />,
      message: "Tax evasion case hearing confirmed",
      time: "3 hours ago"
    },
    {
      icon: <MessageCircle className="text-blue-500" />,
      message: "New communication regarding environmental lawsuit",
      time: "Yesterday"
    },
    {
      icon: <AlertTriangle className="text-fuchsia-500" />,
      message: "Land acquisition documents missing",
      time: "6 hours ago"
    },
  ];

  const documents = [
    {
      title: "Property Dispute Case File",
      type: "Legal Document",
      date: "2024-06-10"
    },
    {
      title: "Contract Violation Evidence",
      type: "Case Evidence",
      date: "2024-06-12"
    },
    {
      title: "Civil Rights Case Brief",
      type: "Legal Brief",
      date: "2024-06-14"
    },
    {
      title: "Fraud Investigation Report",
      type: "Case Report",
      date: "2024-06-17"
    },
    {
      title: "Tax Evasion Evidence",
      type: "Case Evidence",
      date: "2024-06-19"
    },
    {
      title: "Environmental Lawsuit Complaint",
      type: "Legal Document",
      date: "2024-06-21"
    },
    {
      title: "Land Acquisition Agreement",
      type: "Legal Document",
      date: "2024-06-24"
    },
  ];

  const handleTabChange = (tab: 'cases' | 'documents' | 'notifications') => {
    setAnimateTab(true);
    setTimeout(() => {
      setActiveTab(tab);
      setAnimateTab(false);
    }, 150);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/50">
      <div className="container px-6 py-8 mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center">
            <div className="p-3 mr-4 rounded-full bg-primary/10">
              <Scale className="w-10 h-10 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-primary-dark">Judge Dashboard</h1>
              <p className="text-gray-500">Welcome back, Honorable Justice</p>
            </div>
          </div>
          <div className="flex gap-4 items-center">
            <div className="hidden relative md:block">
              <input
                type="text"
                placeholder="Search cases..."
                className="py-2 pr-4 pl-10 rounded-full border border-gray-200 bg-white/80 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
              />
              <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
            </div>
            <div className="relative">
              <button className="relative p-2 rounded-full transition-colors bg-secondary hover:bg-secondary/80">
                <Bell className="text-primary-dark" />
                <span className="flex absolute -top-1 -right-1 justify-center items-center w-4 h-4 text-xs text-white bg-red-500 rounded-full border-2 border-white">3</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex p-1 mb-8 rounded-full border border-gray-100 shadow-sm bg-secondary/50">
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
                    <Scale className="mr-2 text-primary" /> Upcoming Cases
                  </h2>
                  <button className="flex items-center text-sm font-medium text-primary hover:underline">
                    View All <ChevronRight className="ml-1 w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-4">
                  {cases.map((case_, index) => (
                    <CaseCard key={index} {...case_} onClick={() => console.log('Case clicked', case_.title)} />
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
                  <button className="flex items-center text-sm font-medium text-primary hover:underline">
                    View All <ChevronRight className="ml-1 w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-4">
                  {documents.map((doc, index) => (
                    <div
                      key={index}
                      className="p-4 bg-white rounded-lg border border-gray-100 shadow-sm transition-all cursor-pointer hover:shadow-md"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-semibold text-primary-dark">{doc.title}</h3>
                          <p className="text-sm text-gray-600">{doc.type}</p>
                        </div>
                        <span className="px-2 py-1 text-sm text-gray-500 bg-gray-100 rounded-full">{doc.date}</span>
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
                  <button className="flex items-center text-sm font-medium text-primary hover:underline">
                    Mark All as Read <CheckCircle className="ml-1 w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-4">
                  {notifications.map((notification, index) => (
                    <div
                      key={index}
                      className="flex items-center p-4 bg-white rounded-lg border border-gray-100 shadow-sm transition-all cursor-pointer hover:shadow-md"
                    >
                      <div className="p-2 mr-4 bg-gray-50 rounded-full">{notification.icon}</div>
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
            <div className="p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
              <h3 className="mb-4 text-lg font-semibold text-primary-dark">Upcoming Events</h3>
              <Calendar customEvents={events} />
            </div>

            {/* Quick Stats */}
            <div className="p-6 bg-white rounded-xl border border-gray-100 shadow-sm">
              <h3 className="mb-4 text-lg font-semibold text-primary-dark">Quick Stats</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 text-center rounded-lg border bg-primary/5 border-primary/10">
                  <h4 className="mb-1 text-sm text-gray-600">Pending Cases</h4>
                  <p className="text-2xl font-bold text-primary">12</p>
                </div>
                <div className="p-4 text-center bg-green-50 rounded-lg border border-green-100">
                  <h4 className="mb-1 text-sm text-gray-600">Resolved Cases</h4>
                  <p className="text-2xl font-bold text-green-600">38</p>
                </div>
                <div className="col-span-2 p-4 text-center bg-blue-50 rounded-lg border border-blue-100">
                  <h4 className="mb-1 text-sm text-gray-600">This Week's Hearings</h4>
                  <p className="text-2xl font-bold text-blue-600">7</p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="p-6 bg-white rounded-xl border border-gray-100 shadow-sm">
              <h3 className="mb-4 text-lg font-semibold text-primary-dark">Quick Actions</h3>
              <div className="space-y-2">
                <button className="flex items-center p-2 w-full text-left rounded-lg transition-colors hover:bg-primary/5">
                  <FileText className="mr-2 w-5 h-5 text-primary" />
                  <span>Schedule New Hearing</span>
                </button>
                <button className="flex items-center p-2 w-full text-left rounded-lg transition-colors hover:bg-primary/5">
                  <BookOpen className="mr-2 w-5 h-5 text-primary" />
                  <span>Review Case Documents</span>
                </button>
                <button className="flex items-center p-2 w-full text-left rounded-lg transition-colors hover:bg-primary/5">
                  <MessageCircle className="mr-2 w-5 h-5 text-primary" />
                  <span>Contact Court Clerk</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JudgeDashboard;