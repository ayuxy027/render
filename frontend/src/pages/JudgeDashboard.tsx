import React, { useState } from 'react';
import { 
  Scale, 
  Clock, 
  FileText, 
  BookOpen, 
  Bell, 
  CheckCircle, 
  AlertTriangle, 
  Briefcase,
  MessageCircle
} from 'lucide-react';
import Calendar from '../components/Calender';

interface CaseCardProps {
  title: string;
  description: string;
  priority: 'Low' | 'Medium' | 'High';
  date: string;
}

const CaseCard: React.FC<CaseCardProps> = ({ title, description, priority, date }) => {
  const priorityColors = {
    Low: 'bg-green-50 border-green-200',
    Medium: 'bg-yellow-50 border-yellow-200',
    High: 'bg-red-50 border-red-200'
  };

  return (
    <div className={`p-4 rounded-lg border transition-all duration-300 hover:shadow-md ${priorityColors[priority]}`}>
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
  
  const events = [
    { date: '2024-06-15', title: 'Property Dispute Hearing', type: 'hearing' },
    { date: '2024-06-18', title: 'Contract Violation Case', type: 'meeting' },
    { date: '2024-06-20', title: 'Civil Rights Case Review', type: 'deadline' },
    { date: '2024-06-23', title: 'Fraud Investigation Consultation', type: 'meeting' },
    { date: '2024-06-26', title: 'Tax Evasion Case Review', type: 'deadline' },
    { date: '2024-06-29', title: 'Environmental Lawsuit Strategy', type: 'meeting' },
    { date: '2024-07-01', title: 'Land Acquisition Hearing', type: 'hearing' },
  ];
  
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
  return (
    <div className="p-6 min-h-screen bg-background">
      <div className="container mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center">
            <Scale className="mr-4 w-10 h-10 text-primary" />
            <h1 className="text-3xl font-bold text-primary-dark">Judge Dashboard</h1>
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
                  <Scale className="mr-2 text-primary" /> Upcoming Cases
                </h2>
                <div className="space-y-4">
                  {cases.map((case_, index) => (
                    <CaseCard key={index} {...case_} />
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
                      className="p-4 rounded-lg transition-colors bg-secondary/50 hover:bg-secondary"
                    >
                      <div className="flex justify-between items-center">
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
                      className="flex items-center p-4 rounded-lg transition-colors bg-secondary/50 hover:bg-secondary"
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
              <h3 className="mb-4 text-lg font-semibold text-primary-dark">Quick Stats</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 text-center bg-white rounded-lg">
                  <h4 className="text-sm text-gray-500">Pending Cases</h4>
                  <p className="text-2xl font-bold text-primary-dark">12</p>
                </div>
                <div className="p-3 text-center bg-white rounded-lg">
                  <h4 className="text-sm text-gray-500">Resolved Cases</h4>
                  <p className="text-2xl font-bold text-primary-dark">38</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JudgeDashboard;