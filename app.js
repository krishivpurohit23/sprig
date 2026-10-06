// ==========================================
// SPRIG MAIN APPLICATION CONTROLLER
// ==========================================

import { 
  CAMPUS_LOCATIONS, 
  CATEGORIES, 
  CREWS, 
  BADGES_CATALOG, 
  getStore, 
  saveStore, 
  resetStore 
} from './data.js';

import { 
  analyzeIssueText, 
  findSimilarComplaints, 
  calculateImpactScore, 
  detectRecurringIssues, 
  computeLocationHealthScores,
  getPlantStage 
} from './intelligence.js';

import { Icon } from './icons.js';
import { PersonalSprig } from './components/PersonalSprig.js';
import { CampusBalance } from './components/CampusBalance.js';
import { CampusMap } from './components/CampusMap.js';

// Sound utility for tasteful audio feedback using Web Audio API
function playChime(type = 'success') {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;
    if (type === 'success') {
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.15); // G5
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.start(now);
      osc.stop(now + 0.35);
    } else if (type === 'growth') {
      osc.frequency.setValueAtTime(392.00, now); // G4
      osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.18); // E5
      osc.frequency.exponentialRampToValueAtTime(1046.50, now + 0.35); // C6
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
      osc.start(now);
      osc.stop(now + 0.55);
    } else if (type === 'click') {
      osc.frequency.setValueAtTime(600, now);
      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      osc.start(now);
      osc.stop(now + 0.08);
    }
  } catch (e) {
    // Audio context not allowed or not supported
  }
}

// Confetti trigger helper
function triggerConfetti() {
  if (window.confetti) {
    window.confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#10B981', '#34D399', '#F59E0B', '#3B82F6']
    });
  }
}

