// ==========================================
// CAMPUS BALANCE (STUDENT-ONLY COLLABORATIVE EQUILIBRIUM)
// ==========================================

import { Icon } from '../icons.js';

export function CampusBalance({ complaints }) {
  // Total reported vs total resolved
  const totalReported = complaints.length;
  const totalResolved = complaints.filter(c => c.status === 'Closed' || c.status === 'Fixed').length;
  const totalOpen = complaints.filter(c => c.status !== 'Closed' && c.status !== 'Fixed').length;

  // Equilibrium ratio: 50% is dead center.
  // If resolution rate is high, knot shifts toward Faculty/Fixers.
  // If open issues pile up, knot shifts toward Students.
  let ratio = totalReported > 0 ? (totalResolved / totalReported) : 0.5;
  // Map ratio (0 to 1) to knot position percentage (20% to 80%)
  const knotPercent = Math.min(82, Math.max(18, Math.round(20 + ratio * 60)));

  const isBalanced = Math.abs(knotPercent - 50) <= 8;
  const resolutionAdvantage = knotPercent > 58;

  return React.createElement('div', {
    className: 'relative overflow-hidden rounded-3xl bg-white p-6 shadow-xl border border-stone-200/80'
  }, [
    // Header
    React.createElement('div', {
      key: 'hdr',
      className: 'flex flex-wrap items-center justify-between gap-3 mb-5 border-b border-stone-100 pb-4'
    }, [
      React.createElement('div', null, [
        React.createElement('div', { className: 'flex items-center gap-2 mb-1' }, [
          React.createElement('span', { className: 'px-2 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800' },
            'Harmonic Metric'
          ),
          React.createElement('span', { className: 'text-xs text-stone-500 font-medium' },
            'Campus Feedback Loop'
          )
        ]),
        React.createElement('h3', { className: 'text-xl font-extrabold text-[#0E2F20] flex items-center gap-2' }, [
          'CAMPUS BALANCE',
          React.createElement('span', { className: 'text-xs px-2 py-0.5 rounded-md bg-stone-100 text-stone-600 font-normal font-mono' },
            isBalanced ? 'Equilibrium Active' : resolutionAdvantage ? 'Resolution Momentum' : 'Needs Vigilance'
          )
        ])
      ]),

      React.createElement('div', { className: 'flex items-center gap-4 text-xs font-mono' }, [
        React.createElement('div', { className: 'text-right' }, [
          React.createElement('span', { className: 'text-stone-400 block text-[10px] uppercase font-sans' }, 'Reported'),
          React.createElement('span', { className: 'font-bold text-amber-600 text-base' }, totalReported)
        ]),
        React.createElement('div', { className: 'text-right' }, [
          React.createElement('span', { className: 'text-stone-400 block text-[10px] uppercase font-sans' }, 'Resolved'),
          React.createElement('span', { className: 'font-bold text-emerald-600 text-base' }, totalResolved)
        ]),
        React.createElement('div', { className: 'text-right' }, [
          React.createElement('span', { className: 'text-stone-400 block text-[10px] uppercase font-sans' }, 'Active In Flight'),
          React.createElement('span', { className: 'font-bold text-blue-600 text-base' }, totalOpen)
        ])
      ])
    ]),

    // Collaborative Rope Graphic
    React.createElement('div', {
      key: 'rope-box',
      className: 'py-4 px-2'
    }, [
      // Top labels
      React.createElement('div', { className: 'flex justify-between items-center text-xs font-bold text-stone-700 mb-3 px-1' }, [
        React.createElement('div', { className: 'flex items-center gap-2 text-stone-800' }, [
          React.createElement('span', { className: 'text-lg' }, '👨🎓'),
          React.createElement('span', { className: 'tracking-wide' }, 'STUDENTS (Observations)'),
          React.createElement('span', { className: 'text-[11px] font-mono text-stone-400' }, `(${totalReported})`)
        ]),
        React.createElement('div', { className: 'flex items-center gap-2 text-stone-800' }, [
          React.createElement('span', { className: 'text-[11px] font-mono text-stone-400' }, `(${totalResolved})`),
          React.createElement('span', { className: 'tracking-wide' }, 'FACULTY / FIXERS (Resolutions)'),
          React.createElement('span', { className: 'text-lg' }, '👩💼')
        ])
      ]),

      // The Collaborative Rope track
      React.createElement('div', { className: 'relative w-full h-8 flex items-center' }, [
        // Braided Rope Line
        React.createElement('div', {
          className: 'w-full h-3.5 rounded-full bg-gradient-to-r from-amber-200 via-stone-300 to-emerald-300 shadow-inner border border-stone-300 relative overflow-hidden'
        }, [
          // Center mark
          React.createElement('div', { className: 'absolute left-1/2 top-0 bottom-0 w-0.5 bg-stone-500/40 -translate-x-1/2' })
        ]),

        // Interactive Moving Knot & Ribbon
        React.createElement('div', {
          className: 'absolute top-1/2 -translate-y-1/2 -translate-x-1/2 transition-all duration-1000 ease-out z-10 flex flex-col items-center pointer-events-none',
          style: { left: `${knotPercent}%` }
        }, [
          // Floating knot indicator
          React.createElement('div', {
            className: 'w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-emerald-500 shadow-lg border-2 border-white flex items-center justify-center text-white font-bold text-xs shadow-stone-400/50'
          }, '🪢'),
          // Indicator arrow
          React.createElement('span', { className: 'text-[10px] font-mono font-bold text-stone-700 bg-white/95 px-2 py-0.5 rounded-full shadow border border-stone-200 mt-1' },
            `${Math.round(ratio * 100)}% Res.`
          )
        ])
      ]),

      // Left vs Right Guide Labels
      React.createElement('div', { className: 'flex justify-between items-center text-[11px] text-stone-400 font-mono mt-4 px-1' }, [
        React.createElement('span', null, '← Open Issues Rising'),
        React.createElement('span', { className: 'font-sans font-semibold text-stone-600' }, '50% Healthy Equilibrium'),
        React.createElement('span', null, 'Successful Fixes Ahead →')
      ])
    ]),

    // Friendly collaborative explanation footer
    React.createElement('div', {
      key: 'footer-note',
      className: 'mt-4 pt-3 border-t border-stone-100 flex items-center gap-2 text-xs text-stone-500'
    }, [
      React.createElement(Icon, { name: 'Heart', className: 'w-4 h-4 text-emerald-600 flex-shrink-0' }),
      React.createElement('p', null,
        '"Campus health improves when observation and resolution stay in balance. This is a collaborative partnership between active students and university fixers."'
      )
    ])
  ]);
}
