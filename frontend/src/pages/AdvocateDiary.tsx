// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CalendarIcon, Clock, FileText, Bell, Maximize2, Minimize2, RotateCcw, Trash2, CheckCircle, Edit, Plus } from 'lucide-react';
import Calendar from '../components/Calender';
import { Case, Reminder } from '../types/types';
import { formatDate, combineEvents } from '../utils/utils';
import {
  fetchCases,
  fetchReminders,
  createCase as createCaseApi,
  updateCase as updateCaseApi,
  deleteCase as deleteCaseApi,
  createReminder as createReminderApi,
  updateReminder as updateReminderApi,
  deleteReminder as deleteReminderApi
} from '../data/data';

// Add these type definitions
type Tab = 'cases' | 'calendar' | 'reminders';
type Priority = 'high' | 'medium' | 'low';

const AdvocateDiary: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('cases');
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [selectedCase, setSelectedCase] = useState<string | null>(null);
  const [cases, setCases] = useState<Case[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [editingCase, setEditingCase] = useState<string | null>(null);
  const [editingReminder, setEditingReminder] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showCaseForm, setShowCaseForm] = useState<boolean>(false);

  // Fetch data from Supabase on component mount
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const casesData = await fetchCases();
        const remindersData = await fetchReminders();
        setCases(casesData);
        setReminders(remindersData);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const handleCaseClick = useCallback((caseId: string) => {
    setSelectedCase(prevSelected => prevSelected === caseId ? null : caseId);
  }, []);

  const createCase = useCallback(async (newCase: Omit<Case, 'id'>) => {
    try {
      const createdCase = await createCaseApi(newCase);
      if (createdCase) {
        setCases(prevCases => [...prevCases, createdCase]);
        setShowCaseForm(false);
      }
    } catch (error) {
      console.error('Error creating case:', error);
    }
  }, []);

  const updateCase = useCallback(async (updatedCase: Case) => {
    try {
      const success = await updateCaseApi(updatedCase);
      if (success) {
        setCases(prevCases => prevCases.map(case_ =>
          case_.id === updatedCase.id ? updatedCase : case_
        ));
      }
      setEditingCase(null);
    } catch (error) {
      console.error('Error updating case:', error);
    }
  }, []);

  const deleteCase = useCallback(async (id: string) => {
    try {
      const success = await deleteCaseApi(id);
      if (success) {
        setCases(prevCases => prevCases.filter(case_ => case_.id !== id));
      }
    } catch (error) {
      console.error('Error deleting case:', error);
    }
  }, []);

  const toggleCaseStatus = useCallback(async (id: string) => {
    const caseToUpdate = cases.find(case_ => case_.id === id);
    if (caseToUpdate) {
      const updatedCase = {
        ...caseToUpdate,
        status: caseToUpdate.status === 'completed' ? 'upcoming' : 'completed' as 'upcoming' | 'completed' | 'pending'
      };
      await updateCase(updatedCase);
    }
  }, [cases, updateCase]);

  const createReminder = useCallback(async (newReminder: Omit<Reminder, 'id'>) => {
    try {
      const createdReminder = await createReminderApi(newReminder);
      if (createdReminder) {
        setReminders(prevReminders => [...prevReminders, createdReminder]);
      }
    } catch (error) {
      console.error('Error creating reminder:', error);
    }
  }, []);

  const updateReminder = useCallback(async (updatedReminder: Reminder) => {
    try {
      const success = await updateReminderApi(updatedReminder);
      if (success) {
        setReminders(prevReminders => prevReminders.map(reminder =>
          reminder.id === updatedReminder.id ? updatedReminder : reminder
        ));
      }
      setEditingReminder(null);
    } catch (error) {
      console.error('Error updating reminder:', error);
    }
  }, []);

  const deleteReminder = useCallback(async (id: string) => {
    try {
      const success = await deleteReminderApi(id);
      if (success) {
        setReminders(prevReminders => prevReminders.filter(reminder => reminder.id !== id));
      }
    } catch (error) {
      console.error('Error deleting reminder:', error);
    }
  }, []);

  const combinedEvents = useMemo(() =>
    combineEvents(cases, reminders),
    [cases, reminders]
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex justify-center items-center p-4 min-h-screen bg-gradient-to-b from-background to-secondary/10"
    >
      <motion.div
        layout
        className={`bg-white rounded-xl shadow-2xl overflow-hidden transition-all duration-300 ease-in-out 
          ${isExpanded ? 'w-full h-full' : 'w-[90%] h-[85vh]'}`}
      >
        {/* Header */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex justify-between items-center p-4 bg-gray-50 border-b border-gray-200"
        >
          <h2 className="flex items-center space-x-2 text-2xl font-bold text-primary">
            <FileText className="w-6 h-6 text-primary" />
            <span>Advocate Diary</span>
          </h2>
          <div className="flex space-x-2">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 rounded-full transition-colors duration-200 hover:bg-gray-100"
            >
              {isExpanded ?
                <Minimize2 className="w-5 h-5 text-gray-600" /> :
                <Maximize2 className="w-5 h-5 text-gray-600" />
              }
            </motion.button>
            <motion.button
              whileHover={{ rotate: 180 }}
              transition={{ duration: 0.3 }}
              className="p-2 rounded-full transition-colors duration-200 hover:bg-gray-100"
              onClick={() => window.location.reload()}
            >
              <RotateCcw className="w-5 h-5 text-gray-600" />
            </motion.button>
          </div>
        </motion.div>

        <div className="flex flex-col h-[calc(100%-4rem)]">
          {/* Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex px-4 pt-4 space-x-8 border-b"
          >
            {[
              { id: 'cases', label: 'Cases', icon: FileText },
              { id: 'calendar', label: 'Calendar', icon: CalendarIcon },
              { id: 'reminders', label: 'Reminders', icon: Bell }
            ].map((tab) => (
              <motion.button
                key={tab.id}
                whileHover={{ y: -2 }}
                onClick={() => setActiveTab(tab.id as Tab)}
                className={`flex items-center px-4 py-3 space-x-2 border-b-2 transition-colors ${activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
              >
                <tab.icon className="w-5 h-5" />
                <span className="font-medium">{tab.label}</span>
              </motion.button>
            ))}
          </motion.div>

          {/* Main Content */}
          <div className="overflow-y-auto flex-1">
            {isLoading ? (
              <div className="flex justify-center items-center h-full">
                <div className="w-12 h-12 rounded-full border-4 animate-spin border-primary border-t-transparent"></div>
              </div>
            ) : (
              <div className="grid gap-6 p-6 md:grid-cols-3">
                {/* Cases List */}
                {activeTab === 'cases' && (
                  <div className="md:col-span-2">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold text-gray-700">Manage Your Cases</h3>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowCaseForm(!showCaseForm)}
                        className="flex items-center p-2 text-sm text-primary bg-primary/10 rounded-lg hover:bg-primary/20"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        <span>Add Case</span>
                      </motion.button>
                    </div>

                    <AnimatePresence>
                      {showCaseForm && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mb-6 p-4 border border-primary/20 rounded-lg bg-primary/5"
                        >
                          <CaseForm
                            onSubmit={createCase}
                            onCancel={() => setShowCaseForm(false)}
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="space-y-4">
                      <AnimatePresence>
                        {cases.length === 0 ? (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="p-8 text-center rounded-lg border border-dashed border-gray-300"
                          >
                            <p className="text-gray-500">No cases found. Add your first case to get started.</p>
                          </motion.div>
                        ) : (
                          cases.map((case_) => (
                            <motion.div
                              key={case_.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -20 }}
                              className="p-4 rounded-lg border shadow-sm transition-all duration-200 hover:shadow-md"
                              onClick={() => handleCaseClick(case_.id)}
                            >
                              {editingCase === case_.id ? (
                                <CaseForm
                                  initialData={case_}
                                  onSubmit={(updatedCase) => updateCase({ ...updatedCase, id: case_.id })}
                                  onCancel={() => setEditingCase(null)}
                                />
                              ) : (
                                <CaseItem
                                  case_={case_ as Case}
                                  isSelected={selectedCase === case_.id}
                                  onToggleStatus={toggleCaseStatus}
                                  onEdit={() => setEditingCase(case_.id)}
                                  onDelete={deleteCase}
                                />
                              )}
                            </motion.div>
                          ))
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                )}

                {/* Calendar Tab */}
                {activeTab === 'calendar' && (
                  <div className="md:col-span-2">
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold text-gray-700">Your Schedule</h3>
                      <p className="text-sm text-gray-500">View all your hearings and reminders in one place</p>
                    </div>
                    <Calendar
                      customEvents={combinedEvents}
                    />
                    {!isLoading && combinedEvents.length === 0 && (
                      <div className="mt-4 p-4 text-center rounded-lg border border-dashed border-gray-300">
                        <p className="text-gray-500">No events scheduled. Add cases or reminders to see them in your calendar.</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Reminders Panel */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  {activeTab === 'reminders' && (
                    <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
                      <h2 className="mb-4 text-lg font-semibold text-primary">Add Reminder</h2>
                      <ReminderForm onSubmit={createReminder} />
                    </div>
                  )}

                  {/* Upcoming Reminders */}
                  <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
                    <h2 className="mb-4 text-lg font-semibold text-primary">Upcoming Reminders</h2>
                    <AnimatePresence>
                      {reminders.length === 0 ? (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="p-4 text-center rounded-lg border border-dashed border-gray-300"
                        >
                          <p className="text-gray-500">No reminders found.</p>
                        </motion.div>
                      ) : (
                        reminders.map((reminder) => (
                          <motion.div
                            key={reminder.id}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="mb-3"
                          >
                            {editingReminder === reminder.id ? (
                              <ReminderForm
                                initialData={reminder}
                                onSubmit={(updatedReminder) => updateReminder({ ...updatedReminder, id: reminder.id })}
                                onCancel={() => setEditingReminder(null)}
                              />
                            ) : (
                              <ReminderItem
                                reminder={reminder}
                                onEdit={() => setEditingReminder(reminder.id)}
                                onDelete={deleteReminder}
                              />
                            )}
                          </motion.div>
                        ))
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Update CaseForm component
interface CaseFormProps {
  initialData?: Omit<Case, 'id'>;
  onSubmit: (caseData: Omit<Case, 'id'>) => void;
  onCancel?: () => void;
}

const CaseForm: React.FC<CaseFormProps> = ({ initialData, onSubmit, onCancel }) => {
  const [title, setTitle] = useState(initialData?.title || '');
  const [court, setCourt] = useState(initialData?.court || '');
  const [nextHearing, setNextHearing] = useState(initialData?.nextHearing || '');
  const [notes, setNotes] = useState(initialData?.notes || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      title,
      court,
      nextHearing,
      notes,
      status: initialData?.status || 'upcoming',
      documents: initialData?.documents || []
    });
    if (!initialData) {
      setTitle('');
      setCourt('');
      setNextHearing('');
      setNotes('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Case Title"
        className="px-3 py-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
        required
      />
      <input
        type="text"
        value={court}
        onChange={(e) => setCourt(e.target.value)}
        placeholder="Court"
        className="px-3 py-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
        required
      />
      <input
        type="date"
        value={nextHearing}
        onChange={(e) => setNextHearing(e.target.value)}
        className="px-3 py-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
        required
      />
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Case Notes"
        className="px-3 py-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
        rows={3}
      />
      <div className="flex justify-end space-x-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 rounded-md border transition-colors duration-300 hover:bg-gray-100"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          className="px-4 py-2 text-white rounded-md transition-colors duration-300 bg-primary hover:bg-primary-dark"
        >
          {initialData ? 'Update' : 'Add'} Case
        </button>
      </div>
    </form>
  );
};

// Update CaseItem component
interface CaseItemProps {
  case_: Case;
  isSelected: boolean;
  onToggleStatus: (id: string) => void;
  onEdit: () => void;
  onDelete: (id: string) => void;
}

const CaseItem: React.FC<CaseItemProps> = ({ case_, isSelected, onToggleStatus, onEdit, onDelete }) => {
  return (
    <>
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-medium text-primary">{case_.title}</h3>
          <p className="text-sm text-gray-600">{case_.court}</p>
        </div>
        <div className="flex space-x-2">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="p-1 rounded-full hover:bg-gray-100"
            onClick={(e) => {
              e.stopPropagation();
              onToggleStatus(case_.id);
            }}
          >
            <CheckCircle className={`w-5 h-5 ${case_.status === 'completed' ? 'text-green-500' : 'text-gray-400'}`} />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="p-1 rounded-full hover:bg-gray-100"
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
          >
            <Edit className="w-5 h-5 text-blue-500" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="p-1 rounded-full hover:bg-gray-100"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(case_.id);
            }}
          >
            <Trash2 className="w-5 h-5 text-red-500" />
          </motion.button>
        </div>
      </div>

      <div className="flex items-center mt-4 space-x-4">
        <div className={`px-2 py-1 text-xs font-medium rounded-full ${case_.status === 'upcoming' ? 'bg-primary/10 text-primary' :
          case_.status === 'completed' ? 'bg-green-100 text-green-800' :
            'bg-yellow-100 text-yellow-800'
          }`}>
          {case_.status.charAt(0).toUpperCase() + case_.status.slice(1)}
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <Clock className="mr-1 w-4 h-4" />
          Next Hearing: {formatDate(case_.nextHearing)}
        </div>
      </div>

      <AnimatePresence>
        {isSelected && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mt-4"
          >
            <p className="mb-2 text-sm font-medium text-gray-700">Documents:</p>
            <div className="flex flex-wrap gap-2">
              {case_.documents.map((doc, index) => (
                <motion.span
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center px-2 py-1 text-xs rounded-full text-primary bg-primary/10"
                >
                  <FileText className="mr-1 w-3 h-3" />
                  {doc}
                </motion.span>
              ))}
            </div>
            {case_.notes && (
              <div className="mt-4">
                <p className="mb-2 text-sm font-medium text-gray-700">Notes:</p>
                <p className="text-sm text-gray-600">{case_.notes}</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

// Update ReminderForm component
interface ReminderFormProps {
  initialData?: Omit<Reminder, 'id'>;
  onSubmit: (reminderData: Omit<Reminder, 'id'>) => void;
  onCancel?: () => void;
}

const ReminderForm: React.FC<ReminderFormProps> = ({ initialData, onSubmit, onCancel }) => {
  const [title, setTitle] = useState(initialData?.title || '');
  const [date, setDate] = useState(initialData?.date || '');
  const [time, setTime] = useState(initialData?.time || '');
  const [priority, setPriority] = useState<Priority>(initialData?.priority || 'medium');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ title, date, time, priority });
    if (!initialData) {
      setTitle('');
      setDate('');
      setTime('');
      setPriority('medium');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Reminder Title"
        className="px-3 py-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
        required
      />
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="px-3 py-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
        required
      />
      <input
        type="time"
        value={time}
        onChange={(e) => setTime(e.target.value)}
        className="px-3 py-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
        required
      />
      <select
        value={priority}
        onChange={(e) => setPriority(e.target.value as Priority)}
        className="px-3 py-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
      >
        <option value="high">High</option>
        <option value="medium">Medium</option>
        <option value="low">Low</option>
      </select>
      <div className="flex justify-end space-x-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 rounded-md border transition-colors duration-300 hover:bg-gray-100"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          className="px-4 py-2 text-white rounded-md transition-colors duration-300 bg-primary hover:bg-primary-dark"
        >
          {initialData ? 'Update' : 'Add'} Reminder
        </button>
      </div>
    </form>
  );
};

// Update ReminderItem component
interface ReminderItemProps {
  reminder: Reminder;
  onEdit: () => void;
  onDelete: (id: string) => void;
}

const ReminderItem: React.FC<ReminderItemProps> = ({ reminder, onEdit, onDelete }) => {
  const priorityColors = {
    high: 'bg-primary/10 text-primary',
    medium: 'bg-yellow-100 text-yellow-800',
    low: 'bg-green-100 text-green-800'
  };

  return (
    <div className="flex justify-between items-center p-3 rounded-lg border transition-colors hover:bg-gray-50">
      <div>
        <h3 className="font-medium text-primary">{reminder.title}</h3>
        <div className="flex items-center mt-1 space-x-2 text-sm text-gray-600">
          <Clock className="w-4 h-4" />
          <span>{formatDate(reminder.date)} at {reminder.time}</span>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <div className={`px-2 py-1 text-xs font-medium rounded-full ${priorityColors[reminder.priority]
          }`}>
          {reminder.priority.charAt(0).toUpperCase() + reminder.priority.slice(1)}
        </div>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={onEdit}
          className="text-blue-500 transition-colors duration-300 hover:text-blue-700"
        >
          <Edit className="w-5 h-5" />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onDelete(reminder.id)}
          className="text-red-500 transition-colors duration-300 hover:text-red-700"
        >
          <Trash2 className="w-5 h-5" />
        </motion.button>
      </div>
    </div>
  );
};

export default AdvocateDiary;