export function App() {
  // Master persistent state
  const [store, setStore] = React.useState(() => getStore());
  const [activeTab, setActiveTab] = React.useState('dashboard'); // student or faculty tabs
  const [reportModalOpen, setReportModalOpen] = React.useState(false);
  const [goodDeedModalOpen, setGoodDeedModalOpen] = React.useState(false);
  const [prefilledLocation, setPrefilledLocation] = React.useState('');
  const [assignModalComplaint, setAssignModalComplaint] = React.useState(null);
  const [notificationDrawerOpen, setNotificationDrawerOpen] = React.useState(false);
  const [toastMessage, setToastMessage] = React.useState(null);
  const [lastAwardPoints, setLastAwardPoints] = React.useState(null);
  const [growthModalOpen, setGrowthModalOpen] = React.useState(false);

  // Sync back to localStorage whenever store updates
  React.useEffect(() => {
    saveStore(store);
  }, [store]);

  const showToast = (title, desc = '', type = 'success') => {
    setToastMessage({ title, desc, type });
    playChime(type === 'growth' ? 'growth' : 'success');
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Auth state
  const currentUser = store.session;

  // Handle Login
  const handleLogin = (role, id) => {
    setStore(prev => ({
      ...prev,
      session: { role, id }
    }));
    setActiveTab(role === 'student' ? 'dashboard' : 'overview');
    showToast(`Welcome to SPRIG, ${id} 🌱`, `Signed in as ${role.toUpperCase()}`);
  };

  // Handle Logout
  const handleLogout = () => {
    setStore(prev => ({
      ...prev,
      session: null
    }));
    showToast('Signed Out', 'Your session has ended.');
  };

  // Water Plant Action
  const handleWaterPlant = () => {
    playChime('success');
    showToast('Sprig Hydrated 💧', 'Nurtured with care. Soil moisture optimal.');
  };

  // Award Points to Student
  const awardStudentPoints = (pts, reason = '') => {
    setStore(prev => {
      const oldStage = getPlantStage(prev.student.sprigPoints).stage;
      const newPoints = prev.student.sprigPoints + pts;
      const newStage = getPlantStage(newPoints).stage;

      // Check if grown
      if (newStage > oldStage) {
        setTimeout(() => {
          setGrowthModalOpen(true);
          playChime('growth');
          triggerConfetti();
        }, 500);
      }

      setLastAwardPoints(pts);
      setTimeout(() => setLastAwardPoints(null), 3000);

      const updatedStudent = {
        ...prev.student,
        sprigPoints: newPoints,
        contributionScore: Math.min(100, prev.student.contributionScore + Math.round(pts / 5))
      };

      // Also update leaderboard entry for 251B186
      const updatedLeaderboard = prev.leaderboard.map(lb => {
        if (lb.enrollment === '251B186') {
          return {
            ...lb,
            points: lb.points + pts,
            score: Math.min(100, lb.score + Math.round(pts / 5)),
            verifiedDeeds: reason.includes('Deed') ? lb.verifiedDeeds + 1 : lb.verifiedDeeds,
            verifications: reason.includes('Verification') ? lb.verifications + 1 : lb.verifications
          };
        }
        return lb;
      });

      return {
        ...prev,
        student: updatedStudent,
        leaderboard: updatedLeaderboard
      };
    });
  };

  // Student Verifies Fix
  const handleVerifyComplaint = (complaintId, isConfirmed) => {
    setStore(prev => {
      const updatedComplaints = prev.complaints.map(c => {
        if (c.id === complaintId) {
          const now = new Date().toISOString();
          if (isConfirmed) {
            return {
              ...c,
              status: 'Closed',
              resolutionFeedback: { verified: true, time: now },
              timeline: [
                ...c.timeline,
                { status: 'STUDENT VERIFIED', time: now, note: 'Student confirmed resolution in person.' },
                { status: 'CLOSED', time: now, note: 'Ticket archived and health points credited.' }
              ]
            };
          } else {
            return {
              ...c,
              status: 'Reopened',
              resolutionFeedback: { verified: false, time: now, note: 'Issue still persisting.' },
              timeline: [
                ...c.timeline,
                { status: 'STUDENT REJECTED', time: now, note: 'Student indicated issue is still active.' },
                { status: 'REOPENED', time: now, note: 'Ticket returned to maintenance queue.' }
              ]
            };
          }
        }
        return c;
      });

      return {
        ...prev,
        complaints: updatedComplaints
      };
    });

    if (isConfirmed) {
      awardStudentPoints(5, 'Successful Resolution Verification');
      showToast('Resolution Verified! ✅', '+5 Contribution Points credited. Campus health updated.');
      triggerConfetti();
    } else {
      showToast('Issue Reopened ⚠️', 'Faculty & maintenance crew have been notified to inspect.');
    }
  };

  // Support an existing complaint (+5 points)
  const handleSupportComplaint = (complaintId) => {
    setStore(prev => {
      const updatedComplaints = prev.complaints.map(c => {
        if (c.id === complaintId) {
          return {
            ...c,
            supportCount: (c.supportCount || 1) + 1,
            affectedStudents: (c.affectedStudents || 10) + 1
          };
        }
        return c;
      });
      return {
        ...prev,
        complaints: updatedComplaints
      };
    });

    awardStudentPoints(5, 'Community Support');
    showToast('Supported Community Issue 🤝', '+5 Contribution Points awarded. Campus priority raised!');
  };

  // Faculty marks complaint Fixed
  const handleFacultyMarkFixed = (complaintId) => {
    const now = new Date().toISOString();
    setStore(prev => {
      const target = prev.complaints.find(c => c.id === complaintId);
      const updatedComplaints = prev.complaints.map(c => {
        if (c.id === complaintId) {
          return {
            ...c,
            status: 'Fixed',
            timeline: [
              ...c.timeline,
              { status: 'FIXED', time: now, note: 'Department marked work complete. Awaiting student verification.' }
            ]
          };
        }
        return c;
      });

      // Add notification for reporting student
      const newNotification = {
        id: `ntf-${Date.now()}`,
        userRole: 'student',
        enrollment: target ? target.enrollment : '251B186',
        title: 'Please Verify Resolution',
        message: `Your issue ${complaintId} has been marked as Fixed. Please verify the resolution.`,
        type: 'verification',
        complaintId: complaintId,
        timestamp: now,
        read: false,
        actionRequired: true
      };

      return {
        ...prev,
        complaints: updatedComplaints,
        notifications: [newNotification, ...prev.notifications]
      };
    });

    showToast(`Marked ${complaintId} as Fixed`, 'Notification dispatched to student for verification.');
  };

  // Faculty Assigns Crew & Deadline
  const handleAssignCrew = (complaintId, crewName, deadlineHours = 24) => {
    const now = new Date();
    const deadlineDate = new Date(now.getTime() + deadlineHours * 60 * 60 * 1000).toISOString();
    const nowIso = now.toISOString();

    setStore(prev => {
      const updatedComplaints = prev.complaints.map(c => {
        if (c.id === complaintId) {
          return {
            ...c,
            assignedCrew: crewName,
            deadline: deadlineDate,
            status: 'Assigned',
            timeline: [
              ...c.timeline,
              { status: 'ASSIGNED', time: nowIso, note: `Assigned to ${crewName}. SLA deadline set to ${deadlineHours}h.` }
            ]
          };
        }
        return c;
      });

      // Increment crew workload
      const updatedCrews = prev.crews.map(cr => {
        if (cr.name === crewName) {
          return { ...cr, workload: cr.workload + 1 };
        }
        return cr;
      });

      return {
        ...prev,
        complaints: updatedComplaints,
        crews: updatedCrews
      };
    });

    setAssignModalComplaint(null);
    showToast(`Assigned to ${crewName}`, `SLA deadline set for ${deadlineHours} hours.`);
  };

  // Quick state reset for demonstrations
  const handleResetData = () => {
    const fresh = resetStore();
    setStore(fresh);
    showToast('Data Reset Complete', 'Seeded with default realistic hackathon dataset.');
  };

  // If NOT logged in, show premium Login Screen
  if (!currentUser) {
    return React.createElement(LoginScreen, { onLogin: handleLogin });
  }

  // Active view routing
  return React.createElement('div', {
    className: `min-h-screen flex flex-col ${
      currentUser.role === 'faculty' 
        ? 'bg-[#0B1510] text-stone-100' 
        : 'bg-[#FBF9F4] text-stone-900 font-sans'
    }`
  }, [
    // Top Navigation Bar
    React.createElement(Navbar, {
      key: 'nav',
      user: currentUser,
      activeTab,
      setActiveTab,
      onLogout: handleLogout,
      unreadCount: store.notifications.filter(n => n.userRole === currentUser.role && !n.read).length,
      onOpenNotifications: () => setNotificationDrawerOpen(true),
      studentPoints: store.student.sprigPoints
    }),

    // Main Content View Body
    React.createElement('main', {
      key: 'main-content',
      className: 'flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-8'
    }, [
      // STUDENT ROLE VIEWS
      currentUser.role === 'student' && React.createElement(React.Fragment, null, [
        activeTab === 'dashboard' && React.createElement(StudentDashboardView, {
          student: store.student,
          complaints: store.complaints,
          onOpenReport: () => setReportModalOpen(true),
          onOpenGoodDeed: () => setGoodDeedModalOpen(true),
          onWaterSprig: handleWaterPlant,
          onVerify: handleVerifyComplaint,
          lastAward: lastAwardPoints,
          setActiveTab
        }),
        activeTab === 'map' && React.createElement(CampusMap, {
          complaints: store.complaints,
          onQuickReport: (locName) => {
            setPrefilledLocation(locName);
            setReportModalOpen(true);
          },
          userRole: 'student'
        }),
        activeTab === 'good_deeds' && React.createElement(GoodDeedsView, {
          goodDeeds: store.goodDeeds,
          onOpenSubmit: () => setGoodDeedModalOpen(true),
          onVerifyDeed: (deedId) => {
            awardStudentPoints(30, 'Good Deed Verification');
            showToast('Good Deed Verified! 🌱', '+30 Sprig Points awarded! Your Sprig is growing!');
            triggerConfetti();
          }
        }),
        activeTab === 'contributions' && React.createElement(StudentContributionsView, {
          complaints: store.complaints,
          student: store.student,
          onVerify: handleVerifyComplaint,
          onSupport: handleSupportComplaint
        }),
        activeTab === 'leaderboard' && React.createElement(LeaderboardView, {
          leaderboard: store.leaderboard,
          student: store.student
        }),
        activeTab === 'rewards' && React.createElement(RewardsView, {
          student: store.student,
          badgesCatalog: BADGES_CATALOG
        })
      ]),

      // FACULTY ROLE VIEWS
      currentUser.role === 'faculty' && React.createElement(React.Fragment, null, [
        activeTab === 'overview' && React.createElement(FacultyOverviewView, {
          complaints: store.complaints,
          crews: store.crews,
          onOpenAssign: (comp) => setAssignModalComplaint(comp),
          onMarkFixed: handleFacultyMarkFixed,
          setActiveTab
        }),
        activeTab === 'complaints' && React.createElement(FacultyComplaintsTable, {
          complaints: store.complaints,
          onOpenAssign: (comp) => setAssignModalComplaint(comp),
          onMarkFixed: handleFacultyMarkFixed
        }),
        activeTab === 'queue' && React.createElement(FacultyWorkQueueView, {
          complaints: store.complaints,
          onMarkFixed: handleFacultyMarkFixed
        }),
        activeTab === 'map' && React.createElement(CampusMap, {
          complaints: store.complaints,
          userRole: 'faculty'
        }),
        activeTab === 'recurring' && React.createElement(RecurringIntelligenceView, {
          complaints: store.complaints,
          onEscalate: (rec) => {
            showToast(`Escalated ${rec.title} ⚠️`, 'Root cause preventive investigation dispatched.');
          }
        }),
        activeTab === 'crews' && React.createElement(FacultyCrewDirectory, {
          crews: store.crews
        }),
        activeTab === 'analytics' && React.createElement(FacultyAnalyticsView, {
          complaints: store.complaints,
          crews: store.crews,
          goodDeeds: store.goodDeeds
        })
      ])
    ]),

    // Modals & Drawers
    reportModalOpen && React.createElement(ReportIssueModal, {
      isOpen: reportModalOpen,
      onClose: () => {
        setReportModalOpen(false);
        setPrefilledLocation('');
      },
      prefilledLocation,
      existingComplaints: store.complaints,
      onSubmit: (newComplaint) => {
        setStore(prev => ({
          ...prev,
          complaints: [newComplaint, ...prev.complaints]
        }));
        awardStudentPoints(20, 'Verified Issue Report');
        setReportModalOpen(false);
        setPrefilledLocation('');
        showToast(`Complaint Logged: ${newComplaint.id} 📩`, 'Impact score calculated. Dispatched to operations center.');
      },
      onSupportExisting: (similarId) => {
        handleSupportComplaint(similarId);
        setReportModalOpen(false);
        setPrefilledLocation('');
      }
    }),

    goodDeedModalOpen && React.createElement(SubmitGoodDeedModal, {
      isOpen: goodDeedModalOpen,
      onClose: () => setGoodDeedModalOpen(false),
      onSubmit: (newDeed) => {
        setStore(prev => ({
          ...prev,
          goodDeeds: [newDeed, ...prev.goodDeeds]
        }));
        awardStudentPoints(30, 'Good Deed Verification');
        setGoodDeedModalOpen(false);
        showToast('Good Deed Submitted & Verified! 🌱', '+30 Sprig Points awarded! Your Sprig experienced immediate growth.');
        triggerConfetti();
      }
    }),

    assignModalComplaint && React.createElement(AssignCrewModal, {
      complaint: assignModalComplaint,
      crews: store.crews,
      onClose: () => setAssignModalComplaint(null),
      onAssign: (crewName, hours) => handleAssignCrew(assignModalComplaint.id, crewName, hours)
    }),

    notificationDrawerOpen && React.createElement(NotificationDrawer, {
      isOpen: notificationDrawerOpen,
      onClose: () => setNotificationDrawerOpen(false),
      notifications: store.notifications.filter(n => n.userRole === currentUser.role),
      onVerify: (id, flag) => {
        handleVerifyComplaint(id, flag);
        setNotificationDrawerOpen(false);
      }
    }),

    growthModalOpen && React.createElement(SprigGrowthModal, {
      isOpen: growthModalOpen,
      stage: getPlantStage(store.student.sprigPoints),
      onClose: () => setGrowthModalOpen(false)
    }),

    // Toast Alert
    toastMessage && React.createElement(Toast, { message: toastMessage }),

    // Bottom Persistent Demo Switcher & Utilities Bar
    React.createElement(DemoControlBar, {
      currentUser,
      onSwitchStudent: () => handleLogin('student', '251B186'),
      onSwitchFaculty: () => handleLogin('faculty', 'FAC1001'),
      onResetData: handleResetData
    })
  ]);
}

// ==========================================
// FULL-SCREEN LOGIN EXPERIENCE (SECTION 4)
// ==========================================
function LoginScreen({ onLogin }) {
  const [role, setRole] = React.useState('student'); // 'student' or 'faculty'
  const [idInput, setIdInput] = React.useState('251b186');
  const [pwdInput, setPwdInput] = React.useState('Reeti');
  const [errorMsg, setErrorMsg] = React.useState('');

  const handleRoleTab = (selectedRole) => {
    setRole(selectedRole);
    setErrorMsg('');
    if (selectedRole === 'student') {
      setIdInput('251b186');
      setPwdInput('Reeti');
    } else {
      setIdInput('FAC1001');
      setPwdInput('Faculty123');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanId = idInput.trim().toUpperCase();
    const cleanPwd = pwdInput.trim();

    if (role === 'student') {
      if (cleanId === '251B186' && cleanPwd.toLowerCase() === 'reeti') {
        onLogin('student', '251B186');
      } else {
        setErrorMsg('Invalid student credentials. Try 251b186 / Reeti');
      }
    } else {
      if (cleanId === 'FAC1001' && cleanPwd === 'Faculty123') {
        onLogin('faculty', 'FAC1001');
      } else {
        setErrorMsg('Invalid faculty credentials. Try FAC1001 / Faculty123');
      }
    }
  };

  return React.createElement('div', {
    className: 'min-h-screen bg-gradient-to-br from-[#0A2217] via-[#0E2F20] to-[#081810] flex flex-col justify-center items-center p-4 relative overflow-hidden text-white font-sans'
  }, [
    // Ambient botanical lights
    React.createElement('div', {
      key: 'ambient-1',
      className: 'absolute -top-32 -left-32 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none'
    }),
    React.createElement('div', {
      key: 'ambient-2',
      className: 'absolute -bottom-32 -right-32 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none'
    }),

    // Central Glass Card
    React.createElement('div', {
      key: 'login-card',
      className: 'relative z-10 w-full max-w-md bg-stone-900/80 backdrop-blur-xl p-8 rounded-3xl border border-emerald-500/30 shadow-2xl space-y-7'
    }, [
      // Brand Header
      React.createElement('div', { className: 'text-center space-y-2' }, [
        React.createElement('div', { className: 'inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-forest-950 shadow-lg shadow-emerald-500/30 mb-2' },
          React.createElement(Icon, { name: 'Sprout', className: 'w-10 h-10 text-[#0A2217]' })
        ),
        React.createElement('h1', { className: 'text-4xl font-extrabold tracking-tight text-white' },
          'SPRIG'
        ),
        React.createElement('p', { className: 'text-emerald-400 font-semibold text-sm tracking-wide' },
          'Grow a better campus.'
        ),
        React.createElement('p', { className: 'text-xs text-stone-300/80 max-w-xs mx-auto' },
          'Turn everyday observations into meaningful campus improvements.'
        )
      ]),

      // Role Selection Tabs
      React.createElement('div', {
        className: 'flex rounded-2xl bg-stone-950/70 p-1 border border-stone-800'
      }, [
        React.createElement('button', {
          type: 'button',
          onClick: () => handleRoleTab('student'),
          className: `flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            role === 'student' ? 'bg-emerald-600 text-white shadow' : 'text-stone-400 hover:text-white'
          }`
        }, [
          React.createElement('span', null, '👨🎓'),
          'STUDENT'
        ]),
        React.createElement('button', {
          type: 'button',
          onClick: () => handleRoleTab('faculty'),
          className: `flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            role === 'faculty' ? 'bg-emerald-600 text-white shadow' : 'text-stone-400 hover:text-white'
          }`
        }, [
          React.createElement('span', null, '👩💼'),
          'FACULTY / AUTHORITY'
        ])
      ]),

      // Login Form
      React.createElement('form', {
        onSubmit: handleSubmit,
        className: 'space-y-4'
      }, [
        React.createElement('div', null, [
          React.createElement('label', { className: 'block text-xs font-bold uppercase tracking-wider text-emerald-200/80 mb-1.5' },
            role === 'student' ? 'Enrollment Number' : 'Faculty ID'
          ),
          React.createElement('input', {
            type: 'text',
            value: idInput,
            onChange: (e) => setIdInput(e.target.value),
            placeholder: role === 'student' ? 'e.g. 251b186' : 'e.g. FAC1001',
            required: true,
            className: 'w-full px-4 py-3 rounded-xl bg-stone-950/60 border border-stone-700/80 text-white text-sm focus:outline-none focus:border-emerald-400 font-mono transition-colors'
          })
        ]),

        React.createElement('div', null, [
          React.createElement('label', { className: 'block text-xs font-bold uppercase tracking-wider text-emerald-200/80 mb-1.5' },
            'Password'
          ),
          React.createElement('input', {
            type: 'password',
            value: pwdInput,
            onChange: (e) => setPwdInput(e.target.value),
            placeholder: '••••••••',
            required: true,
            className: 'w-full px-4 py-3 rounded-xl bg-stone-950/60 border border-stone-700/80 text-white text-sm focus:outline-none focus:border-emerald-400 transition-colors'
          })
        ]),

        errorMsg && React.createElement('div', {
          className: 'text-xs text-red-400 bg-red-950/50 p-2.5 rounded-xl border border-red-800/40 text-center'
        }, errorMsg),

        React.createElement('button', {
          type: 'submit',
          className: 'w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-stone-950 font-extrabold text-sm uppercase tracking-wider shadow-lg shadow-emerald-500/25 active:scale-98 transition-all flex items-center justify-center gap-2'
        }, [
          React.createElement(Icon, { name: 'Leaf', className: 'w-4 h-4' }),
          `Sign in as ${role === 'student' ? 'Student' : 'Faculty'}`
        ])
      ]),

      // Demo auto-fill banner
      React.createElement('div', {
        className: 'pt-2 border-t border-stone-800 text-center text-xs text-stone-400 space-y-1'
      }, [
        React.createElement('p', null, 'Prototype Demonstration Credentials:'),
        role === 'student' 
          ? React.createElement('div', { className: 'font-mono text-emerald-300 font-semibold' }, '251b186 / Reeti')
          : React.createElement('div', { className: 'font-mono text-emerald-300 font-semibold' }, 'FAC1001 / Faculty123')
      ])
    ])
  ]);
}

// ==========================================
// TOP NAVBAR
// ==========================================
function Navbar({ user, activeTab, setActiveTab, onLogout, unreadCount, onOpenNotifications, studentPoints }) {
  const isStudent = user.role === 'student';

  const studentLinks = [
    { id: 'dashboard', label: 'Dashboard', icon: 'Home' },
    { id: 'map', label: 'Campus Map', icon: 'Map' },
    { id: 'good_deeds', label: 'Good Deeds', icon: 'Sprout' },
    { id: 'contributions', label: 'My Contributions', icon: 'Briefcase' },
    { id: 'leaderboard', label: 'Leaderboard', icon: 'Trophy' },
    { id: 'rewards', label: 'Rewards', icon: 'Award' },
  ];

  const facultyLinks = [
    { id: 'overview', label: 'Overview', icon: 'Activity' },
    { id: 'complaints', label: 'Complaints', icon: 'Briefcase' },
    { id: 'queue', label: 'Work Queue', icon: 'Layers' },
    { id: 'map', label: 'Campus Map', icon: 'Map' },
    { id: 'recurring', label: 'Recurring Issues', icon: 'Repeat' },
    { id: 'crews', label: 'Crews', icon: 'Wrench' },
    { id: 'analytics', label: 'Analytics', icon: 'BarChart3' },
  ];

  const links = isStudent ? studentLinks : facultyLinks;

  return React.createElement('header', {
    className: `sticky top-0 z-40 border-b backdrop-blur-md shadow-sm transition-colors ${
      isStudent 
        ? 'bg-[#0E2F20] text-white border-emerald-800/40' 
        : 'bg-[#0B1510] text-white border-stone-800'
    }`
  }, [
    React.createElement('div', {
      className: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4'
    }, [
      // Left Brand
      React.createElement('div', {
        className: 'flex items-center gap-3 cursor-pointer select-none',
        onClick: () => setActiveTab(isStudent ? 'dashboard' : 'overview')
      }, [
        React.createElement('div', {
          className: 'w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-forest-950 shadow-md'
        }, React.createElement(Icon, { name: 'Sprout', className: 'w-6 h-6 text-[#0A2217]' })),
        React.createElement('div', null, [
          React.createElement('span', { className: 'text-xl font-extrabold tracking-tight text-white' }, 'SPRIG'),
          React.createElement('span', { className: 'hidden sm:inline-block ml-2 text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' },
            isStudent ? 'Student Campus' : 'Operations Center'
          )
        ])
      ]),

      // Center Navigation Links (Scrollable on mobile)
      React.createElement('nav', {
        className: 'hidden md:flex items-center gap-1 overflow-x-auto py-1'
      }, links.map(link => 
        React.createElement('button', {
          key: link.id,
          onClick: () => setActiveTab(link.id),
          className: `px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === link.id
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-emerald-100/70 hover:text-white hover:bg-emerald-900/40'
          }`
        }, [
          React.createElement(Icon, { name: link.icon, className: 'w-3.5 h-3.5' }),
          link.label
        ])
      )),

      // Right User Pill & Actions
      React.createElement('div', { className: 'flex items-center gap-3' }, [
        // Notification Bell
        React.createElement('button', {
          onClick: onOpenNotifications,
          className: 'relative p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors'
        }, [
          React.createElement(Icon, { name: 'Bell', className: 'w-5 h-5' }),
          unreadCount > 0 && React.createElement('span', {
            className: 'absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center border-2 border-[#0E2F20] animate-pulse'
          }, unreadCount)
        ]),

        // Profile Identity Pill (Never displays name, displays enrollment ID)
        React.createElement('div', {
          className: 'flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-white/10 border border-white/10 text-xs'
        }, [
          React.createElement('div', { className: 'w-6 h-6 rounded-full bg-emerald-500/30 flex items-center justify-center text-[10px] font-bold text-emerald-300' },
            isStudent ? 'ST' : 'FC'
          ),
          React.createElement('span', { className: 'font-mono font-bold tracking-wider' }, user.id)
        ]),

        // Logout
        React.createElement('button', {
          onClick: onLogout,
          title: 'Sign Out',
          className: 'p-2 rounded-xl hover:bg-red-500/20 text-emerald-200/70 hover:text-red-400 transition-colors'
        }, React.createElement(Icon, { name: 'LogOut', className: 'w-5 h-5' }))
      ])
    ])
  ]);
}

// ==========================================
// STUDENT DASHBOARD VIEW (SECTIONS 8, 9, 10, 11, 25)
// ==========================================
function StudentDashboardView({ student, complaints, onOpenReport, onOpenGoodDeed, onWaterSprig, onVerify, lastAward, setActiveTab }) {
  // Check if any fixed complaint is waiting verification
  const pendingVerifications = complaints.filter(c => c.status === 'Fixed');

  return React.createElement('div', { className: 'space-y-8' }, [
    // Top Greeting & Philosophy
    React.createElement('div', {
      key: 'greeting',
      className: 'flex flex-wrap items-center justify-between gap-4 bg-gradient-to-r from-emerald-900/10 via-emerald-800/5 to-transparent p-5 rounded-3xl border border-emerald-900/10'
    }, [
      React.createElement('div', null, [
        React.createElement('h2', { className: 'text-3xl font-black text-[#0E2F20] tracking-tight flex items-center gap-2' }, [
          `Good morning, ${student.enrollment} 🌱`
        ]),
        React.createElement('p', { className: 'text-stone-600 text-sm mt-1 font-medium' },
          "Don't just complain. Contribute. Grow your Sprig. Grow your campus."
        )
      ]),

      // Fast Report Button
      React.createElement('button', {
        onClick: onOpenReport,
        className: 'px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-[#0E2F20] hover:from-emerald-500 hover:to-emerald-700 text-white font-bold text-sm shadow-xl shadow-emerald-700/20 active:scale-95 transition-all flex items-center gap-2'
      }, [
        React.createElement(Icon, { name: 'Camera', className: 'w-4 h-4' }),
        'REPORT AN ISSUE'
      ])
    ]),

    // Top Statistics Cards
    React.createElement('div', {
      key: 'stats-grid',
      className: 'grid grid-cols-2 md:grid-cols-4 gap-4'
    }, [
      renderStatCard('SPRIG POINTS', student.sprigPoints, 'Sprout', 'text-amber-500', 'Earned via verified deeds'),
      renderStatCard('CONTRIBUTION SCORE', `${student.contributionScore} / 100`, 'Award', 'text-emerald-600', 'Top 1% campus quality'),
      renderStatCard('STREAK', `${student.streakDays} Days`, 'Flame', 'text-orange-500', 'Active daily contributions'),
      renderStatCard('CURRENT BADGE', 'Campus Champion', 'Trophy', 'text-purple-600', 'Winner of the Year 2026-27')
    ]),

    // PENDING VERIFICATION ACTION BANNER (if any)
    pendingVerifications.length > 0 && React.createElement('div', {
      key: 'verification-banner',
      className: 'p-5 rounded-3xl bg-gradient-to-r from-cyan-900 to-blue-900 text-white shadow-xl border border-cyan-400/40 space-y-3'
    }, [
      React.createElement('div', { className: 'flex items-center gap-2 text-cyan-300 text-xs font-bold uppercase tracking-wider' }, [
        React.createElement(Icon, { name: 'CheckCircle2', className: 'w-4 h-4' }),
        'Action Required: Resolution Verification'
      ]),
      React.createElement('div', { className: 'flex flex-wrap items-center justify-between gap-4' }, [
        React.createElement('div', null, [
          React.createElement('h4', { className: 'text-lg font-bold text-white' },
            `Your issue ${pendingVerifications[0].id} has been marked as fixed by ${pendingVerifications[0].assignedCrew || 'maintenance'}.`
          ),
          React.createElement('p', { className: 'text-xs text-cyan-200/80 mt-0.5' },
            `Location: ${pendingVerifications[0].location} — "${pendingVerifications[0].title}". Please verify if the problem is fully resolved.`
          )
        ]),
        React.createElement('div', { className: 'flex items-center gap-3' }, [
          React.createElement('button', {
            onClick: () => onVerify(pendingVerifications[0].id, true),
            className: 'px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold text-xs uppercase tracking-wider shadow-md transition-transform active:scale-95 flex items-center gap-1.5'
          }, [
            React.createElement(Icon, { name: 'Check', className: 'w-4 h-4' }),
            'YES — FIXED (+5 pts)'
          ]),
          React.createElement('button', {
            onClick: () => onVerify(pendingVerifications[0].id, false),
            className: 'px-4 py-2 rounded-xl bg-red-500/80 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider shadow-md transition-transform active:scale-95 flex items-center gap-1.5'
          }, [
            React.createElement(Icon, { name: 'X', className: 'w-4 h-4' }),
            'NO — STILL OCCURRING'
          ])
        ])
      ])
    ]),

    // PERSONAL SPRIG LIVING ORGANISM AREA (Section 10)
    React.createElement(PersonalSprig, {
      key: 'personal-sprig',
      student,
      onWater: onWaterSprig,
      lastAward
    }),

    // CAMPUS BALANCE COLLABORATIVE TUG-OF-ROPE (Section 25)
    React.createElement(CampusBalance, {
      key: 'campus-balance',
      complaints
    }),

    // STUDENT QUICK ACTIONS (Section 11)
    React.createElement('div', {
      key: 'quick-actions',
      className: 'space-y-4'
    }, [
      React.createElement('h3', { className: 'text-lg font-bold text-[#0E2F20] tracking-tight' }, 'QUICK ACTIONS'),
      React.createElement('div', { className: 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3' }, [
        renderActionCard('📸 REPORT ISSUE', 'Log problem with AI', () => onOpenReport(), 'bg-emerald-50 border-emerald-200 text-emerald-950'),
        renderActionCard('🌱 GOOD DEED', 'Direct plant growth (+30)', () => onOpenGoodDeed(), 'bg-emerald-100 border-emerald-300 text-emerald-950'),
        renderActionCard('🤝 SUPPORT ISSUE', 'Back neighbor reports', () => setActiveTab('contributions'), 'bg-stone-50 border-stone-200 text-stone-800'),
        renderActionCard('✅ VERIFY FIX', `${pendingVerifications.length} waiting`, () => setActiveTab('contributions'), 'bg-cyan-50 border-cyan-200 text-cyan-950'),
        renderActionCard('🗺️ CAMPUS MAP', 'Visual health radar', () => setActiveTab('map'), 'bg-amber-50 border-amber-200 text-amber-950'),
        renderActionCard('🏆 REWARDS', 'Badges & trophies', () => setActiveTab('rewards'), 'bg-purple-50 border-purple-200 text-purple-950')
      ])
    ])
  ]);
}

function renderStatCard(label, val, iconName, colorClass, caption) {
  return React.createElement('div', {
    className: 'p-5 rounded-3xl bg-white shadow-sm border border-stone-200/80 flex flex-col justify-between space-y-2'
  }, [
    React.createElement('div', { className: 'flex items-center justify-between' }, [
      React.createElement('span', { className: 'text-[11px] font-bold uppercase tracking-wider text-stone-400' }, label),
      React.createElement(Icon, { name: iconName, className: `w-5 h-5 ${colorClass}` })
    ]),
    React.createElement('div', { className: 'text-2xl font-black text-stone-900 tracking-tight font-mono' }, val),
    React.createElement('span', { className: 'text-[11px] text-stone-400' }, caption)
  ]);
}

function renderActionCard(title, subtitle, onClick, styleClasses) {
  return React.createElement('button', {
    onClick,
    className: `p-4 rounded-2xl border text-left shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all flex flex-col justify-between min-h-[96px] ${styleClasses}`
  }, [
    React.createElement('span', { className: 'font-extrabold text-xs tracking-tight block' }, title),
    React.createElement('span', { className: 'text-[10px] text-stone-500 block leading-tight mt-1' }, subtitle)
  ]);
}

// ==========================================
// REPORT ISSUE MODAL WITH SPRIG INTELLIGENCE & DUPLICATE DETECTION (SECTIONS 12, 13, 14, 15, 17)
// ==========================================
function ReportIssueModal({ isOpen, onClose, onSubmit, onSupportExisting, existingComplaints, prefilledLocation = '' }) {
  const [title, setTitle] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [location, setLocation] = React.useState(prefilledLocation || 'Library');
  const [floor, setFloor] = React.useState('2nd Floor');
  const [room, setRoom] = React.useState('');
  const [category, setCategory] = React.useState('Wi-Fi / Network');
  const [severity, setSeverity] = React.useState('High');
  const [photoPreview, setPhotoPreview] = React.useState('assets/juet_campus_clean.jpg');

  // Real-time local intelligence analysis
  const intelligence = React.useMemo(() => {
    return analyzeIssueText(title, description, location);
  }, [title, description, location]);

  // Real-time duplicate detection
  const duplicateMatches = React.useMemo(() => {
    return findSimilarComplaints({ title, description, location, category }, existingComplaints);
  }, [title, description, location, category, existingComplaints]);

  // Calculate dynamic impact score
  const estimatedImpact = React.useMemo(() => {
    return calculateImpactScore({
      severity,
      location,
      affectedStudents: 14,
      supportCount: 2,
      isRecurring: intelligence.isPotentialRecurrence
    });
  }, [severity, location, intelligence]);

  // Auto-fill intelligence recommendation if student clicks pill
  const applyIntelligence = () => {
    setCategory(intelligence.category);
    setSeverity(intelligence.severity);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const nextId = `CMP-${1024 + Math.floor(Math.random() * 800)}`;
    const now = new Date().toISOString();

    const newComplaint = {
      id: nextId,
      enrollment: '251B186',
      title: title.trim(),
      description: description.trim(),
      category,
      severity,
      location,
      floor,
      room: room || 'Main Area',
      exactLocation: `${floor}, ${room || 'Common Area'}`,
      status: 'Submitted',
      impactScore: estimatedImpact,
      affectedStudents: 8,
      supportCount: 1,
      assignedCrew: intelligence.crew,
      createdAt: now,
      deadline: null,
      slaBreached: false,
      timeline: [
        { status: 'SUBMITTED', time: now, note: 'Submitted by student 251B186 with evidence.' }
      ],
      isRecurring: intelligence.isPotentialRecurrence,
      recurrenceCount: intelligence.isPotentialRecurrence ? 2 : 1,
      resolutionFeedback: null
    };

    onSubmit(newComplaint);
  };

  return React.createElement('div', {
    className: 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto'
  }, [
    React.createElement('div', {
      className: 'relative w-full max-w-2xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-stone-200 my-8 space-y-6 max-h-[90vh] overflow-y-auto'
    }, [
      // Header
      React.createElement('div', { className: 'flex justify-between items-center border-b border-stone-100 pb-4' }, [
        React.createElement('div', null, [
          React.createElement('span', { className: 'text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full' },
            'Smart Observation'
          ),
          React.createElement('h3', { className: 'text-2xl font-black text-[#0E2F20] tracking-tight mt-1' },
            'Report a Campus Issue'
          ),
          React.createElement('p', { className: 'text-xs text-stone-500' },
            'Automatically attached: Enrollment 251B186 • Timestamp • Geotag'
          )
        ]),
        React.createElement('button', {
          onClick: onClose,
          className: 'p-2 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-700'
        }, React.createElement(Icon, { name: 'X', className: 'w-5 h-5' }))
      ]),

      // 🧠 SPRIG INTELLIGENCE RECOMMENDATION BOX (Section 14)
      (title.length > 4 || description.length > 4) && React.createElement('div', {
        className: 'p-4 rounded-2xl bg-gradient-to-r from-emerald-950 via-[#0E2F20] to-[#0A2217] text-white space-y-2 border border-emerald-500/30 shadow-lg'
      }, [
        React.createElement('div', { className: 'flex justify-between items-center' }, [
          React.createElement('div', { className: 'flex items-center gap-2 text-xs font-bold text-emerald-300' }, [
            React.createElement(Icon, { name: 'BrainCircuit', className: 'w-4 h-4 text-emerald-400' }),
            '🧠 SPRIG INTELLIGENCE ENGINE'
          ]),
          React.createElement('span', { className: 'text-[10px] font-mono text-emerald-300/80 bg-emerald-500/20 px-2 py-0.5 rounded-full' },
            `${intelligence.confidence}% Confidence`
          )
        ]),
        React.createElement('p', { className: 'text-xs text-emerald-100/90 leading-relaxed' },
          intelligence.reasoning
        ),
        React.createElement('div', { className: 'flex flex-wrap items-center gap-2 pt-1' }, [
          React.createElement('span', { className: 'text-[11px] px-2.5 py-1 rounded-lg bg-white/10 font-medium' },
            `Category: ${intelligence.category}`
          ),
          React.createElement('span', { className: 'text-[11px] px-2.5 py-1 rounded-lg bg-white/10 font-medium' },
            `Suggested Crew: ${intelligence.crew}`
          ),
          React.createElement('span', { className: 'text-[11px] px-2.5 py-1 rounded-lg bg-amber-400/20 text-amber-300 font-bold' },
            `Est. Impact: ${estimatedImpact}/100`
          ),
          React.createElement('button', {
            type: 'button',
            onClick: applyIntelligence,
            className: 'ml-auto text-xs text-stone-900 bg-emerald-400 hover:bg-emerald-300 px-3 py-1 rounded-lg font-bold transition-colors'
          }, 'Apply Suggestion')
        ])
      ]),

      // 🔎 DUPLICATE DETECTION BOX (Section 15)
      duplicateMatches.length > 0 && React.createElement('div', {
        className: 'p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-950 space-y-3'
      }, [
        React.createElement('div', { className: 'flex items-center gap-2 text-xs font-bold text-amber-800' }, [
          React.createElement(Icon, { name: 'Search', className: 'w-4 h-4 text-amber-600' }),
          '🔎 SPRIG FOUND SIMILAR ISSUES ALREADY REPORTED'
        ]),
        duplicateMatches.map(match => 
          React.createElement('div', {
            key: match.complaint.id,
            className: 'p-3 rounded-xl bg-white border border-amber-200 text-xs flex flex-wrap items-center justify-between gap-3'
          }, [
            React.createElement('div', null, [
              React.createElement('span', { className: 'font-mono font-bold text-[#0E2F20]' }, match.complaint.id),
              React.createElement('span', { className: 'font-semibold text-stone-800 ml-2' }, match.complaint.title),
              React.createElement('div', { className: 'text-[11px] text-stone-500 mt-0.5' },
                `${match.complaint.supportCount || 3} similar reports • ${match.complaint.affectedStudents || 8} students affected • Status: ${match.complaint.status}`
              )
            ]),
            React.createElement('button', {
              type: 'button',
              onClick: () => onSupportExisting(match.complaint.id),
              className: 'px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center gap-1 shadow-sm'
            }, [
              React.createElement(Icon, { name: 'ThumbsUp', className: 'w-3.5 h-3.5' }),
              '🤝 SUPPORT EXISTING (+5 pts)'
            ])
          ])
        ),
        React.createElement('p', { className: 'text-[11px] text-amber-800/80 italic' },
          'Supporting an existing issue avoids spam and awards +5 contribution points immediately!'
        )
      ]),

      // Form
      React.createElement('form', {
        onSubmit: handleSubmit,
        className: 'space-y-4'
      }, [
        React.createElement('div', null, [
          React.createElement('label', { className: 'block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1' },
            'Issue Title'
          ),
          React.createElement('input', {
            type: 'text',
            value: title,
            onChange: (e) => setTitle(e.target.value),
            placeholder: 'e.g. Wi-Fi keeps disconnecting in the Library',
            required: true,
            className: 'w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:border-emerald-600'
          })
        ]),

        React.createElement('div', { className: 'grid grid-cols-1 sm:grid-cols-2 gap-4' }, [
          React.createElement('div', null, [
            React.createElement('label', { className: 'block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1' },
              'JUET Campus Location'
            ),
            React.createElement('select', {
              value: location,
              onChange: (e) => setLocation(e.target.value),
              className: 'w-full px-3 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:border-emerald-600 bg-white'
            }, CAMPUS_LOCATIONS.map(loc => 
              React.createElement('option', { key: loc.id, value: loc.name }, loc.name)
            ))
          ]),
          React.createElement('div', null, [
            React.createElement('label', { className: 'block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1' },
              'Floor / Sector'
            ),
            React.createElement('input', {
              type: 'text',
              value: floor,
              onChange: (e) => setFloor(e.target.value),
              placeholder: 'e.g. 2nd Floor',
              className: 'w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:border-emerald-600'
            })
          ])
        ]),

        React.createElement('div', { className: 'grid grid-cols-1 sm:grid-cols-2 gap-4' }, [
          React.createElement('div', null, [
            React.createElement('label', { className: 'block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1' },
              'Category'
            ),
            React.createElement('select', {
              value: category,
              onChange: (e) => setCategory(e.target.value),
              className: 'w-full px-3 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:border-emerald-600 bg-white'
            }, CATEGORIES.map(c => 
              React.createElement('option', { key: c.id, value: c.name }, c.name)
            ))
          ]),
          React.createElement('div', null, [
            React.createElement('label', { className: 'block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1' },
              'Severity'
            ),
            React.createElement('select', {
              value: severity,
              onChange: (e) => setSeverity(e.target.value),
              className: 'w-full px-3 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:border-emerald-600 bg-white'
            }, [
              React.createElement('option', { value: 'Low' }, 'Low'),
              React.createElement('option', { value: 'Medium' }, 'Medium'),
              React.createElement('option', { value: 'High' }, 'High'),
              React.createElement('option', { value: 'Critical' }, 'Critical')
            ])
          ])
        ]),

        React.createElement('div', null, [
          React.createElement('label', { className: 'block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1' },
            'Detailed Description'
          ),
          React.createElement('textarea', {
            rows: 3,
            value: description,
            onChange: (e) => setDescription(e.target.value),
            placeholder: 'Explain what is happening, when it occurs, and exact impact...',
            required: true,
            className: 'w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:border-emerald-600'
          })
        ]),

        // Photo Upload / Evidence Component (Section 13)
        React.createElement('div', null, [
          React.createElement('label', { className: 'block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1' },
            'Photo / Evidence'
          ),
          React.createElement('div', {
            className: 'flex items-center gap-4 p-3 rounded-2xl border-2 border-dashed border-stone-300 bg-stone-50'
          }, [
            React.createElement('div', { className: 'w-16 h-16 rounded-xl overflow-hidden bg-stone-200 border flex-shrink-0' },
              photoPreview ? React.createElement('img', { src: photoPreview, className: 'w-full h-full object-cover' }) : null
            ),
            React.createElement('div', { className: 'flex-1 text-xs text-stone-500' }, [
              React.createElement('p', { className: 'font-semibold text-stone-700' }, 'juet_campus_evidence.jpg (Pre-attached)'),
              React.createElement('p', null, 'Local prototype storage. Clear photo accelerates resolution.')
            ])
          ])
        ]),

        // Actions
        React.createElement('div', { className: 'flex justify-end gap-3 pt-3 border-t border-stone-100' }, [
          React.createElement('button', {
            type: 'button',
            onClick: onClose,
            className: 'px-5 py-2.5 rounded-xl border border-stone-300 text-stone-700 font-bold text-xs uppercase'
          }, 'Cancel'),
          React.createElement('button', {
            type: 'submit',
            className: 'px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-[#0E2F20] hover:from-emerald-500 hover:to-emerald-700 text-white font-extrabold text-xs uppercase tracking-wider shadow-lg'
          }, 'Submit Issue (+20 pts)')
        ])
      ])
    ])
  ]);
}

// ==========================================
// GOOD DEEDS VIEW & FORM (SECTIONS 20, 21)
// ==========================================
function GoodDeedsView({ goodDeeds, onOpenSubmit, onVerifyDeed }) {
  return React.createElement('div', { className: 'space-y-6' }, [
    React.createElement('div', {
      className: 'flex flex-wrap items-center justify-between gap-4 bg-white p-6 rounded-3xl shadow-sm border border-stone-200'
    }, [
      React.createElement('div', null, [
        React.createElement('span', { className: 'px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800' },
          'Direct Plant Growth 🌱'
        ),
        React.createElement('h2', { className: 'text-3xl font-black text-[#0E2F20] tracking-tight mt-1' },
          'GOOD DEEDS'
        ),
        React.createElement('p', { className: 'text-xs text-stone-500 mt-0.5' },
          'Small actions can create measurable campus improvement. Verified Good Deeds award +30 Sprig Points and directly trigger plant evolution.'
        )
      ]),
      React.createElement('button', {
        onClick: onOpenSubmit,
        className: 'px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-[#0E2F20] hover:from-emerald-500 hover:to-emerald-700 text-white font-bold text-xs uppercase tracking-wider shadow-lg flex items-center gap-2'
      }, [
        React.createElement(Icon, { name: 'Sprout', className: 'w-4 h-4' }),
        'LOG A GOOD DEED (+30 PTS)'
      ])
    ]),

    // Good Deeds Grid
    React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 gap-4' },
      goodDeeds.map(deed => 
        React.createElement('div', {
          key: deed.id,
          className: 'p-6 rounded-3xl bg-white shadow-sm border border-stone-200/90 flex flex-col justify-between space-y-4 hover:border-emerald-500/50 transition-colors'
        }, [
          React.createElement('div', null, [
            React.createElement('div', { className: 'flex justify-between items-center mb-2' }, [
              React.createElement('span', { className: 'px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200' },
                deed.impactCategory || 'Campus Stewardship'
              ),
              React.createElement('span', { className: 'font-mono text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-lg' },
                `+${deed.pointsAwarded} Sprig Points`
              )
            ]),
            React.createElement('h4', { className: 'text-base font-extrabold text-[#0E2F20]' }, deed.title),
            React.createElement('p', { className: 'text-xs text-stone-600 mt-1 leading-relaxed' }, deed.description)
          ]),

          React.createElement('div', { className: 'pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500' }, [
            React.createElement('span', { className: 'font-mono' }, `Location: ${deed.location}`),
            React.createElement('span', { className: 'font-mono text-emerald-700 font-bold' }, `Contributor: ${deed.enrollment}`)
          ])
        ])
      )
    )
  ]);
}

function SubmitGoodDeedModal({ isOpen, onClose, onSubmit }) {
  const [title, setTitle] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [location, setLocation] = React.useState('Hostel B');

  const handleSubmit = (e) => {
    e.preventDefault();
    const newDeed = {
      id: `GD-${505 + Math.floor(Math.random() * 500)}`,
      title: title.trim(),
      description: description.trim(),
      location,
      enrollment: '251B186',
      timestamp: new Date().toISOString(),
      status: 'Verified',
      pointsAwarded: 30,
      impactCategory: 'Direct Campus Contribution',
      imageUrl: 'assets/juet_campus_clean.jpg'
    };
    onSubmit(newDeed);
  };

  return React.createElement('div', {
    className: 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm'
  }, [
    React.createElement('div', {
      className: 'relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-stone-200 space-y-5'
    }, [
      React.createElement('div', { className: 'flex justify-between items-center border-b border-stone-100 pb-3' }, [
        React.createElement('div', null, [
          React.createElement('span', { className: 'text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full' },
            'Direct Plant Nurturing'
          ),
          React.createElement('h3', { className: 'text-2xl font-black text-[#0E2F20] tracking-tight mt-1' },
            'Log a Campus Good Deed'
          )
        ]),
        React.createElement('button', { onClick: onClose }, React.createElement(Icon, { name: 'X', className: 'w-5 h-5 text-stone-400' }))
      ]),

      React.createElement('form', { onSubmit: handleSubmit, className: 'space-y-4' }, [
        React.createElement('div', null, [
          React.createElement('label', { className: 'block text-xs font-bold uppercase text-stone-700 mb-1' }, 'What did you do?'),
          React.createElement('input', {
            type: 'text',
            value: title,
            onChange: (e) => setTitle(e.target.value),
            placeholder: 'e.g. Closed leaking tap near Hostel B while reporting',
            required: true,
            className: 'w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:border-emerald-600'
          })
        ]),
        React.createElement('div', null, [
          React.createElement('label', { className: 'block text-xs font-bold uppercase text-stone-700 mb-1' }, 'Location'),
          React.createElement('select', {
            value: location,
            onChange: (e) => setLocation(e.target.value),
            className: 'w-full px-3 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:border-emerald-600 bg-white'
          }, CAMPUS_LOCATIONS.map(l => React.createElement('option', { key: l.id, value: l.name }, l.name)))
        ]),
        React.createElement('div', null, [
          React.createElement('label', { className: 'block text-xs font-bold uppercase text-stone-700 mb-1' }, 'Details'),
          React.createElement('textarea', {
            rows: 3,
            value: description,
            onChange: (e) => setDescription(e.target.value),
            placeholder: 'Briefly describe your proactive action...',
            required: true,
            className: 'w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:border-emerald-600'
          })
        ]),
        React.createElement('div', { className: 'p-3 rounded-xl bg-emerald-50 text-xs text-emerald-900 border border-emerald-200' },
          '🌱 Verified Good Deeds directly award +30 Sprig Points and instantly trigger your Personal Sprig growth progression!'
        ),
        React.createElement('div', { className: 'flex justify-end gap-3 pt-2' }, [
          React.createElement('button', { type: 'button', onClick: onClose, className: 'px-4 py-2 rounded-xl border text-xs font-bold' }, 'Cancel'),
          React.createElement('button', { type: 'submit', className: 'px-5 py-2 rounded-xl bg-emerald-600 text-white font-extrabold text-xs uppercase tracking-wider' },
            'Submit & Grow Sprig (+30 pts)'
          )
        ])
      ])
    ])
  ]);
}

// ==========================================
// MY CONTRIBUTIONS & STATUS TIMELINE (SECTIONS 18, 19)
// ==========================================
function StudentContributionsView({ complaints, student, onVerify, onSupport }) {
  const [filter, setFilter] = React.useState('all');

  const myComplaints = complaints.filter(c => {
    if (filter === 'pending') return c.status === 'Fixed';
    if (filter === 'active') return c.status !== 'Closed';
    if (filter === 'closed') return c.status === 'Closed';
    return true;
  });

  return React.createElement('div', { className: 'space-y-6' }, [
    React.createElement('div', {
      className: 'flex flex-wrap items-center justify-between gap-4 bg-white p-6 rounded-3xl shadow-sm border border-stone-200'
    }, [
      React.createElement('div', null, [
        React.createElement('span', { className: 'px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800' },
          `Contributor: ${student.enrollment}`
        ),
        React.createElement('h2', { className: 'text-3xl font-black text-[#0E2F20] tracking-tight mt-1' },
          'MY CONTRIBUTIONS'
        ),
        React.createElement('p', { className: 'text-xs text-stone-500 mt-0.5' },
          'Track your reports along the full NOTICE → REPORT → VERIFY → ASSIGN → FIX → CONFIRM → IMPROVE workflow.'
        )
      ]),

      // Filter tabs
      React.createElement('div', { className: 'flex items-center gap-2' },
        ['all', 'pending', 'active', 'closed'].map(f =>
          React.createElement('button', {
            key: f,
            onClick: () => setFilter(f),
            className: `px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
              filter === f ? 'bg-[#0E2F20] text-white shadow' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`
          }, f === 'pending' ? 'Needs Verification' : f)
        )
      )
    ]),

    // List of cards with Timeline
    React.createElement('div', { className: 'space-y-4' },
      myComplaints.length === 0
        ? React.createElement('div', { className: 'p-12 text-center bg-white rounded-3xl border border-stone-200 text-stone-400' },
            'Your campus is quiet today 🌱 No matching contributions.'
          )
        : myComplaints.map(c => 
            React.createElement('div', {
              key: c.id,
              className: 'p-6 rounded-3xl bg-white shadow-sm border border-stone-200/90 space-y-4'
            }, [
              React.createElement('div', { className: 'flex flex-wrap items-center justify-between gap-3' }, [
                React.createElement('div', { className: 'flex items-center gap-3' }, [
                  React.createElement('span', { className: 'font-mono text-base font-black text-[#0E2F20]' }, c.id),
                  React.createElement('span', {
                    className: `px-3 py-1 rounded-full text-xs font-bold ${
                      c.status === 'Closed' ? 'bg-emerald-100 text-emerald-800' :
                      c.status === 'Fixed' ? 'bg-cyan-100 text-cyan-800 ring-2 ring-cyan-400' :
                      c.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                      'bg-amber-100 text-amber-800'
                    }`
                  }, c.status)
                ]),
                React.createElement('div', { className: 'flex items-center gap-3 text-xs font-mono text-stone-500' }, [
                  React.createElement('span', null, `Impact: ${c.impactScore}/100`),
                  React.createElement('span', null, `Location: ${c.location}`)
                ])
              ]),

              React.createElement('h3', { className: 'text-lg font-bold text-stone-900' }, c.title),
              React.createElement('p', { className: 'text-xs text-stone-600 leading-relaxed' }, c.description),

              // Visual Status Timeline (Section 18)
              renderTimeline(c.status, c.timeline),

              // If Fixed: show student verification controls (Section 19)
              c.status === 'Fixed' && React.createElement('div', {
                className: 'mt-4 p-4 rounded-2xl bg-cyan-50 border border-cyan-300 flex flex-wrap items-center justify-between gap-4'
              }, [
                React.createElement('div', null, [
                  React.createElement('p', { className: 'text-xs font-bold text-cyan-950' },
                    'Your issue has been marked as fixed. Please verify the resolution.'
                  ),
                  React.createElement('p', { className: 'text-[11px] text-cyan-800' },
                    'Confirming resolution closes the ticket and credits +5 verification points.'
                  )
                ]),
                React.createElement('div', { className: 'flex items-center gap-2' }, [
                  React.createElement('button', {
                    onClick: () => onVerify(c.id, true),
                    className: 'px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase'
                  }, '✅ YES — FIXED'),
                  React.createElement('button', {
                    onClick: () => onVerify(c.id, false),
                    className: 'px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase'
                  }, '⚠️ NO — STILL OCCURRING')
                ])
              ])
            ])
          )
    )
  ]);
}

function renderTimeline(currentStatus, history = []) {
  const steps = ['SUBMITTED', 'REVIEWED', 'ASSIGNED', 'IN PROGRESS', 'FIXED', 'CLOSED'];
  const currentIndex = steps.indexOf(currentStatus.toUpperCase());

  return React.createElement('div', { className: 'pt-3 border-t border-stone-100' }, [
    React.createElement('div', { className: 'flex items-center justify-between relative' }, [
      // Line behind
      React.createElement('div', { className: 'absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-stone-200 -z-0' }),
      steps.map((st, i) => {
        const isDone = currentIndex >= i;
        const isCurrent = currentStatus.toUpperCase() === st;

        return React.createElement('div', {
          key: st,
          className: 'relative z-10 flex flex-col items-center bg-white px-1'
        }, [
          React.createElement('div', {
            className: `w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
              isDone ? 'bg-emerald-600 text-white' : 'bg-stone-200 text-stone-500'
            } ${isCurrent ? 'ring-4 ring-emerald-300' : ''}`
          }, i + 1),
          React.createElement('span', {
            className: `text-[9px] font-bold uppercase mt-1 tracking-wider ${
              isDone ? 'text-emerald-800' : 'text-stone-400'
            }`
          }, st)
        ]);
      })
    ])
  ]);
}

// ==========================================
// LEADERBOARD & WINNER OF THE YEAR (SECTIONS 23, 24)
// ==========================================
function LeaderboardView({ leaderboard, student }) {
  return React.createElement('div', { className: 'space-y-6' }, [
    // WINNER OF THE YEAR 2026-27 ANNUAL SPOTLIGHT (Section 24)
    React.createElement('div', {
      className: 'relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1A3326] via-[#122A1E] to-[#0A1A12] p-8 text-white shadow-2xl border-2 border-amber-500/40'
    }, [
      React.createElement('div', { className: 'absolute -right-12 -top-12 w-64 h-64 bg-amber-500/20 rounded-full blur-3xl pointer-events-none' }),
      React.createElement('div', { className: 'relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6' }, [
        React.createElement('div', { className: 'space-y-2 text-center sm:text-left' }, [
          React.createElement('div', { className: 'inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black tracking-widest uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40' }, [
            React.createElement(Icon, { name: 'Trophy', className: 'w-4 h-4 text-amber-400' }),
            'ANNUAL HONOUR ROLL'
          ]),
          React.createElement('h2', { className: 'text-3xl sm:text-4xl font-black tracking-tight text-white' },
            'WINNER OF THE YEAR 🏆'
          ),
          React.createElement('p', { className: 'text-sm text-stone-300 max-w-lg' },
            'The highest contribution recognition remains locked for the entire academic year. Conferred based on contribution quality, not raw complaint volume.'
          ),
          React.createElement('div', { className: 'pt-2 flex flex-wrap gap-4 font-mono text-xs text-amber-200' }, [
            React.createElement('span', null, 'Academic Year: 2026–27'),
            React.createElement('span', null, 'Score: 98/100 Quality'),
            React.createElement('span', null, 'Verified Deeds: 14')
          ])
        ]),

        React.createElement('div', {
          className: 'p-6 rounded-2xl bg-amber-500/10 border border-amber-400/30 text-center flex flex-col items-center justify-center min-w-[200px]'
        }, [
          React.createElement('span', { className: 'text-4xl mb-1' }, '👑'),
          React.createElement('span', { className: 'text-2xl font-black font-mono tracking-widest text-amber-300' },
            '251B186'
          ),
          React.createElement('span', { className: 'text-[10px] uppercase font-bold tracking-widest text-amber-400/80 mt-1' },
            '2026–27 Campus Laureate'
          )
        ])
      ])
    ]),

    // LEADERBOARD TABLE (Section 23 - Never show student names!)
    React.createElement('div', {
      className: 'bg-white rounded-3xl p-6 shadow-sm border border-stone-200 space-y-4'
    }, [
      React.createElement('div', null, [
        React.createElement('h3', { className: 'text-xl font-black text-[#0E2F20]' }, 'CAMPUS CONTRIBUTORS'),
        React.createElement('p', { className: 'text-xs text-stone-500 mt-0.5' },
          'Ranked strictly by verified Good Deeds, resolution verifications, and quality reporting.'
        )
      ]),

      React.createElement('div', { className: 'overflow-x-auto' },
        React.createElement('table', { className: 'w-full text-left text-xs' }, [
          React.createElement('thead', { className: 'border-b border-stone-200 text-stone-400 font-bold uppercase' },
            React.createElement('tr', null, [
              React.createElement('th', { className: 'py-3 px-3' }, 'Rank'),
              React.createElement('th', { className: 'py-3 px-3' }, 'Enrollment ID'),
              React.createElement('th', { className: 'py-3 px-3' }, 'Sprig Points'),
              React.createElement('th', { className: 'py-3 px-3' }, 'Quality Score'),
              React.createElement('th', { className: 'py-3 px-3' }, 'Verified Deeds'),
              React.createElement('th', { className: 'py-3 px-3' }, 'Badge Title')
            ])
          ),
          React.createElement('tbody', { className: 'divide-y divide-stone-100 font-medium' },
            leaderboard.map(entry => 
              React.createElement('tr', {
                key: entry.enrollment,
                className: `hover:bg-stone-50 transition-colors ${entry.enrollment === '251B186' ? 'bg-emerald-50/60 font-bold' : ''}`
              }, [
                React.createElement('td', { className: 'py-3.5 px-3 font-mono font-extrabold' },
                  entry.rank === 1 ? '🥇 #1' : entry.rank === 2 ? '🥈 #2' : entry.rank === 3 ? '🥉 #3' : `#${entry.rank}`
                ),
                React.createElement('td', { className: 'py-3.5 px-3 font-mono text-[#0E2F20]' },
                  entry.enrollment === '251B186' ? `${entry.enrollment} (You)` : entry.enrollment
                ),
                React.createElement('td', { className: 'py-3.5 px-3 font-mono text-amber-600 font-bold' }, entry.points),
                React.createElement('td', { className: 'py-3.5 px-3 font-mono text-emerald-700' }, `${entry.score}/100`),
                React.createElement('td', { className: 'py-3.5 px-3 font-mono' }, entry.verifiedDeeds),
                React.createElement('td', { className: 'py-3.5 px-3' },
                  React.createElement('span', { className: 'px-2 py-0.5 rounded-full text-[10px] font-bold bg-stone-100 text-stone-700' },
                    entry.badge
                  )
                )
              ])
            )
          )
        ])
      )
    ])
  ]);
}

// ==========================================
// REWARDS & BADGES GALLERY (SECTION 22)
// ==========================================
function RewardsView({ student, badgesCatalog }) {
  return React.createElement('div', { className: 'space-y-6' }, [
    React.createElement('div', {
      className: 'bg-white p-6 rounded-3xl shadow-sm border border-stone-200'
    }, [
      React.createElement('span', { className: 'px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-100 text-amber-800' },
        'Stewardship Achievements'
      ),
      React.createElement('h2', { className: 'text-3xl font-black text-[#0E2F20] tracking-tight mt-1' },
        'BADGES & REWARDS'
      ),
      React.createElement('p', { className: 'text-xs text-stone-500 mt-0.5' },
        'Collectible botanical and civic honors unlocked through sustained verified positive actions.'
      )
    ]),

    React.createElement('div', { className: 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4' },
      badgesCatalog.map(badge => {
        const isUnlocked = student.badgesUnlocked.includes(badge.id);

        return React.createElement('div', {
          key: badge.id,
          className: `p-5 rounded-3xl border transition-all ${
            isUnlocked 
              ? 'bg-white border-amber-300 shadow-md' 
              : 'bg-stone-50 border-stone-200 opacity-60'
          }`
        }, [
          React.createElement('div', { className: 'flex items-center justify-between mb-3' }, [
            React.createElement('div', {
              className: `w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner ${
                isUnlocked ? 'bg-gradient-to-tr from-amber-400 to-emerald-400 text-forest-950' : 'bg-stone-200 text-stone-400'
              }`
            }, React.createElement(Icon, { name: badge.icon, className: 'w-6 h-6' })),
            React.createElement('span', {
              className: `px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                isUnlocked ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-600'
              }`
            }, isUnlocked ? 'Unlocked' : 'Locked')
          ]),
          React.createElement('h4', { className: 'font-extrabold text-sm text-[#0E2F20]' }, badge.name),
          React.createElement('p', { className: 'text-xs text-stone-500 mt-1 leading-relaxed' }, badge.description),
          React.createElement('div', { className: 'mt-3 text-[11px] font-mono text-stone-400' },
            `Requires ~${badge.pointsRequired} pts`
          )
        ]);
      })
    )
  ]);
}

// ==========================================
// FACULTY OPERATIONS CENTER (SECTIONS 32–37)
// ==========================================
function FacultyOverviewView({ complaints, crews, onOpenAssign, onMarkFixed, setActiveTab }) {
  const openCount = complaints.filter(c => c.status === 'Submitted' || c.status === 'Reviewed').length;
  const assignedCount = complaints.filter(c => c.status === 'Assigned').length;
  const inProgressCount = complaints.filter(c => c.status === 'In Progress').length;
  const overdueCount = complaints.filter(c => c.slaBreached).length;
  const fixedCount = complaints.filter(c => c.status === 'Fixed').length;
  const reopenedCount = complaints.filter(c => c.status === 'Reopened').length;

  const urgentIssues = complaints.filter(c => c.severity === 'Critical' || c.slaBreached).slice(0, 4);

  return React.createElement('div', { className: 'space-y-6 text-stone-100' }, [
    // Faculty Operations Banner
    React.createElement('div', {
      className: 'bg-stone-900/90 border border-emerald-500/30 p-6 rounded-3xl shadow-xl space-y-1'
    }, [
      React.createElement('div', { className: 'flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-widest' }, [
        React.createElement(Icon, { name: 'Activity', className: 'w-4 h-4' }),
        'SPRIG OPERATIONS CENTER'
      ]),
      React.createElement('h2', { className: 'text-3xl font-black tracking-tight text-white' },
        'Campus Issues. Real-Time Action. Preventive Intelligence.'
      ),
      React.createElement('p', { className: 'text-xs text-stone-400' },
        'Operational control room for department routing, maintenance crew dispatch, and root-cause analysis.'
      )
    ]),

    // SLA & Operational Stats Grid (Section 33)
    React.createElement('div', { className: 'grid grid-cols-2 md:grid-cols-6 gap-3' }, [
      renderFacultyStat('OPEN', openCount, 'bg-amber-950/40 text-amber-400 border-amber-800/40'),
      renderFacultyStat('ASSIGNED', assignedCount, 'bg-blue-950/40 text-blue-400 border-blue-800/40'),
      renderFacultyStat('IN PROGRESS', inProgressCount, 'bg-cyan-950/40 text-cyan-400 border-cyan-800/40'),
      renderFacultyStat('OVERDUE (SLA)', overdueCount, 'bg-red-950/40 text-red-400 border-red-800/40 animate-pulse'),
      renderFacultyStat('FIXED (VERIFY)', fixedCount, 'bg-emerald-950/40 text-emerald-400 border-emerald-800/40'),
      renderFacultyStat('REOPENED', reopenedCount, 'bg-orange-950/40 text-orange-400 border-orange-800/40')
    ]),

    // Urgent Issues & SLA Breaches (Section 36)
    urgentIssues.length > 0 && React.createElement('div', {
      className: 'bg-red-950/30 border border-red-800/40 p-5 rounded-3xl space-y-3'
    }, [
      React.createElement('div', { className: 'flex items-center gap-2 text-red-400 text-xs font-extrabold uppercase tracking-wider' }, [
        React.createElement(Icon, { name: 'AlertTriangle', className: 'w-4 h-4 text-red-400' }),
        '⚠️ CRITICAL SLA ALERTS & OVERDUE TICKETS'
      ]),
      React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 gap-3' },
        urgentIssues.map(issue => 
          React.createElement('div', {
            key: issue.id,
            className: 'p-4 rounded-2xl bg-stone-900 border border-stone-800 flex justify-between items-center text-xs'
          }, [
            React.createElement('div', null, [
              React.createElement('div', { className: 'flex items-center gap-2 mb-1' }, [
                React.createElement('span', { className: 'font-mono font-bold text-white' }, issue.id),
                React.createElement('span', { className: 'px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-900 text-red-200' },
                  issue.slaBreached ? 'SLA BREACHED' : 'CRITICAL'
                )
              ]),
              React.createElement('p', { className: 'text-stone-300 font-semibold truncate max-w-xs' }, issue.title),
              React.createElement('p', { className: 'text-stone-500 text-[11px]' }, `${issue.location} • Impact: ${issue.impactScore}/100`)
            ]),
            React.createElement('button', {
              onClick: () => onOpenAssign(issue),
              className: 'px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase'
            }, 'Dispatch')
          ])
        )
      )
    ]),

    // Recent Active Tickets Table Preview
    React.createElement('div', {
      className: 'bg-stone-900 rounded-3xl p-6 border border-stone-800 space-y-4'
    }, [
      React.createElement('div', { className: 'flex justify-between items-center' }, [
        React.createElement('h3', { className: 'text-lg font-bold text-white' }, "TODAY'S WORK QUEUE"),
        React.createElement('button', {
          onClick: () => setActiveTab('complaints'),
          className: 'text-xs text-emerald-400 hover:underline font-bold'
        }, 'View All Complaints →')
      ]),
      renderCompactComplaintsTable(complaints.slice(0, 6), onOpenAssign, onMarkFixed)
    ])
  ]);
}

function renderFacultyStat(label, count, styleClasses) {
  return React.createElement('div', {
    className: `p-4 rounded-2xl border flex flex-col justify-between ${styleClasses}`
  }, [
    React.createElement('span', { className: 'text-[10px] font-bold uppercase tracking-wider block opacity-80' }, label),
    React.createElement('span', { className: 'text-2xl font-black font-mono mt-1' }, count)
  ]);
}

// Master Faculty Complaints Table (Section 34)
function FacultyComplaintsTable({ complaints, onOpenAssign, onMarkFixed }) {
  const [search, setSearch] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('all');

  const filtered = complaints.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(search.toLowerCase()) || 
                          c.id.toLowerCase().includes(search.toLowerCase()) ||
                          c.location.toLowerCase().includes(search.toLowerCase());
    if (statusFilter === 'all') return matchesSearch;
    return matchesSearch && c.status.toLowerCase() === statusFilter.toLowerCase();
  });

  return React.createElement('div', { className: 'bg-stone-900 rounded-3xl p-6 border border-stone-800 space-y-5 text-stone-100' }, [
    React.createElement('div', { className: 'flex flex-wrap items-center justify-between gap-4 border-b border-stone-800 pb-4' }, [
      React.createElement('div', null, [
        React.createElement('h2', { className: 'text-2xl font-black text-white' }, 'MASTER COMPLAINT REGISTRY'),
        React.createElement('p', { className: 'text-xs text-stone-400 mt-0.5' },
          'Review, approve, assign maintenance crews, and monitor SLA compliance.'
        )
      ]),
      React.createElement('div', { className: 'flex flex-wrap items-center gap-3' }, [
        React.createElement('input', {
          type: 'text',
          value: search,
          onChange: (e) => setSearch(e.target.value),
          placeholder: 'Search ID, issue or zone...',
          className: 'px-3 py-1.5 rounded-xl bg-stone-950 border border-stone-700 text-xs text-white focus:outline-none focus:border-emerald-500'
        }),
        React.createElement('select', {
          value: statusFilter,
          onChange: (e) => setStatusFilter(e.target.value),
          className: 'px-3 py-1.5 rounded-xl bg-stone-950 border border-stone-700 text-xs text-white focus:outline-none'
        }, [
          React.createElement('option', { value: 'all' }, 'All Statuses'),
          React.createElement('option', { value: 'Submitted' }, 'Submitted'),
          React.createElement('option', { value: 'Assigned' }, 'Assigned'),
          React.createElement('option', { value: 'In Progress' }, 'In Progress'),
          React.createElement('option', { value: 'Fixed' }, 'Fixed'),
          React.createElement('option', { value: 'Closed' }, 'Closed')
        ])
      ])
    ]),

    renderCompactComplaintsTable(filtered, onOpenAssign, onMarkFixed)
  ]);
}

