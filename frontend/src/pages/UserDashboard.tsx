import React, { useState } from 'react';
import { 
  User,
  Clock, 
  FileText, 
  Bell, 
  CheckCircle, 
  AlertTriangle, 
  HelpCircle,
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
    <div className={`
      border rounded-lg p-4 transition-all duration-300 
      hover:shadow-md ${priorityColors[priority]}
    `}>
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

const UserDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'cases' | 'resources' | 'notifications'>('cases');

  const cases = [
    {
      title: 'Divorce Proceedings',
      description: 'Ongoing divorce case with property settlement.',
      priority: 'High' as const,
      date: '2024-06-17',
    },
    {
      title: 'Insurance Claim Dispute',
      description: 'Challenging a denied insurance claim for property damage.',
      priority: 'Medium' as const,
      date: '2024-06-22',
    },
    {
      title: 'Will Execution',
      description: 'Assistance with executing a family member\'s will.',
      priority: 'Low' as const,
      date: '2024-06-25',
    },
    {
      title: 'Child Custody Dispute',
      description: 'Representing a client in a child custody battle.',
      priority: 'High' as const,
      date: '2024-06-30',
    },
    {
      title: 'Medical Malpractice Claim',
      description: 'Challenging a medical malpractice claim on behalf of a doctor.',
      priority: 'Medium' as const,
      date: '2024-07-02',
    },
    {
      title: 'Estate Planning Consultation',
      description: 'Consultation on creating a comprehensive estate plan.',
      priority: 'Low' as const,
      date: '2024-07-05',
    },
    {
      title: 'Property Lease Dispute',
      description: 'Resolving a commercial property lease disagreement.',
      priority: 'Medium' as const,
      date: '2024-07-07',
    },
  ];
  
  const events = [
    { date: '2024-06-17', title: 'Divorce Mediation', type: 'meeting' },
    { date: '2024-06-22', title: 'Insurance Claim Hearing', type: 'hearing' },
    { date: '2024-06-25', title: 'Will Execution Meeting', type: 'deadline' },
    { date: '2024-06-30', title: 'Child Custody Mediation', type: 'meeting' },
    { date: '2024-07-02', title: 'Medical Malpractice Consultation', type: 'meeting' },
    { date: '2024-07-05', title: 'Estate Planning Review', type: 'meeting' },
    { date: '2024-07-07', title: 'Property Lease Negotiation', type: 'hearing' },
  ];
  
  const notifications = [
    { 
      icon: <AlertTriangle className="text-yellow-500" />, 
      message: "Document submission required for divorce case",
      time: "30 minutes ago"
    },
    { 
      icon: <CheckCircle className="text-green-500" />, 
      message: "Insurance claim hearing scheduled",
      time: "2 hours ago"
    },
    { 
      icon: <MessageCircle className="text-blue-500" />, 
      message: "New message from your lawyer",
      time: "Yesterday"
    },
    { 
      icon: <AlertTriangle className="text-yellow-500" />, 
      message: "Child custody case documents missing",
      time: "1 hour ago"
    },
    { 
      icon: <CheckCircle className="text-green-500" />, 
      message: "Medical malpractice case hearing confirmed",
      time: "3 hours ago"
    },
    { 
      icon: <MessageCircle className="text-blue-500" />, 
      message: "Estate planning documents updated",
      time: "Yesterday"
    },
    { 
      icon: <AlertTriangle className="text-yellow-500" />, 
      message: "Lease agreement review needed for property dispute",
      time: "6 hours ago"
    },
  ];
  
  const resources = [
    { 
      title: "Understanding Divorce Laws", 
      type: "Legal Guide", 
      date: "2024-06-10" 
    },
    { 
      title: "Insurance Claims Handbook", 
      type: "Document", 
      date: "2024-06-12" 
    },
    { 
      title: "Will Execution Process", 
      type: "Tutorial", 
      date: "2024-06-14" 
    },
    { 
      title: "Child Custody Law Overview", 
      type: "Legal Guide", 
      date: "2024-06-16" 
    },
    { 
      title: "Medical Malpractice Lawsuit Process", 
      type: "Document", 
      date: "2024-06-18" 
    },
    { 
      title: "Estate Planning Basics", 
      type: "Tutorial", 
      date: "2024-06-20" 
    },
    { 
      title: "Property Lease Agreement Guide", 
      type: "Legal Guide", 
      date: "2024-06-23" 
    },
  ];  

  return (
    <div className="min-h-screen p-6 bg-background">
      <div className="container mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <User className="w-10 h-10 mr-4 text-primary" />
            <h1 className="text-3xl font-bold text-primary-dark">Client Dashboard</h1>
          </div>
          <div className="p-2 rounded-full bg-secondary">
            <Bell className="text-primary-dark" />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex p-1 mb-6 rounded-full bg-secondary/50">
          {[
            { id: 'cases', label: 'My Cases', icon: <FileText /> },
            { id: 'resources', label: 'Resources', icon: <HelpCircle /> },
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
          <div className="space-y-6 md:col-span-2">
            {activeTab === 'cases' && (
              <>
                <h2 className="flex items-center text-xl font-semibold text-primary-dark">
                  <FileText className="mr-2 text-primary" /> Active Cases
                </h2>
                <div className="space-y-4">
                  {cases.map((case_, index) => (
                    <CaseCard key={index} {...case_} />
                  ))}
                </div>
              </>
            )}

            {activeTab === 'resources' && (
              <>
                <h2 className="flex items-center text-xl font-semibold text-primary-dark">
                  <HelpCircle className="mr-2 text-primary" /> Legal Resources
                </h2>
                <div className="space-y-4">
                  {resources.map((resource, index) => (
                    <div 
                      key={index} 
                      className="p-4 transition-colors rounded-lg cursor-pointer bg-secondary/50 hover:bg-secondary"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-primary-dark">{resource.title}</h3>
                          <p className="text-sm text-gray-600">{resource.type}</p>
                        </div>
                        <span className="text-sm text-gray-500">{resource.date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {activeTab === 'notifications' && (
              <>
                <h2 className="flex items-center text-xl font-semibold text-primary-dark">
                  <Bell className="mr-2 text-primary" /> Recent Updates
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

          {/* Sidebar */}
          <div>
          <Calendar customEvents={events.map(event => ({
              ...event,
              type: event.type as 'hearing' | 'meeting' | 'deadline' | 'appointment'
            }))} />
            
            {/* Case Status */}
            <div className="p-4 mt-6 rounded-lg bg-secondary/50">
              <h3 className="mb-4 text-lg font-semibold text-primary-dark">Case Status</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 text-center bg-white rounded-lg">
                  <h4 className="text-sm text-gray-500">Active Cases</h4>
                  <p className="text-2xl font-bold text-primary-dark">3</p>
                </div>
                <div className="p-3 text-center bg-white rounded-lg">
                  <h4 className="text-sm text-gray-500">Completed</h4>
                  <p className="text-2xl font-bold text-primary-dark">2</p>
                </div>
                <div className="col-span-2 p-3 text-center bg-white rounded-lg">
                  <h4 className="text-sm text-gray-500">Next Hearing</h4>
                  <p className="text-lg font-bold text-primary-dark">June 22, 2024</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;