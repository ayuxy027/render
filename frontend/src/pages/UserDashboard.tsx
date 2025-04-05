import React, { useState, useEffect } from 'react';
import {
  User,
  Clock,
  FileText,
  Bell,
  CheckCircle,
  AlertTriangle,
  HelpCircle,
  MessageCircle,
  Search,
  ChevronRight,
  Download
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
      className={`
        border rounded-lg p-4 transition-all duration-300 
        hover:shadow-md ${priorityColors[priority]} ${onClick ? 'cursor-pointer' : ''}
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

const UserDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'cases' | 'resources' | 'notifications'>('cases');
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

  // Generate dynamic events based on cases
  useEffect(() => {
    const baseEvents = [
      { date: '2024-06-17', title: 'Divorce Mediation', type: 'meeting' as const, time: '9:30 AM', details: 'Attorney\'s Office, Room 202' },
      { date: '2024-06-22', title: 'Insurance Claim Hearing', type: 'hearing' as const, time: '11:00 AM', details: 'City Court, Room A' },
      { date: '2024-06-25', title: 'Will Execution Meeting', type: 'deadline' as const, time: '3:00 PM', details: 'Document submission deadline' },
      { date: '2024-06-30', title: 'Child Custody Mediation', type: 'meeting' as const, time: '10:15 AM', details: 'Family Court, Meeting Room 3' },
      { date: '2024-07-02', title: 'Medical Malpractice Consultation', type: 'meeting' as const, time: '1:30 PM', details: 'Attorney\'s office' },
      { date: '2024-07-05', title: 'Estate Planning Review', type: 'meeting' as const, time: '4:00 PM', details: 'Final document review' },
      { date: '2024-07-07', title: 'Property Lease Negotiation', type: 'hearing' as const, time: '2:45 PM', details: 'Commercial Court, Room B' },
    ];

    // Add some randomized events to make calendar look more dynamic
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    const randomEvents = [];
    const eventTypes = ['hearing', 'meeting', 'deadline', 'appointment'] as const;
    const eventTitles = [
      'Attorney Consultation', 'Document Review', 'Evidence Collection',
      'Witness Interview', 'Settlement Discussion', 'Legal Advisory',
      'Court Filing'
    ];

    // Generate random events for the current month
    for (let i = 0; i < 4; i++) {
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
        details: `Additional consultation`
      });
    }

    setEvents([...baseEvents, ...randomEvents]);
  }, []);

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

  const handleTabChange = (tab: 'cases' | 'resources' | 'notifications') => {
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
              <User className="w-10 h-10 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-primary-dark">Client Dashboard</h1>
              <p className="text-gray-500">Welcome back, Client Name</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
              <input
                type="text"
                placeholder="Search resources..."
                className="py-2 pl-10 pr-4 rounded-full border border-gray-200 bg-white/80 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
              />
              <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
            </div>
            <div className="relative">
              <button className="p-2 rounded-full bg-secondary hover:bg-secondary/80 transition-colors relative">
                <Bell className="text-primary-dark" />
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 border-2 border-white text-white text-xs flex items-center justify-center">2</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex p-1 mb-8 rounded-full bg-secondary/50 shadow-sm border border-gray-100">
          {[
            { id: 'cases', label: 'My Cases', icon: <FileText /> },
            { id: 'resources', label: 'Resources', icon: <HelpCircle /> },
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
          <div className={`space-y-6 md:col-span-2 transition-opacity duration-150 ${animateTab ? 'opacity-0' : 'opacity-100'}`}>
            {activeTab === 'cases' && (
              <>
                <div className="flex justify-between items-center">
                  <h2 className="flex items-center text-xl font-semibold text-primary-dark">
                    <FileText className="mr-2 text-primary" /> Active Cases
                  </h2>
                  <button className="text-primary text-sm font-medium flex items-center hover:underline">
                    View All <ChevronRight className="w-4 h-4 ml-1" />
                  </button>
                </div>
                <div className="space-y-4">
                  {cases.map((case_, index) => (
                    <CaseCard key={index} {...case_} onClick={() => console.log('Case clicked', case_.title)} />
                  ))}
                </div>
              </>
            )}

            {activeTab === 'resources' && (
              <>
                <div className="flex justify-between items-center">
                  <h2 className="flex items-center text-xl font-semibold text-primary-dark">
                    <HelpCircle className="mr-2 text-primary" /> Legal Resources
                  </h2>
                  <button className="text-primary text-sm font-medium flex items-center hover:underline">
                    Browse Categories <ChevronRight className="w-4 h-4 ml-1" />
                  </button>
                </div>
                <div className="space-y-4">
                  {resources.map((resource, index) => (
                    <div
                      key={index}
                      className="p-4 transition-all rounded-lg cursor-pointer bg-white border border-gray-100 shadow-sm hover:shadow-md"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-primary-dark">{resource.title}</h3>
                          <p className="text-sm text-gray-600">{resource.type}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{resource.date}</span>
                          <button className="p-1.5 text-primary bg-primary/10 rounded-full hover:bg-primary/20 transition-colors">
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
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
                    <Bell className="mr-2 text-primary" /> Recent Updates
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

          {/* Sidebar */}
          <div className="space-y-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <h3 className="text-lg font-semibold text-primary-dark mb-4">Your Schedule</h3>
              <Calendar customEvents={events} />
            </div>

            {/* Case Status */}
            <div className="p-6 rounded-xl bg-white shadow-sm border border-gray-100">
              <h3 className="mb-4 text-lg font-semibold text-primary-dark">Case Status</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 text-center bg-primary/5 border border-primary/10 rounded-lg">
                  <h4 className="text-sm text-gray-600 mb-1">Active Cases</h4>
                  <p className="text-2xl font-bold text-primary">3</p>
                </div>
                <div className="p-4 text-center bg-green-50 border border-green-100 rounded-lg">
                  <h4 className="text-sm text-gray-600 mb-1">Completed</h4>
                  <p className="text-2xl font-bold text-green-600">2</p>
                </div>
                <div className="col-span-2 p-4 text-center bg-blue-50 border border-blue-100 rounded-lg">
                  <h4 className="text-sm text-gray-600 mb-1">Next Hearing</h4>
                  <p className="text-lg font-bold text-blue-600">June 22, 2024</p>
                  <p className="text-xs text-gray-500">Insurance Claim Hearing</p>
                </div>
              </div>
            </div>

            {/* Contact Your Lawyer */}
            <div className="p-6 rounded-xl bg-white shadow-sm border border-gray-100">
              <h3 className="mb-4 text-lg font-semibold text-primary-dark">Contact Your Lawyer</h3>
              <div className="space-y-2">
                <button className="w-full p-2 text-left rounded-lg hover:bg-primary/5 transition-colors flex items-center">
                  <MessageCircle className="mr-2 w-5 h-5 text-primary" />
                  <span>Send Message</span>
                </button>
                <button className="w-full p-2 text-left rounded-lg hover:bg-primary/5 transition-colors flex items-center">
                  <FileText className="mr-2 w-5 h-5 text-primary" />
                  <span>Request Document</span>
                </button>
                <button className="w-full p-2 text-left rounded-lg hover:bg-primary/5 transition-colors flex items-center">
                  <Clock className="mr-2 w-5 h-5 text-primary" />
                  <span>Schedule Meeting</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;