function renderCompactComplaintsTable(complaintsList, onOpenAssign, onMarkFixed) {
  return React.createElement('div', { className: 'overflow-x-auto' },
    React.createElement('table', { className: 'w-full text-left text-xs text-stone-200' }, [
      React.createElement('thead', { className: 'border-b border-stone-800 text-stone-400 font-bold uppercase' },
        React.createElement('tr', null, [
          React.createElement('th', { className: 'py-3 px-3' }, 'Complaint ID'),
          React.createElement('th', { className: 'py-3 px-3' }, 'Enrollment'),
          React.createElement('th', { className: 'py-3 px-3' }, 'Issue & Zone'),
          React.createElement('th', { className: 'py-3 px-3' }, 'Impact'),
          React.createElement('th', { className: 'py-3 px-3' }, 'Priority'),
          React.createElement('th', { className: 'py-3 px-3' }, 'Status'),
          React.createElement('th', { className: 'py-3 px-3' }, 'Assigned Crew'),
          React.createElement('th', { className: 'py-3 px-3 text-right' }, 'Actions')
        ])
      ),
      React.createElement('tbody', { className: 'divide-y divide-stone-800' },
        complaintsList.map(c => 
          React.createElement('tr', { key: c.id, className: 'hover:bg-stone-800/40 transition-colors' }, [
            React.createElement('td', { className: 'py-3 px-3 font-mono font-bold text-emerald-400' }, c.id),
            React.createElement('td', { className: 'py-3 px-3 font-mono text-stone-400' }, c.enrollment),
            React.createElement('td', { className: 'py-3 px-3' }, [
              React.createElement('div', { className: 'font-semibold text-white' }, c.title),
              React.createElement('div', { className: 'text-[10px] text-stone-400' }, `${c.location} • ${c.category}`)
            ]),
            React.createElement('td', { className: 'py-3 px-3 font-mono font-bold' },
              React.createElement('span', {
                className: `px-2 py-0.5 rounded-full text-[10px] ${
                  c.impactScore >= 80 ? 'bg-red-950 text-red-300 border border-red-800' :
                  c.impactScore >= 60 ? 'bg-amber-950 text-amber-300' : 'bg-emerald-950 text-emerald-300'
                }`
              }, `${c.impactScore}/100`)
            ),
            React.createElement('td', { className: 'py-3 px-3' },
              React.createElement('span', {
                className: `px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  c.severity === 'Critical' ? 'bg-red-900 text-red-200' :
                  c.severity === 'High' ? 'bg-amber-900 text-amber-200' : 'bg-stone-800 text-stone-300'
                }`
              }, c.severity)
            ),
            React.createElement('td', { className: 'py-3 px-3' },
              React.createElement('span', {
                className: `px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                  c.status === 'Closed' ? 'bg-emerald-950 text-emerald-300' :
                  c.status === 'Fixed' ? 'bg-cyan-950 text-cyan-300' :
                  c.status === 'In Progress' ? 'bg-blue-950 text-blue-300' : 'bg-amber-950 text-amber-300'
                }`
              }, c.status)
            ),
            React.createElement('td', { className: 'py-3 px-3 font-mono text-stone-300' },
              c.assignedCrew || React.createElement('span', { className: 'text-stone-500 italic' }, 'Unassigned')
            ),
            React.createElement('td', { className: 'py-3 px-3 text-right space-x-1' }, [
              c.status !== 'Fixed' && c.status !== 'Closed' && React.createElement('button', {
                onClick: () => onOpenAssign(c),
                className: 'px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] uppercase'
              }, 'Assign'),
              c.status !== 'Fixed' && c.status !== 'Closed' && React.createElement('button', {
                onClick: () => onMarkFixed(c.id),
                className: 'px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-[10px] uppercase'
              }, 'Mark Fixed')
            ])
          ])
        )
      )
    ])
  );
}

