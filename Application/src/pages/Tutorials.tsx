import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Book, PlayCircle, CheckCircle, Lock, Clock, Target, Award, ExternalLink } from 'lucide-react';

interface Quest {
  id: string;
  title: string;
  description: string;
  category: 'tdm' | 'flyway' | 'database';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: string;
  steps: QuestStep[];
  completed: boolean;
  unlocked: boolean;
  reward?: string;
}

interface QuestStep {
  id: string;
  title: string;
  description: string;
  action?: string;
  internalLink?: string; // For links to pages within the app
  completed: boolean;
}

const mockQuests: Quest[] = [
  {
    id: 'tdm-intro',
    title: 'Test Data Manager - Subsetting & Anonymization',
    description: 'Learn to safely subset and anonymize production data for non-production environments using Test Data Manager.',
    category: 'tdm',
    difficulty: 'beginner',
    estimatedTime: '15 min',
    completed: false,
    unlocked: true,
    reward: 'TDM Master Badge',
    steps: [
      {
        id: 'step-1',
        title: 'Verify Production Data',
        description: 'Connect to your production database and verify it contains customer data. Note the record counts.',
        action: 'Go to Customers',
        internalLink: '/customers',
        completed: false
      },
      {
        id: 'step-2', 
        title: 'Verify Non-Prod Environment is Empty',
        description: 'Switch to your non-production connection and confirm it contains no data (or outdated data).',
        action: 'Check Settings',
        internalLink: '/settings',
        completed: false
      },
      {
        id: 'step-3',
        title: 'Run Test Data Manager Subsetting & Anonymization',
        description: 'Use the Test Data Manager GUI to subset and anonymize your production data into the non-production environment. Exit this webapp and use Test Data Manager to perform subsetting and anonymization. Return when complete.',
        completed: false
      },
      {
        id: 'step-4',
        title: 'Validate Anonymized Data',
        description: 'Verify that your non-production environment now contains anonymized data that\'s different from production. Non-prod should have data with anonymized names, emails, and addresses while preserving data relationships.',
        action: 'Verify Results',
        internalLink: '/customers',
        completed: false
      }
    ]
  },
  {
    id: 'flyway-migration',
    title: 'Flyway - Fix Missing Offers Table',
    description: 'Learn database version control and automated deployment by fixing a missing table issue. Master the complete Flyway workflow from development to production.',
    category: 'flyway',
    difficulty: 'intermediate',
    estimatedTime: '25 min',
    completed: false,
    unlocked: true,
    reward: 'Migration Master Badge',
    steps: [
      {
        id: 'step-1',
        title: 'Discover the Problem',
        description: 'Navigate to the Offers tab in the application. Verify that the table does not exist and note any error messages displayed.',
        action: 'Check Offers',
        internalLink: '/offers',
        completed: false
      },
      {
        id: 'step-2',
        title: 'Create the Missing Table',
        description: 'Using your preferred IDE (e.g., SSMS, Azure Data Studio), connect to the database and create the Offers table. Include appropriate columns and insert at least one row of sample data to test functionality.',
        completed: false
      },
      {
        id: 'step-3',
        title: 'Test the Fix',
        description: 'Using the Non-Production connection, refresh the application and navigate to the Offers tab. Verify that the table now displays correctly with your sample data.',
        action: 'Test Offers',
        internalLink: '/offers',
        completed: false
      },
      {
        id: 'step-4',
        title: 'Capture Changes with Flyway Desktop',
        description: 'Open Flyway Desktop and use it to capture the schema changes you made. Generate the appropriate migration script and commit it to version control for automated deployment.',
        completed: false
      },
      {
        id: 'step-5',
        title: 'Deploy Changes to Production',
        description: 'Choose your deployment path: Standard Path - Use Flyway Desktop to directly deploy the migration to Production. Advanced Path - Within Version Control, create a Pull Request to merge changes to the release branch, then monitor the automated pipeline deployment.',
        completed: false
      },
      {
        id: 'step-6',
        title: 'Validate Production Deployment',
        description: 'Switch to the Production connection and navigate to the Offers tab. Confirm that the table functions correctly and displays the expected structure and data in the live environment.',
        action: 'Validate Production',
        internalLink: '/offers',
        completed: false
      }
    ]
  },
  {
    id: 'customer-management',
    title: 'Customer Data Management',
    description: 'Master customer data operations including searching, viewing, and editing customer records.',
    category: 'database',
    difficulty: 'beginner',
    estimatedTime: '10 min',
    completed: false,
    unlocked: true,
    steps: [
      {
        id: 'step-1',
        title: 'Navigate to Customers',
        description: 'Go to the Customers tab to view all customer records.',
        action: 'Go to Customers',
        internalLink: '/customers',
        completed: false
      },
      {
        id: 'step-2',
        title: 'Search for Customers',
        description: 'Use the search functionality to find specific customers.',
        completed: false
      },
      {
        id: 'step-3',
        title: 'View Customer Details',
        description: 'Click on a customer record to view their detailed information.',
        completed: false
      }
    ]
  },
  {
    id: 'invoice-reporting',
    title: 'Advanced Invoice Reporting',
    description: 'Master complex cross-table reporting and data analysis techniques.',
    category: 'database',
    difficulty: 'intermediate',
    estimatedTime: '20 min',
    completed: false,
    unlocked: true,
    steps: [
      {
        id: 'step-1',
        title: 'Explore Invoice Data',
        description: 'Navigate to the Invoices tab and explore the available invoice records.',
        action: 'View Invoices',
        internalLink: '/invoices',
        completed: false
      },
      {
        id: 'step-2',
        title: 'Generate Detailed Report',
        description: 'Use the Reports functionality to generate a detailed cross-table report for an invoice.',
        action: 'Create Report',
        internalLink: '/reports',
        completed: false
      },
      {
        id: 'step-3',
        title: 'Analyze Customer Purchases',
        description: 'Review the comprehensive report showing customer details, billing information, and track purchases.',
        completed: false
      }
    ]
  },
  {
    id: 'advanced-querying',
    title: 'Advanced SQL Querying',
    description: 'Master complex SQL queries and reporting techniques.',
    category: 'database',
    difficulty: 'advanced',
    estimatedTime: '30 min',
    completed: false,
    unlocked: false,
    steps: [
      {
        id: 'step-1',
        title: 'Complex Joins',
        description: 'Learn to write complex multi-table JOIN queries.',
        completed: false
      },
      {
        id: 'step-2',
        title: 'Subqueries and CTEs',
        description: 'Master subqueries and Common Table Expressions.',
        completed: false
      },
      {
        id: 'step-3',
        title: 'Performance Optimization',
        description: 'Optimize your queries for better performance.',
        completed: false
      }
    ]
  }
];

