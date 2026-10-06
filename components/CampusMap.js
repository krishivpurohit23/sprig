// ==========================================
// CAMPUS HEALTH MAP COMPONENT (JUET AERIAL)
// ==========================================

import { Icon } from '../icons.js';
import { CAMPUS_LOCATIONS } from '../data.js';
import { computeLocationHealthScores } from '../intelligence.js';

export function CampusMap({ complaints, onSelectLocation, onQuickReport, userRole = 'student' }) {
  const [selectedLocId, setSelectedLocId] = React.useState('library');
  const [categoryFilter, setCategoryFilter] = React.useState('all');
  const [viewMode, setViewMode] = React.useState('health'); // 'health' or 'operational'

  // Dynamic health calculation from live complaints
  const healthScores = React.useMemo(() => {
    return computeLocationHealthScores(CAMPUS_LOCATIONS, complaints);
  }, [complaints]);

  // Selected location details
  const selectedLocation = CAMPUS_LOCATIONS.find(l => l.id === selectedLocId) || CAMPUS_LOCATIONS[0];
  const locHealth = healthScores[selectedLocId] || { score: 5, rating: 'Healthy', color: '#10B981', totalComplaints: 0, openComplaints: 0, recurringDetected: false };
  const locComplaints = complaints.filter(c => c.location === selectedLocation.name);

  // Stats for the selected location
  const affectedStudentsTotal = locComplaints.reduce((acc, c) => acc + (c.affectedStudents || 12), 0);
  const openComplaintsList = locComplaints.filter(c => c.status !== 'Closed');
  const resolvedCount = locComplaints.filter(c => c.status === 'Closed' || c.status === 'Fixed').length;

  // Most common category
  const categoryCounts = {};
  locComplaints.forEach(c => {
    categoryCounts[c.category] = (categoryCounts[c.category] || 0) + 1;
  });
  let topCategory = 'None';
  let topCount = 0;
  for (const cat in categoryCounts) {
    if (categoryCounts[cat] > topCount) {
      topCount = categoryCounts[cat];
      topCategory = cat;
    }
  }

  // Filtered locations
  const filteredLocations = CAMPUS_LOCATIONS.filter(loc => {
    if (categoryFilter === 'all') return true;
    if (categoryFilter === 'critical') {
      const h = healthScores[loc.id]?.score || 5;
      return h <= 2;
    }
    if (categoryFilter === 'academic') return loc.category === 'Academic';
    if (categoryFilter === 'residential') return loc.category === 'Residential';
    return true;
  });

  return React.createElement('div', {
    className: 'space-y-6'
  }, [
    // Top Bar & Controls
    React.createElement('div', {
      key: 'map-header',
      className: 'flex flex-wrap items-center justify-between gap-4 bg-white p-5 rounded-3xl shadow-sm border border-stone-200'
    }, [
      React.createElement('div', null, [
        React.createElement('div', { className: 'flex items-center gap-2 mb-1' }, [
          React.createElement('span', { className: 'px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800' },
            'Live Dynamic Radar'
          ),
          React.createElement('span', { className: 'text-xs text-stone-500 font-medium' },
            'JUET Campus Aerial Grid'
          )
        ]),
        React.createElement('h2', { className: 'text-2xl font-extrabold text-[#0E2F20] tracking-tight' },
          'CAMPUS HEALTH MAP'
        ),
        React.createElement('p', { className: 'text-xs text-stone-500 mt-0.5' },
          'See where your campus needs attention. Markers evolve dynamically as complaints are logged, resolved, and verified.'
        )
      ]),

      // Controls & Filter Pills
      React.createElement('div', { className: 'flex flex-wrap items-center gap-2' }, [
        // Category filters
        ['all', 'critical', 'academic', 'residential'].map(filterKey => 
          React.createElement('button', {
            key: filterKey,
            onClick: () => setCategoryFilter(filterKey),
            className: `px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all ${
              categoryFilter === filterKey 
                ? 'bg-[#0E2F20] text-white shadow-md' 
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`
          }, filterKey === 'all' ? 'All Zones' : filterKey === 'critical' ? '🔴 Critical Zones' : filterKey)
        ),

        // Faculty View Toggle
        userRole === 'faculty' && React.createElement('button', {
          key: 'mode-toggle',
          onClick: () => setViewMode(viewMode === 'health' ? 'operational' : 'health'),
          className: 'ml-2 px-3 py-1.5 rounded-xl text-xs font-bold border border-emerald-600 bg-emerald-50 text-emerald-900 hover:bg-emerald-100 transition-all'
        }, viewMode === 'health' ? 'Switch to Operational Grid' : 'Switch to Health Index')
      ])
    ]),

    // Main Interactive Map and Side Panel Layout
    React.createElement('div', {
      key: 'map-container-grid',
      className: 'grid grid-cols-1 lg:grid-cols-12 gap-6 items-start'
    }, [
      // Left 8 Cols: High-Res JUET Map Canvas
      React.createElement('div', {
        key: 'map-canvas-card',
        className: 'lg:col-span-8 bg-stone-900 rounded-3xl p-3 shadow-2xl border border-stone-800 overflow-hidden relative'
      }, [
        // Map Display Box with 16:9 Aspect Ratio
        React.createElement('div', {
          className: 'relative w-full aspect-[16/9] rounded-2xl overflow-hidden select-none bg-stone-950'
        }, [
          // The Clean JUET Campus Image (No baked in markers!)
          React.createElement('img', {
            src: 'assets/juet_campus_clean.jpg',
            alt: 'JUET Campus Map Aerial',
            className: 'w-full h-full object-cover select-none pointer-events-none brightness-95 contrast-105'
          }),

          // Subtle ambient overlay grid
          React.createElement('div', {
            className: 'absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20 pointer-events-none'
          }),

          // Dynamic Pulsing Markers
          filteredLocations.map(loc => {
            const h = healthScores[loc.id] || { score: 5, color: '#10B981', rating: 'Healthy' };
            const isSelected = selectedLocId === loc.id;
            
            // Health Colors: 5/5 Green, 4/5 Green, 3/5 Yellow, 2/5 Orange, 1/5 Red
            let markerBg = 'bg-emerald-600';
            let markerBorder = 'border-emerald-300';
            let pulseRing = 'bg-emerald-500/30';
            if (h.score === 1) {
              markerBg = 'bg-red-600';
              markerBorder = 'border-red-300';
              pulseRing = 'bg-red-500/40';
            } else if (h.score === 2) {
              markerBg = 'bg-orange-600';
              markerBorder = 'border-orange-300';
              pulseRing = 'bg-orange-500/40';
            } else if (h.score === 3) {
              markerBg = 'bg-amber-500';
              markerBorder = 'border-amber-200';
              pulseRing = 'bg-amber-400/30';
            }

            return React.createElement('div', {
              key: loc.id,
              onClick: () => setSelectedLocId(loc.id),
              className: `absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-20 transition-all duration-300 ${isSelected ? 'scale-125 z-30' : 'hover:scale-110'}`,
              style: { left: `${loc.x}%`, top: `${loc.y}%` }
            }, [
              // Pulse Ring Animation
              React.createElement('div', {
                className: `absolute -inset-2.5 rounded-full ${pulseRing} animate-ping pointer-events-none ${h.score <= 2 ? 'opacity-80' : 'opacity-40'}`
              }),

              // Marker Circular Badge
              React.createElement('div', {
                className: `relative flex items-center justify-center w-8 h-8 rounded-full ${markerBg} text-white font-mono font-extrabold text-[11px] shadow-xl border-2 ${isSelected ? 'border-white ring-4 ring-emerald-400/60' : markerBorder} transition-all`
              }, `${h.score}/5`),

              // Label Pill underneath
              React.createElement('div', {
                className: `mt-1 px-2 py-0.5 rounded-md text-[10px] font-bold tracking-tight whitespace-nowrap shadow-md transition-all ${
                  isSelected 
                    ? 'bg-white text-stone-900 border border-emerald-500 scale-105' 
                    : 'bg-black/85 text-white/90 group-hover:bg-white group-hover:text-black'
                }`
              }, loc.name)
            ]);
          }),

          // Map Legend Overlay at Bottom Left
          React.createElement('div', {
            key: 'map-legend',
            className: 'absolute bottom-3 left-3 bg-black/85 backdrop-blur-md px-3.5 py-2.5 rounded-xl border border-white/10 text-white text-[11px] flex items-center gap-3 z-10'
          }, [
            React.createElement('div', { className: 'flex items-center gap-1.5' }, [
              React.createElement('span', { className: 'w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500' }),
              React.createElement('span', { className: 'font-medium' }, '5/5 Healthy')
            ]),
            React.createElement('div', { className: 'flex items-center gap-1.5' }, [
              React.createElement('span', { className: 'w-2.5 h-2.5 rounded-full bg-amber-500' }),
              React.createElement('span', { className: 'font-medium' }, '3/5 Moderate')
            ]),
            React.createElement('div', { className: 'flex items-center gap-1.5' }, [
              React.createElement('span', { className: 'w-2.5 h-2.5 rounded-full bg-orange-500' }),
              React.createElement('span', { className: 'font-medium' }, '2/5 Attention')
            ]),
            React.createElement('div', { className: 'flex items-center gap-1.5' }, [
              React.createElement('span', { className: 'w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse' }),
              React.createElement('span', { className: 'font-medium text-red-300 font-bold' }, '1/5 Critical')
            ])
          ])
        ])
      ]),

      // Right 4 Cols: Sliding Detail Location Panel (Section 29)
      React.createElement('div', {
        key: 'location-panel',
        className: 'lg:col-span-4 bg-white rounded-3xl p-6 shadow-xl border border-stone-200/90 space-y-5'
      }, [
        // Location Title & Health Badge
        React.createElement('div', { className: 'border-b border-stone-100 pb-4' }, [
          React.createElement('div', { className: 'flex items-center justify-between gap-2 mb-2' }, [
            React.createElement('span', { className: 'px-2.5 py-0.5 rounded-full text-xs font-semibold bg-stone-100 text-stone-700' },
              selectedLocation.category
            ),
            // Health Pill
            React.createElement('div', {
              className: `px-3 py-1 rounded-full text-xs font-extrabold flex items-center gap-1.5 ${
                locHealth.score >= 4 ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                locHealth.score === 3 ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                'bg-red-100 text-red-800 border border-red-300 animate-pulse'
              }`
            }, [
              React.createElement('span', { className: 'w-2 h-2 rounded-full', style: { backgroundColor: locHealth.color } }),
              `${locHealth.score}/5 ${locHealth.rating}`
            ])
          ]),
          React.createElement('h3', { className: 'text-2xl font-black text-[#0E2F20] tracking-tight' },
            selectedLocation.name
          ),
          React.createElement('p', { className: 'text-xs text-stone-500 mt-1 leading-relaxed' },
            selectedLocation.description
          )
        ]),

        // Recurring Issue Warning Callout (Section 31 & 54)
        locHealth.recurringDetected && React.createElement('div', {
          className: 'p-3.5 rounded-2xl bg-amber-50 border border-amber-300/80 text-xs text-amber-900 flex items-start gap-2.5'
        }, [
          React.createElement(Icon, { name: 'AlertTriangle', className: 'w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5' }),
          React.createElement('div', null, [
            React.createElement('strong', { className: 'font-bold block text-amber-800' }, '⚠️ Recurring Pattern Detected'),
            'Multiple repeated failures in this sector. System recommends root-cause inspection of infrastructure.'
          ])
        ]),

        // Numerical Metrics Grid
        React.createElement('div', { className: 'grid grid-cols-2 gap-3' }, [
          React.createElement('div', { className: 'p-3 rounded-2xl bg-stone-50 border border-stone-100' }, [
            React.createElement('span', { className: 'text-[11px] uppercase font-bold text-stone-400 block' }, 'Open Issues'),
            React.createElement('span', { className: `text-2xl font-black font-mono ${openComplaintsList.length > 0 ? 'text-amber-600' : 'text-emerald-600'}` },
              openComplaintsList.length
            )
          ]),
          React.createElement('div', { className: 'p-3 rounded-2xl bg-stone-50 border border-stone-100' }, [
            React.createElement('span', { className: 'text-[11px] uppercase font-bold text-stone-400 block' }, 'Resolved'),
            React.createElement('span', { className: 'text-2xl font-black font-mono text-emerald-600' },
              resolvedCount
            )
          ]),
          React.createElement('div', { className: 'p-3 rounded-2xl bg-stone-50 border border-stone-100' }, [
            React.createElement('span', { className: 'text-[11px] uppercase font-bold text-stone-400 block' }, 'Affected Students'),
            React.createElement('span', { className: 'text-lg font-bold font-mono text-stone-700' },
              affectedStudentsTotal || 0
            )
          ]),
          React.createElement('div', { className: 'p-3 rounded-2xl bg-stone-50 border border-stone-100' }, [
            React.createElement('span', { className: 'text-[11px] uppercase font-bold text-stone-400 block' }, 'Avg Resolution'),
            React.createElement('span', { className: 'text-lg font-bold font-mono text-stone-700' },
              locHealth.score <= 2 ? '6.4 hrs' : '3.2 hrs'
            )
          ])
        ]),

        // Most Common Category Pill
        React.createElement('div', { className: 'flex items-center justify-between text-xs py-2 px-3 rounded-xl bg-stone-100 text-stone-700' }, [
          React.createElement('span', { className: 'font-medium' }, 'Dominant Issue Type:'),
          React.createElement('span', { className: 'font-bold text-[#0E2F20]' }, topCategory)
        ]),

        // Recent Complaints at this location
        React.createElement('div', { className: 'space-y-2' }, [
          React.createElement('h4', { className: 'text-xs font-bold uppercase tracking-wider text-stone-500' },
            `Zone Activity (${locComplaints.length})`
          ),
          locComplaints.length === 0 
            ? React.createElement('p', { className: 'text-xs text-stone-400 italic py-2' }, 'No recent complaints logged for this area. 🌿')
            : React.createElement('div', { className: 'space-y-2 max-h-48 overflow-y-auto pr-1' },
                locComplaints.slice(0, 4).map(c => 
                  React.createElement('div', {
                    key: c.id,
                    className: 'p-2.5 rounded-xl bg-stone-50 border border-stone-200/70 text-xs hover:border-emerald-500/50 transition-colors'
                  }, [
                    React.createElement('div', { className: 'flex justify-between items-center mb-1' }, [
                      React.createElement('span', { className: 'font-mono font-bold text-[#0E2F20]' }, c.id),
                      React.createElement('span', {
                        className: `px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          c.status === 'Closed' ? 'bg-emerald-100 text-emerald-800' :
                          c.status === 'Fixed' ? 'bg-cyan-100 text-cyan-800' :
                          c.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                          'bg-amber-100 text-amber-800'
                        }`
                      }, c.status)
                    ]),
                    React.createElement('p', { className: 'font-medium text-stone-800 truncate' }, c.title),
                    React.createElement('div', { className: 'flex justify-between text-[11px] text-stone-400 mt-1 font-mono' }, [
                      React.createElement('span', null, c.category),
                      React.createElement('span', null, `Impact: ${c.impactScore}/100`)
                    ])
                  ])
                )
              )
        ]),

        // Quick Report Button for this location
        onQuickReport && React.createElement('button', {
          onClick: () => onQuickReport(selectedLocation.name),
          className: 'w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-700 to-[#0E2F20] hover:from-emerald-600 hover:to-emerald-800 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/20 active:scale-98 transition-all'
        }, [
          React.createElement(Icon, { name: 'Plus', className: 'w-4 h-4' }),
          `Report Issue at ${selectedLocation.name}`
        ])
      ])
    ])
  ]);
}