// Work Queue Tabs (Section 35)
function FacultyWorkQueueView({ complaints, onMarkFixed }) {
  const [tab, setTab] = React.useState('in_progress');

  const filtered = complaints.filter(c => {
    if (tab === 'assigned') return c.status === 'Assigned';
    if (tab === 'in_progress') return c.status === 'In Progress';
    if (tab === 'done') return c.status === 'Fixed' || c.status === 'Closed';
    if (tab === 'overdue') return c.slaBreached;
    return true;
  });

  return React.createElement('div', { className: 'bg-stone-900 rounded-3xl p-6 border border-stone-800 space-y-5 text-stone-100' }, [
    React.createElement('div', { className: 'flex flex-wrap items-center justify-between gap-4 border-b border-stone-800 pb-4' }, [
      React.createElement('div', null, [
        React.createElement('h2', { className: 'text-2xl font-black text-white' }, 'MAINTENANCE WORK QUEUE'),
        React.createElement('p', { className: 'text-xs text-stone-400 mt-0.5' },
          'Real-time status pipeline across campus technical departments.'
        )
      ]),
      React.createElement('div', { className: 'flex items-center gap-2' },
        ['assigned', 'in_progress', 'done', 'overdue'].map(t => 
          React.createElement('button', {
            key: t,
            onClick: () => setTab(t),
            className: `px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider ${
              tab === t ? 'bg-emerald-600 text-white' : 'bg-stone-800 text-stone-400 hover:bg-stone-700'
            }`
          }, t.replace('_', ' '))
        )
      )
    ]),

    React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 gap-4' },
      filtered.map(item => 
        React.createElement('div', {
          key: item.id,
          className: 'p-5 rounded-2xl bg-stone-950 border border-stone-800 space-y-3'
        }, [
          React.createElement('div', { className: 'flex justify-between items-center' }, [
            React.createElement('span', { className: 'font-mono font-bold text-emerald-400' }, item.id),
            React.createElement('span', { className: 'px-2 py-0.5 rounded-full text-[10px] font-bold bg-stone-800 text-stone-300' }, item.status)
          ]),
          React.createElement('h4', { className: 'font-bold text-white text-sm' }, item.title),
          React.createElement('p', { className: 'text-xs text-stone-400' }, `${item.location} • Assigned Crew: ${item.assignedCrew || 'Pending'}`),
          item.status !== 'Fixed' && item.status !== 'Closed' && React.createElement('button', {
            onClick: () => onMarkFixed(item.id),
            className: 'w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase'
          }, 'Mark Work as Fixed')
        ])
      )
    )
  ]);
}