const Tutorials: React.FC = () => {
  const navigate = useNavigate();
  const [selectedQuest, setSelectedQuest] = useState<Quest | null>(null);
  const [quests, setQuests] = useState<Quest[]>(mockQuests);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [justReset, setJustReset] = useState(false);
  const [lastActiveQuest, setLastActiveQuest] = useState<string | null>(
    localStorage.getItem('lastActiveQuest')
  );

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'tdm': return <Target className="w-5 h-5" />;
      case 'flyway': return <Book className="w-5 h-5" />;
      case 'database': return <GraduationCap className="w-5 h-5" />;
      default: return <Book className="w-5 h-5" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-600 bg-green-100';
      case 'intermediate': return 'text-yellow-600 bg-yellow-100';
      case 'advanced': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const resumeActiveQuest = () => {
    if (lastActiveQuest) {
      const quest = quests.find(q => q.id === lastActiveQuest);
      if (quest && !quest.completed) {
        startQuest(quest);
      } else {
        // Quest no longer exists or is completed, clear it
        setLastActiveQuest(null);
        localStorage.removeItem('lastActiveQuest');
      }
    }
  };

  const dismissActiveQuest = () => {
    setLastActiveQuest(null);
    localStorage.removeItem('lastActiveQuest');
  };

  // Get the current active quest details
  const activeQuest = lastActiveQuest ? quests.find(q => q.id === lastActiveQuest) : null;
  const shouldShowResumePrompt = activeQuest && !activeQuest.completed && !selectedQuest;

  const filteredQuests = selectedCategory === 'all' 
    ? quests 
    : quests.filter(quest => quest.category === selectedCategory);

  const completedCount = quests.filter(q => q.completed).length;
  const totalCount = quests.length;
  const progressPercentage = (completedCount / totalCount) * 100;

  const handleStepAction = (step: QuestStep) => {
    if (step.internalLink) {
      navigate(step.internalLink);
    }
  };

  const handleQuestAction = (questId: string, action: string) => {
    switch (action) {
      case 'Go to Connections':
        navigate('/connections');
        break;
      case 'Go to Customers':
        navigate('/customers');
        break;
      case 'Check Offers':
      case 'Test Offers':
      case 'Validate Production':
        navigate('/offers');
        break;
      case 'Check Settings':
        navigate('/settings');
        break;
      case 'View Invoices':
        navigate('/invoices');
        break;
      case 'Create Report':
        navigate('/reports');
        break;
      default:
        console.log(`Action: ${action} for quest: ${questId}`);
    }
  };

  const startQuest = (quest: Quest) => {
    if (!quest.unlocked) return;
    
    // If there's already an active quest and it's different, update to the new one
    if (lastActiveQuest && lastActiveQuest !== quest.id) {
      const previousQuest = quests.find(q => q.id === lastActiveQuest);
      if (previousQuest && !previousQuest.completed) {
        // User is switching quests - update the active quest
        setLastActiveQuest(quest.id);
        localStorage.setItem('lastActiveQuest', quest.id);
      }
    }
    
    setSelectedQuest(quest);
    
    // Track the active quest in localStorage
    if (!quest.completed) {
      setLastActiveQuest(quest.id);
      localStorage.setItem('lastActiveQuest', quest.id);
    }
  };

  const completeStep = (questId: string, stepId: string) => {
    setQuests(prevQuests => {
      const updatedQuests = prevQuests.map(quest => {
        if (quest.id === questId) {
          const updatedSteps = quest.steps.map(step => 
            step.id === stepId ? { ...step, completed: true } : step
          );
          const allStepsCompleted = updatedSteps.every(step => step.completed);
          const updatedQuest = {
            ...quest,
            steps: updatedSteps,
            completed: allStepsCompleted
          };
          
          // Clear active quest if completed
          if (allStepsCompleted) {
            setLastActiveQuest(null);
            localStorage.removeItem('lastActiveQuest');
          }
          
          // Update selectedQuest if it matches the current quest
          if (selectedQuest && selectedQuest.id === questId) {
            setSelectedQuest(updatedQuest);
          }
          
          return updatedQuest;
        }
        return quest;
      });
      return updatedQuests;
    });
  };

  const resetQuestProgress = (questId: string) => {
    setQuests(prevQuests => {
      const updatedQuests = prevQuests.map(quest => {
        if (quest.id === questId) {
          const resetQuest = {
            ...quest,
            steps: quest.steps.map(step => ({ ...step, completed: false })),
            completed: false
          };
          
          // Update selectedQuest if it matches the current quest
          if (selectedQuest && selectedQuest.id === questId) {
            setSelectedQuest(resetQuest);
          }
          
          return resetQuest;
        }
        return quest;
      });
      return updatedQuests;
    });
    
    // Show reset feedback and clear active quest
    setJustReset(true);
    setTimeout(() => setJustReset(false), 2000);
    setLastActiveQuest(null);
    localStorage.removeItem('lastActiveQuest');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <GraduationCap className="w-8 h-8 text-blue-600" />
          Tutorials & Training
        </h1>
        <p className="text-gray-600">Master Test Data Manager and Flyway workflows through interactive quests</p>
      </div>

      {/* Resume Active Quest Banner */}
      {shouldShowResumePrompt && (
        <div className="card border-blue-200 bg-blue-50">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                  <PlayCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-blue-900">Continue Your Quest</h3>
                  <p className="text-blue-700 text-sm">
                    Resume <strong>{activeQuest?.title}</strong> - 
                    {activeQuest && ` ${activeQuest.steps.filter(s => s.completed).length}/${activeQuest.steps.length} steps completed`}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={resumeActiveQuest}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors font-medium"
                >
                  Resume Quest
                </button>
                <button
                  onClick={dismissActiveQuest}
                  className="bg-gray-300 text-gray-700 px-3 py-2 rounded-md hover:bg-gray-400 transition-colors text-sm"
                >
                  ×
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Progress Overview */}
      <div className="card">
        <div className="card-body">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Learning Progress</h3>
            <span className="text-sm text-gray-500">{completedCount} of {totalCount} quests completed</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
            <div 
              className="bg-blue-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{completedCount}</div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{quests.filter(q => q.unlocked && !q.completed).length}</div>
              <div className="text-sm text-gray-600">Available</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">{quests.filter(q => !q.unlocked).length}</div>
              <div className="text-sm text-gray-600">Locked</div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            selectedCategory === 'all' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All Quests
        </button>
        <button
          onClick={() => setSelectedCategory('tdm')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1 ${
            selectedCategory === 'tdm' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Target className="w-4 h-4" />
          TDM
        </button>
        <button
          onClick={() => setSelectedCategory('flyway')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1 ${
            selectedCategory === 'flyway' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Book className="w-4 h-4" />
          Flyway
        </button>
        <button
          onClick={() => setSelectedCategory('database')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1 ${
            selectedCategory === 'database' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          Database
        </button>
      </div>

      {/* Quest Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredQuests.map((quest) => (
          <div key={quest.id} className={`card transition-all duration-200 hover:shadow-lg ${!quest.unlocked ? 'opacity-60' : ''}`}>
            <div className="card-body">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  {getCategoryIcon(quest.category)}
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${getDifficultyColor(quest.difficulty)}`}>
                    {quest.difficulty}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  {quest.completed ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : quest.unlocked ? (
                    <PlayCircle className="w-5 h-5 text-blue-600" />
                  ) : (
                    <Lock className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{quest.title}</h3>
              <p className="text-gray-600 text-sm mb-4">{quest.description}</p>
              
              <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {quest.estimatedTime}
                </div>
                <div className="flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" />
                  {quest.steps.filter(s => s.completed).length}/{quest.steps.length} steps
                </div>
              </div>

              {quest.reward && (
                <div className="flex items-center gap-1 text-xs text-yellow-600 mb-4">
                  <Award className="w-4 h-4" />
                  Reward: {quest.reward}
                </div>
              )}
              
              <button
                onClick={() => startQuest(quest)}
                disabled={!quest.unlocked}
                className={`w-full py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  quest.completed 
                    ? 'bg-green-100 text-green-700 cursor-default' 
                    : quest.unlocked
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                {quest.completed ? 'Completed' : quest.unlocked ? 'Start Quest' : 'Locked'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Quest Detail Modal */}
      {selectedQuest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-xl font-bold text-gray-900">{selectedQuest.title}</h2>
                    <span className={`text-sm px-2 py-1 rounded-full font-medium ${
                      selectedQuest.completed 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {selectedQuest.steps.filter(s => s.completed).length}/{selectedQuest.steps.length} Complete
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm">{selectedQuest.description}</p>
                  
                  {/* Progress Bar */}
                  <div className="mt-3">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          selectedQuest.completed ? 'bg-green-600' : 'bg-blue-600'
                        }`}
                        style={{ 
                          width: `${(selectedQuest.steps.filter(s => s.completed).length / selectedQuest.steps.length) * 100}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedQuest(null)}
                  className="text-gray-400 hover:text-gray-600 ml-4"
                >
                  ×
                </button>
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-96">
              {justReset && (
                <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="flex items-center gap-2 text-orange-800">
                    <span className="font-medium">🔄 Progress Reset!</span>
                  </div>
                  <p className="text-orange-700 text-sm">Quest progress has been reset. You can start over!</p>
                </div>
              )}
              
              {selectedQuest.completed && !justReset && (
                <div className="mb-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg shadow-sm animate-pulse">
                  <div className="flex items-center gap-2 text-green-800 mb-2">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-bold">🎉 Quest Complete! 🎉</span>
                  </div>
                  <p className="text-green-700 text-sm">
                    Congratulations! You've mastered <strong>{selectedQuest.title}</strong>!
                    {selectedQuest.reward && (
                      <span className="block mt-1">
                        🏆 <strong>Reward Earned:</strong> {selectedQuest.reward}
                      </span>
                    )}
                  </p>
                </div>
              )}
              
              <div className="space-y-4">
                {selectedQuest.steps.map((step, index) => (
                  <div key={step.id} className={`border rounded-lg p-4 transition-all duration-300 ${
                    step.completed 
                      ? 'bg-green-50 border-green-200 shadow-sm' 
                      : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                  }`}>
                    <div className="flex items-start gap-3">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                        step.completed 
                          ? 'bg-green-600 text-white shadow-md' 
                          : 'bg-gray-300 text-gray-600'
                      }`}>
                        {step.completed ? '✓' : index + 1}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-1">{step.title}</h4>
                        <p className="text-gray-600 text-sm mb-3">{step.description}</p>
                        
                        <div className="flex gap-2 flex-wrap">
                          {step.action && !step.completed && (
                            <button
                              onClick={() => {
                                if (step.internalLink) {
                                  handleStepAction(step);
                                } else {
                                  handleQuestAction(selectedQuest.id, step.action!);
                                }
                              }}
                              className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700 transition-colors flex items-center gap-1"
                            >
                              {step.action}
                              {step.internalLink && <ExternalLink className="w-3 h-3" />}
                            </button>
                          )}
                          {!step.completed && (
                            <button
                              onClick={() => completeStep(selectedQuest.id, step.id)}
                              className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700 transition-all duration-200 flex items-center gap-1 hover:shadow-md"
                            >
                              <CheckCircle className="w-3 h-3" />
                              Mark Complete
                            </button>
                          )}
                          {step.completed && (
                            <div className="flex items-center gap-2">
                              <span className="text-green-600 text-xs flex items-center gap-1 font-medium">
                                <CheckCircle className="w-4 h-4" />
                                Completed
                              </span>
                              <span className="text-green-600 text-xs">✨</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="p-6 border-t bg-gray-50">
              <div className="flex gap-3">
                <button
                  onClick={() => resetQuestProgress(selectedQuest.id)}
                  className="flex-1 bg-orange-600 text-white py-2 px-4 rounded-md hover:bg-orange-700 transition-colors"
                >
                  Reset Progress
                </button>
                <button
                  onClick={() => setSelectedQuest(null)}
                  className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tutorials;