// Crew Directory (Section 37)
function FacultyCrewDirectory({ crews }) {
  return React.createElement('div', { className: 'bg-stone-900 rounded-3xl p-6 border border-stone-800 space-y-6 text-stone-100' }, [
    React.createElement('div', null, [
      React.createElement('h2', { className: 'text-2xl font-black text-white' }, 'MAINTENANCE CREW DIRECTORY'),
      React.createElement('p', { className: 'text-xs text-stone-400 mt-0.5' },
        'Contact and dispatch directory for campus technical cells. (Crews do not log into SPRIG).'
      )
    ]),

    React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-3 gap-4' },
      crews.map(crew => 
        React.createElement('div', {
          key: crew.id,
          className: 'p-5 rounded-2xl bg-stone-950 border border-stone-800 space-y-3'
        }, [
          React.createElement('div', { className: 'flex justify-between items-center' }, [
            React.createElement('span', { className: 'px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800' },
              crew.department
            ),
            React.createElement('span', { className: 'text-xs font-mono text-stone-400' },
              `Load: ${crew.workload}/${crew.maxCapacity}`
            )
          ]),
          React.createElement('h4', { className: 'font-extrabold text-white text-base' }, crew.name),
          React.createElement('div', { className: 'text-xs text-stone-400 space-y-1 font-mono' }, [
            React.createElement('div', null, `Lead: ${crew.lead}`),
            React.createElement('div', null, `Phone: ${crew.contact}`),
            React.createElement('div', null, `Coverage: ${crew.area}`)
          ]),
          React.createElement('div', { className: 'flex gap-2 pt-2' }, [
            React.createElement('a', {
              href: `tel:${crew.contact}`,
              className: 'flex-1 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-center text-xs font-bold text-white flex items-center justify-center gap-1'
            }, [
              React.createElement(Icon, { name: 'Phone', className: 'w-3 h-3' }),
              'Call'
            ]),
            React.createElement('button', {
              onClick: () => alert(`SMS notification dispatched to ${crew.lead} (${crew.contact})`),
              className: 'flex-1 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-center text-xs font-bold text-white flex items-center justify-center gap-1'
            }, [
              React.createElement(Icon, { name: 'MessageSquare', className: 'w-3 h-3' }),
              'Dispatch Note'
            ])
          ])
        ])
      )
    )
  ]);
}

// Recurring Issue Intelligence View (Sections 31, 54)
function RecurringIntelligenceView({ complaints, onEscalate }) {
  const recurring = React.useMemo(() => detectRecurringIssues(complaints), [complaints]);

  return React.createElement('div', { className: 'bg-stone-900 rounded-3xl p-6 border border-stone-800 space-y-6 text-stone-100' }, [
    React.createElement('div', null, [
      React.createElement('div', { className: 'flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-widest' }, [
        React.createElement(Icon, { name: 'Repeat', className: 'w-4 h-4' }),
        'PREVENTIVE INFRASTRUCTURE INTELLIGENCE'
      ]),
      React.createElement('h2', { className: 'text-3xl font-black text-white mt-1' },
        'RECURRING ISSUE RADAR ⚠️'
      ),
      React.createElement('p', { className: 'text-xs text-stone-400 mt-0.5' },
        'Algorithmic pattern recognition detects recurring failures and provides engineering root-cause recommendations.'
      )
    ]),

    React.createElement('div', { className: 'space-y-4' },
      recurring.map(rec => 
        React.createElement('div', {
          key: rec.id,
          className: 'p-6 rounded-2xl bg-stone-950 border-2 border-amber-500/40 space-y-4 shadow-xl'
        }, [
          React.createElement('div', { className: 'flex flex-wrap items-center justify-between gap-3' }, [
            React.createElement('div', { className: 'flex items-center gap-2' }, [
              React.createElement('span', { className: 'px-2.5 py-0.5 rounded-full text-xs font-black bg-red-900 text-red-200' },
                'RECURRING PATTERN DETECTED'
              ),
              React.createElement('h3', { className: 'text-xl font-bold text-white' }, rec.title)
            ]),
            React.createElement('div', { className: 'text-xs font-mono text-stone-400 space-x-3' }, [
              React.createElement('span', null, `${rec.reportCount} reports in ${rec.daysSpan} days`),
              React.createElement('span', null, `${rec.previousFixes} previous fixes`),
              React.createElement('span', { className: 'text-amber-400 font-bold' }, `${rec.affectedCount} students impacted`)
            ])
          ]),

          // Root Cause Recommendation (Section 54)
          React.createElement('div', {
            className: 'p-4 rounded-xl bg-amber-950/40 border border-amber-600/40 text-xs text-amber-200 space-y-1'
          }, [
            React.createElement('span', { className: 'font-bold uppercase tracking-wider block text-amber-300' },
              'ROOT-CAUSE RECOMMENDATION'
            ),
            React.createElement('p', { className: 'text-stone-300 leading-relaxed font-sans' },
              `"${rec.recommendation}"`
            )
          ]),

          React.createElement('div', { className: 'flex justify-end gap-3 pt-2' }, [
            React.createElement('button', {
              onClick: () => onEscalate(rec),
              className: 'px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs uppercase tracking-wider'
            }, 'ESCALATE TO REGISTRAR'),
            React.createElement('button', {
              onClick: () => onEscalate(rec),
              className: 'px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider'
            }, 'ASSIGN SYSTEM INVESTIGATION')
          ])
        ])
      )
    )
  ]);
}

// Faculty Analytics Dashboard (Section 38)
function FacultyAnalyticsView({ complaints, crews, goodDeeds }) {
  // Category breakdown
  const catStats = {};
  complaints.forEach(c => { catStats[c.category] = (catStats[c.category] || 0) + 1; });

  return React.createElement('div', { className: 'bg-stone-900 rounded-3xl p-6 border border-stone-800 space-y-6 text-stone-100' }, [
    React.createElement('div', null, [
      React.createElement('h2', { className: 'text-3xl font-black text-white' }, 'CAMPUS ANALYTICS & TRENDS'),
      React.createElement('p', { className: 'text-xs text-stone-400 mt-0.5' },
        'Visual reports dynamically generated from live database metrics.'
      )
    ]),

    React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 gap-6' }, [
      // Category Breakdown Bar Chart
      React.createElement('div', { className: 'p-5 rounded-2xl bg-stone-950 border border-stone-800 space-y-3' }, [
        React.createElement('h4', { className: 'font-bold text-sm text-emerald-400' }, 'Complaints by Category'),
        React.createElement('div', { className: 'space-y-2' },
          Object.keys(catStats).map(cat => {
            const count = catStats[cat];
            const pct = Math.round((count / complaints.length) * 100);
            return React.createElement('div', { key: cat, className: 'space-y-1' }, [
              React.createElement('div', { className: 'flex justify-between text-xs font-mono' }, [
                React.createElement('span', null, cat),
                React.createElement('span', null, `${count} (${pct}%)`)
              ]),
              React.createElement('div', { className: 'w-full h-2 bg-stone-800 rounded-full overflow-hidden' },
                React.createElement('div', { className: 'h-full bg-emerald-500 rounded-full', style: { width: `${pct}%` } })
              )
            ]);
          })
        )
      ]),

      // Key Operational Performance Indices
      React.createElement('div', { className: 'p-5 rounded-2xl bg-stone-950 border border-stone-800 space-y-4' }, [
        React.createElement('h4', { className: 'font-bold text-sm text-emerald-400' }, 'Service Level & Resolution Metrics'),
        React.createElement('div', { className: 'grid grid-cols-2 gap-3 text-center' }, [
          React.createElement('div', { className: 'p-3 bg-stone-900 rounded-xl' }, [
            React.createElement('span', { className: 'text-[10px] text-stone-400 uppercase font-bold block' }, 'Avg Resolution Time'),
            React.createElement('span', { className: 'text-2xl font-black font-mono text-emerald-400' }, '4.8 hrs')
          ]),
          React.createElement('div', { className: 'p-3 bg-stone-900 rounded-xl' }, [
            React.createElement('span', { className: 'text-[10px] text-stone-400 uppercase font-bold block' }, 'Verification Rate'),
            React.createElement('span', { className: 'text-2xl font-black font-mono text-cyan-400' }, '94.2%')
          ]),
          React.createElement('div', { className: 'p-3 bg-stone-900 rounded-xl' }, [
            React.createElement('span', { className: 'text-[10px] text-stone-400 uppercase font-bold block' }, 'Good Deeds Logged'),
            React.createElement('span', { className: 'text-2xl font-black font-mono text-amber-400' }, goodDeeds.length)
          ]),
          React.createElement('div', { className: 'p-3 bg-stone-900 rounded-xl' }, [
            React.createElement('span', { className: 'text-[10px] text-stone-400 uppercase font-bold block' }, 'Water Saved (Est.)'),
            React.createElement('span', { className: 'text-2xl font-black font-mono text-blue-400' }, '2,400 L')
          ])
        ])
      ])
    ])
  ]);
}

// Modal for assigning crews
function AssignCrewModal({ complaint, crews, onClose, onAssign }) {
  const [selectedCrew, setSelectedCrew] = React.useState(crews[0].name);
  const [slaHours, setSlaHours] = React.useState(24);

  return React.createElement('div', {
    className: 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm'
  }, [
    React.createElement('div', {
      className: 'bg-stone-900 text-stone-100 rounded-3xl p-6 max-w-md w-full border border-stone-800 space-y-4'
    }, [
      React.createElement('div', { className: 'flex justify-between items-center border-b border-stone-800 pb-3' }, [
        React.createElement('h3', { className: 'text-xl font-bold text-white' }, `Assign Crew to ${complaint.id}`),
        React.createElement('button', { onClick: onClose }, React.createElement(Icon, { name: 'X', className: 'w-5 h-5' }))
      ]),

      React.createElement('div', { className: 'space-y-3' }, [
        React.createElement('div', null, [
          React.createElement('label', { className: 'block text-xs font-bold text-stone-400 mb-1' }, 'Select Maintenance Department'),
          React.createElement('select', {
            value: selectedCrew,
            onChange: (e) => setSelectedCrew(e.target.value),
            className: 'w-full px-3 py-2.5 rounded-xl bg-stone-950 border border-stone-700 text-sm'
          }, crews.map(cr => React.createElement('option', { key: cr.id, value: cr.name }, `${cr.name} (${cr.department})`)))
        ]),

        React.createElement('div', null, [
          React.createElement('label', { className: 'block text-xs font-bold text-stone-400 mb-1' }, 'SLA Deadline Window'),
          React.createElement('div', { className: 'grid grid-cols-4 gap-2' },
            [2, 4, 24, 72].map(hrs => 
              React.createElement('button', {
                key: hrs,
                type: 'button',
                onClick: () => setSlaHours(hrs),
                className: `py-2 rounded-xl text-xs font-bold ${
                  slaHours === hrs ? 'bg-emerald-600 text-white' : 'bg-stone-800 text-stone-400'
                }`
              }, `${hrs}h`)
            )
          )
        ])
      ]),

      React.createElement('div', { className: 'flex justify-end gap-3 pt-3 border-t border-stone-800' }, [
        React.createElement('button', { onClick: onClose, className: 'px-4 py-2 rounded-xl border border-stone-700 text-xs font-bold' }, 'Cancel'),
        React.createElement('button', {
          onClick: () => onAssign(selectedCrew, slaHours),
          className: 'px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs uppercase'
        }, 'Confirm Assignment')
      ])
    ])
  ]);
}

// Sprig Growth Celebration Modal
function SprigGrowthModal({ isOpen, stage, onClose }) {
  if (!isOpen) return null;

  return React.createElement('div', {
    className: 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn'
  }, [
    React.createElement('div', {
      className: 'bg-gradient-to-br from-[#123824] to-[#0A2217] text-white rounded-3xl p-8 max-w-sm w-full border-2 border-emerald-400/60 text-center space-y-4 shadow-2xl animate-scaleUp'
    }, [
      React.createElement('div', { className: 'text-5xl animate-bounce' }, '🌱✨'),
      React.createElement('h3', { className: 'text-2xl font-black text-white' },
        `Your Sprig grew to Stage ${stage.stage}!`
      ),
      React.createElement('p', { className: 'text-xs text-emerald-200/90 leading-relaxed' },
        `Your personal Sprig has blossomed into a ${stage.name}! This progress reflects your authentic, verified contributions to the campus.`
      ),
      React.createElement('button', {
        onClick: onClose,
        className: 'w-full py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-emerald-400 text-stone-950 font-extrabold text-xs uppercase tracking-wider shadow-lg'
      }, 'Continue Growing')
    ])
  ]);
}

// Notification Drawer
function NotificationDrawer({ isOpen, onClose, notifications, onVerify }) {
  if (!isOpen) return null;

  return React.createElement('div', {
    className: 'fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm'
  }, [
    React.createElement('div', {
      className: 'w-full max-w-md bg-stone-900 text-stone-100 h-full p-6 shadow-2xl flex flex-col space-y-4 border-l border-stone-800'
    }, [
      React.createElement('div', { className: 'flex justify-between items-center border-b border-stone-800 pb-4' }, [
        React.createElement('h3', { className: 'text-xl font-bold text-white' }, 'Notifications'),
        React.createElement('button', { onClick: onClose }, React.createElement(Icon, { name: 'X', className: 'w-5 h-5' }))
      ]),

      React.createElement('div', { className: 'flex-1 overflow-y-auto space-y-3' },
        notifications.length === 0 
          ? React.createElement('p', { className: 'text-stone-500 text-xs text-center py-10' }, "You're all caught up. 🌱")
          : notifications.map(n => 
              React.createElement('div', {
                key: n.id,
                className: 'p-4 rounded-2xl bg-stone-950 border border-stone-800 space-y-2 text-xs'
              }, [
                React.createElement('div', { className: 'flex justify-between items-center' }, [
                  React.createElement('span', { className: 'font-bold text-emerald-400' }, n.title),
                  React.createElement('span', { className: 'text-[10px] text-stone-500' }, 'Just now')
                ]),
                React.createElement('p', { className: 'text-stone-300' }, n.message),
                n.actionRequired && React.createElement('div', { className: 'flex gap-2 pt-1' }, [
                  React.createElement('button', {
                    onClick: () => onVerify(n.complaintId, true),
                    className: 'px-3 py-1 rounded-lg bg-emerald-600 text-white font-bold text-[10px]'
                  }, 'YES — FIXED (+5 pts)'),
                  React.createElement('button', {
                    onClick: () => onVerify(n.complaintId, false),
                    className: 'px-3 py-1 rounded-lg bg-red-600 text-white font-bold text-[10px]'
                  }, 'NO — REOPEN')
                ])
              ])
            )
      )
    ])
  ]);
}

// Toast Alert
function Toast({ message }) {
  return React.createElement('div', {
    className: 'fixed bottom-16 right-6 z-50 max-w-sm p-4 rounded-2xl bg-stone-900 text-white shadow-2xl border border-emerald-500/40 flex items-center gap-3 animate-slideUp'
  }, [
    React.createElement('div', { className: 'w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0' },
      React.createElement(Icon, { name: 'CheckCircle2', className: 'w-5 h-5' })
    ),
    React.createElement('div', { className: 'text-xs' }, [
      React.createElement('strong', { className: 'font-bold block text-white' }, message.title),
      message.desc && React.createElement('span', { className: 'text-stone-400' }, message.desc)
    ])
  ]);
}

// Demo Control Bar
function DemoControlBar({ currentUser, onSwitchStudent, onSwitchFaculty, onResetData }) {
  return React.createElement('aside', {
    className: 'fixed bottom-2 left-1/2 -translate-x-1/2 z-40 bg-stone-900/90 backdrop-blur-md px-4 py-2 rounded-full border border-stone-700/80 shadow-2xl flex items-center gap-3 text-xs text-white'
  }, [
    React.createElement('span', { className: 'text-[11px] font-bold text-emerald-400 hidden sm:inline' }, 'Hackathon Demo Mode:'),
    React.createElement('button', {
      onClick: onSwitchStudent,
      className: `px-2.5 py-1 rounded-full text-[11px] font-bold transition-all ${
        currentUser.role === 'student' ? 'bg-emerald-600 text-white' : 'bg-stone-800 text-stone-300 hover:text-white'
      }`
    }, '👨🎓 Student (251B186)'),
    React.createElement('button', {
      onClick: onSwitchFaculty,
      className: `px-2.5 py-1 rounded-full text-[11px] font-bold transition-all ${
        currentUser.role === 'faculty' ? 'bg-emerald-600 text-white' : 'bg-stone-800 text-stone-300 hover:text-white'
      }`
    }, '👩💼 Faculty (FAC1001)'),
    React.createElement('button', {
      onClick: onResetData,
      title: 'Reset localStorage to clean seed state',
      className: 'px-2 py-1 rounded-full bg-stone-800 hover:bg-red-950 text-stone-400 hover:text-red-300 text-[10px] font-mono'
    }, '↺ Reset Data')
  ]);
}
