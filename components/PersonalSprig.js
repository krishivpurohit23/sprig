// ==========================================
// PERSONAL SPRIG BOTANICAL COMPONENT
// ==========================================

import { Icon } from '../icons.js';
import { PLANT_STAGES, getPlantStage } from '../intelligence.js';

export function PersonalSprig({ student, onWater, isGrowingAnimation = false, lastAward = null }) {
  const [isWatering, setIsWatering] = React.useState(false);
  const currentStage = getPlantStage(student.sprigPoints);
  const nextStage = PLANT_STAGES.find(s => s.stage === currentStage.stage + 1);

  // Calculate percentage within current stage bracket
  const stageMin = currentStage.minPoints;
  const stageMax = nextStage ? nextStage.minPoints : 600;
  const progressPercent = nextStage 
    ? Math.min(100, Math.max(8, Math.round(((student.sprigPoints - stageMin) / (stageMax - stageMin)) * 100)))
    : 100;

  const handleWaterClick = () => {
    setIsWatering(true);
    if (onWater) onWater();
    setTimeout(() => setIsWatering(false), 1400);
  };

  return React.createElement('div', {
    className: 'relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#123824] via-[#0E2F20] to-[#0A2217] p-7 text-white shadow-2xl border border-emerald-800/40'
  }, [
    // Ambient botanical background glow & foliage accents
    React.createElement('div', {
      key: 'glow',
      className: 'absolute -right-16 -top-16 w-64 h-64 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none'
    }),
    React.createElement('div', {
      key: 'glow2',
      className: 'absolute -left-12 -bottom-12 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl pointer-events-none'
    }),

    // Top Header info
    React.createElement('div', {
      key: 'header',
      className: 'relative z-10 flex flex-wrap items-center justify-between gap-4 border-b border-emerald-800/40 pb-5'
    }, [
      React.createElement('div', { key: 'title-block' }, [
        React.createElement('div', { className: 'flex items-center gap-2 mb-1' }, [
          React.createElement('span', { className: 'px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' },
            `Stage ${currentStage.stage} of 5`
          ),
          React.createElement('span', { className: 'text-xs text-emerald-200/60 font-medium' },
            'Living Digital Organism'
          )
        ]),
        React.createElement('h3', { className: 'text-2xl font-bold tracking-tight text-white flex items-center gap-2' }, [
          'Personal Sprig',
          React.createElement('span', { className: 'text-emerald-400 font-serif italic text-lg' }, `— ${currentStage.name}`)
        ]),
        React.createElement('p', { className: 'text-xs text-emerald-100/70 mt-0.5 max-w-md' },
          currentStage.description
        )
      ]),

      // Stats Pill
      React.createElement('div', {
        key: 'stats-pill',
        className: 'flex items-center gap-3 bg-black/25 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-emerald-500/20'
      }, [
        React.createElement('div', { className: 'text-right' }, [
          React.createElement('div', { className: 'text-xs uppercase tracking-wider text-emerald-300/80 font-bold' }, 'Sprig Points'),
          React.createElement('div', { className: 'text-2xl font-extrabold text-amber-400 leading-none font-mono' }, student.sprigPoints)
        ]),
        React.createElement('div', { className: 'w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-emerald-400 flex items-center justify-center text-forest-900 shadow-md shadow-amber-500/20' },
          React.createElement(Icon, { name: 'Sprout', className: 'w-6 h-6 text-[#0A2217]' })
        )
      ])
    ]),

    // Center Stage Botanical Canvas
    React.createElement('div', {
      key: 'plant-canvas',
      className: 'relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 py-6'
    }, [
      // Illustrated SVG Plant Frame
      React.createElement('div', {
        key: 'illustration-box',
        className: 'relative w-full md:w-1/2 flex flex-col items-center justify-center min-h-[260px]'
      }, [
        // Water droplets animation
        isWatering && React.createElement('div', {
          key: 'water-drops',
          className: 'absolute inset-0 pointer-events-none flex justify-center items-center'
        }, [
          React.createElement('div', { className: 'animate-bounce text-cyan-400 flex flex-col items-center gap-1 -translate-y-8' }, [
            React.createElement(Icon, { name: 'Droplets', className: 'w-8 h-8 animate-pulse text-cyan-300' }),
            React.createElement('span', { className: 'text-xs font-bold text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded-full border border-cyan-400/30' }, '+ Hydrated!')
          ])
        ]),

        // Stage Point Award Banner overlay if triggered
        lastAward && React.createElement('div', {
          key: 'award-overlay',
          className: 'absolute -top-2 bg-gradient-to-r from-amber-400 to-emerald-400 text-forest-950 px-4 py-1.5 rounded-full font-bold text-sm shadow-xl animate-bounce flex items-center gap-1.5 border border-white/50 z-20'
        }, [
          React.createElement(Icon, { name: 'Sparkles', className: 'w-4 h-4 text-emerald-950' }),
          `+${lastAward} Sprig Points`
        ]),

        // Handcrafted Stage-by-Stage Vector Plant Graphic
        React.createElement('div', {
          key: 'svg-plant-container',
          className: `transition-transform duration-700 ${isWatering ? 'scale-105' : 'hover:scale-102'}`
        }, renderPlantSVG(currentStage.stage, isWatering))
      ]),

      // Right: Progression Meter & Nurture Controls
      React.createElement('div', {
        key: 'controls-box',
        className: 'w-full md:w-1/2 flex flex-col justify-center space-y-5 bg-black/20 p-5 rounded-2xl border border-emerald-800/30'
      }, [
        // Progress to Next Stage
        React.createElement('div', { key: 'progress-box' }, [
          React.createElement('div', { className: 'flex justify-between items-center text-xs font-semibold mb-2 text-emerald-200' }, [
            React.createElement('span', null, nextStage ? `Progress to ${nextStage.name}` : 'Max Stage Reached!'),
            React.createElement('span', { className: 'font-mono text-amber-300 font-bold' },
              nextStage ? `${student.sprigPoints} / ${nextStage.minPoints} pts` : 'Flourishing Master'
            )
          ]),
          React.createElement('div', { className: 'w-full h-3 bg-emerald-950/80 rounded-full overflow-hidden p-0.5 border border-emerald-700/40' },
            React.createElement('div', {
              className: 'h-full bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300 rounded-full transition-all duration-1000 ease-out shadow-sm shadow-emerald-400/50',
              style: { width: `${progressPercent}%` }
            })
          ),
          React.createElement('div', { className: 'flex justify-between text-[11px] text-emerald-300/60 mt-1 font-mono' }, [
            React.createElement('span', null, `${currentStage.name} (${currentStage.minPoints}p)`),
            nextStage ? React.createElement('span', null, `${nextStage.name} (${nextStage.minPoints}p)`) : React.createElement('span', null, 'Campus Legend')
          ])
        ]),

        // Anti-Spam Gamification Notice (as strictly mandated in Section 2)
        React.createElement('div', {
          key: 'anti-spam-rule',
          className: 'flex items-start gap-2.5 p-3 rounded-xl bg-emerald-900/30 border border-emerald-500/20 text-xs text-emerald-100/90 leading-relaxed'
        }, [
          React.createElement(Icon, { name: 'Leaf', className: 'w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5' }),
          React.createElement('div', null, [
            React.createElement('span', { className: 'font-semibold text-emerald-300' }, 'Anti-Spam Gamification Rule: '),
            'Your plant grows primarily from ',
            React.createElement('strong', { className: 'text-amber-300' }, 'verified Good Deeds (+30 pts)'),
            ', resolution confirmations, and high-impact actions. Spamming reports will not nurture your plant.'
          ])
        ]),

        // Interactive Nurture Controls
        React.createElement('div', {
          key: 'action-row',
          className: 'flex items-center gap-3 pt-1'
        }, [
          React.createElement('button', {
            key: 'water-btn',
            onClick: handleWaterClick,
            disabled: isWatering,
            className: 'flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-medium text-xs bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white shadow-lg shadow-emerald-600/30 active:scale-95 transition-all disabled:opacity-50'
          }, [
            React.createElement(Icon, { name: 'Droplet', className: 'w-4 h-4 text-cyan-200' }),
            isWatering ? 'Hydrating Soil...' : 'Nurture with Water'
          ]),
          React.createElement('div', {
            key: 'water-streak',
            className: 'flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-950/60 border border-emerald-700/30 text-xs text-emerald-200'
          }, [
            React.createElement(Icon, { name: 'Flame', className: 'w-4 h-4 text-amber-400' }),
            React.createElement('span', { className: 'font-bold text-amber-300 font-mono' }, `${student.streakDays}d`),
            React.createElement('span', { className: 'text-[11px] text-emerald-400/80' }, 'Streak')
          ])
        ])
      ])
    ])
  ]);
}

// Custom Hand-crafted Botanical SVG Generator for 5 Distinct Evolution Stages
function renderPlantSVG(stage = 1, isWatering = false) {
  const swayClass = isWatering ? 'animate-pulse' : 'sprig-sway';

  // Base Pot & Soil dimensions
  const potBase = `
    <!-- Ceramic Terracotta Planter -->
    <defs>
      <linearGradient id="potGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#C27A4E" />
        <stop offset="50%" stop-color="#9A562D" />
        <stop offset="100%" stop-color="#6F3919" />
      </linearGradient>
      <linearGradient id="soilGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#4A3324" />
        <stop offset="100%" stop-color="#261A12" />
      </linearGradient>
      <linearGradient id="leafGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#34D399" />
        <stop offset="100%" stop-color="#059669" />
      </linearGradient>
      <linearGradient id="leafGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#6EE7B7" />
        <stop offset="100%" stop-color="#10B981" />
      </linearGradient>
      <filter id="glowFilter" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="3" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>
    <!-- Pot Saucer & Body -->
    <ellipse cx="120" cy="225" rx="46" ry="7" fill="#4B2713" opacity="0.4" />
    <path d="M85 185 L95 220 C95 224 145 224 145 220 L155 185 Z" fill="url(#potGrad)" />
    <!-- Pot Rim -->
    <ellipse cx="120" cy="185" rx="38" ry="7" fill="#B46D43" />
    <ellipse cx="120" cy="184" rx="34" ry="5.5" fill="url(#soilGrad)" />
    <!-- Sprig Emblem on Pot -->
    <circle cx="120" cy="204" r="7" fill="#2E1C11" opacity="0.6" />
    <path d="M120 200 C122 203 124 204 125 206 C122 206 120 204 120 200 Z" fill="#34D399" />
  `;

  let foliage = '';

  if (stage === 1) {
    // STAGE 1: SEED (0–49 pts)
    foliage = `
      <!-- Emerging Seed & Cotyledon -->
      <g class="${swayClass}">
        <!-- Tiny brown seed kernel in soil -->
        <ellipse cx="120" cy="181" rx="6" ry="4" fill="#6B4F35" stroke="#3A281A" stroke-width="1" />
        <!-- Micro green sprout tip -->
        <path d="M120 180 Q122 172 124 165" stroke="#34D399" stroke-width="2.5" stroke-linecap="round" fill="none" />
        <path d="M124 165 C129 161 133 166 128 170 C125 171 123 167 124 165 Z" fill="url(#leafGrad2)" />
      </g>
    `;
  } else if (stage === 2) {
    // STAGE 2: SPROUT (50–149 pts)
    foliage = `
      <!-- Emergent Sprout with Twin Cotyledons -->
      <g class="${swayClass}">
        <!-- Tender green stem -->
        <path d="M120 182 Q118 160 120 145 Q121 135 120 125" stroke="#10B981" stroke-width="3.5" stroke-linecap="round" fill="none" />
        <!-- Left Leaf -->
        <path d="M120 145 C105 138 98 148 108 156 C115 160 119 148 120 145 Z" fill="url(#leafGrad1)" />
        <path d="M120 145 Q111 150 108 154" stroke="#047857" stroke-width="1" fill="none" />
        <!-- Right Leaf -->
        <path d="M120 135 C136 128 144 139 133 147 C126 150 121 138 120 135 Z" fill="url(#leafGrad2)" />
        <path d="M120 135 Q129 140 133 145" stroke="#047857" stroke-width="1" fill="none" />
        <!-- Crown Bud -->
        <circle cx="120" cy="123" r="3.5" fill="#6EE7B7" />
      </g>
    `;
  } else if (stage === 3) {
    // STAGE 3: YOUNG PLANT (150–299 pts)
    foliage = `
      <!-- Multi-branched Young Plant with Lush Canopy -->
      <g class="${swayClass}">
        <!-- Main Central Stem -->
        <path d="M120 182 Q117 155 120 130 Q122 105 120 85" stroke="#059669" stroke-width="4.5" stroke-linecap="round" fill="none" />
        
        <!-- Lower Left Branch -->
        <path d="M119 155 Q100 150 90 140" stroke="#059669" stroke-width="3" stroke-linecap="round" fill="none" />
        <path d="M90 140 C75 130 72 145 84 152 C94 157 91 143 90 140 Z" fill="url(#leafGrad1)" />
        <path d="M96 148 C85 142 80 152 92 158 Z" fill="url(#leafGrad2)" />

        <!-- Lower Right Branch -->
        <path d="M121 145 Q138 140 148 132" stroke="#059669" stroke-width="3" stroke-linecap="round" fill="none" />
        <path d="M148 132 C164 122 168 138 155 146 C145 150 147 136 148 132 Z" fill="url(#leafGrad2)" />
        <path d="M140 138 C155 132 160 142 148 148 Z" fill="url(#leafGrad1)" />

        <!-- Mid Canopy Leaves -->
        <path d="M120 115 C102 105 102 120 114 126 Z" fill="url(#leafGrad2)" />
        <path d="M121 110 C138 100 140 115 128 122 Z" fill="url(#leafGrad1)" />

        <!-- Crown Apex Cluster -->
        <path d="M120 85 C110 65 130 65 120 85 Z" fill="url(#leafGrad2)" />
        <path d="M120 85 C105 75 115 95 120 85 Z" fill="url(#leafGrad1)" />
        <circle cx="120" cy="80" r="3" fill="#FBBF24" />
      </g>
    `;
  } else if (stage === 4) {
    // STAGE 4: GROWING SPRIG (300–499 pts)
    foliage = `
      <!-- Thriving Large Botanical Sprig -->
      <g class="${swayClass}">
        <!-- Sturdy Woody Trunk -->
        <path d="M120 182 Q115 150 120 115 Q123 85 120 55" stroke="#374151" stroke-width="6" stroke-linecap="round" fill="none" />
        <path d="M120 182 Q116 150 120 115" stroke="#065F46" stroke-width="4.5" stroke-linecap="round" fill="none" />

        <!-- Sprawling Outer Branches -->
        <path d="M118 140 Q90 135 75 115" stroke="#065F46" stroke-width="3.5" fill="none" />
        <path d="M122 130 Q150 125 168 105" stroke="#065F46" stroke-width="3.5" fill="none" />
        <path d="M119 95 Q95 85 82 65" stroke="#065F46" stroke-width="3" fill="none" />
        <path d="M121 90 Q145 80 158 60" stroke="#065F46" stroke-width="3" fill="none" />

        <!-- Lush Leaf Masses (SVG Clusters) -->
        <!-- Left Canopy -->
        <circle cx="75" cy="115" r="16" fill="url(#leafGrad1)" opacity="0.9" />
        <circle cx="68" cy="105" r="13" fill="url(#leafGrad2)" />
        <circle cx="85" cy="110" r="12" fill="url(#leafGrad1)" />

        <!-- Right Canopy -->
        <circle cx="168" cy="105" r="16" fill="url(#leafGrad2)" opacity="0.9" />
        <circle cx="175" cy="95" r="13" fill="url(#leafGrad1)" />
        <circle cx="158" cy="100" r="12" fill="url(#leafGrad2)" />

        <!-- Upper Canopy -->
        <circle cx="82" cy="65" r="15" fill="url(#leafGrad2)" />
        <circle cx="158" cy="60" r="15" fill="url(#leafGrad1)" />
        <circle cx="120" cy="50" r="18" fill="url(#leafGrad2)" />
        <circle cx="120" cy="40" r="14" fill="url(#leafGrad1)" />

        <!-- Golden Nectar Buds -->
        <circle cx="120" cy="42" r="3.5" fill="#F59E0B" filter="url(#glowFilter)" />
        <circle cx="72" cy="102" r="3" fill="#F59E0B" />
        <circle cx="165" cy="92" r="3" fill="#F59E0B" />
      </g>
    `;
  } else {
    // STAGE 5: FLOURISHING SPRIG (500+ pts) - Blossoming Masterwork
    foliage = `
      <!-- Regal Flourishing Botanical Masterwork with Blossoms & Aura -->
      <g class="${swayClass}">
        <!-- Spiritual Radiance Aura -->
        <circle cx="120" cy="95" r="70" fill="#34D399" opacity="0.12" filter="url(#glowFilter)" />

        <!-- Majestic Trunk -->
        <path d="M120 182 Q114 140 120 100 Q124 65 120 40" stroke="#1F2937" stroke-width="7" stroke-linecap="round" fill="none" />
        <path d="M120 182 Q115 140 120 100" stroke="#047857" stroke-width="5" stroke-linecap="round" fill="none" />

        <!-- Wide Majestic Boughs -->
        <path d="M117 135 Q70 125 55 95" stroke="#065F46" stroke-width="4.5" fill="none" />
        <path d="M123 125 Q170 115 185 85" stroke="#065F46" stroke-width="4.5" fill="none" />
        <path d="M118 85 Q80 70 65 45" stroke="#065F46" stroke-width="3.5" fill="none" />
        <path d="M122 80 Q160 65 175 40" stroke="#065F46" stroke-width="3.5" fill="none" />

        <!-- Grand Emerald Canopy Cloud -->
        <circle cx="55" cy="95" r="18" fill="url(#leafGrad1)" />
        <circle cx="48" cy="85" r="15" fill="url(#leafGrad2)" />
        <circle cx="68" cy="90" r="14" fill="url(#leafGrad1)" />

        <circle cx="185" cy="85" r="18" fill="url(#leafGrad2)" />
        <circle cx="195" cy="75" r="15" fill="url(#leafGrad1)" />
        <circle cx="175" cy="80" r="14" fill="url(#leafGrad2)" />

        <circle cx="65" cy="45" r="16" fill="url(#leafGrad2)" />
        <circle cx="175" cy="40" r="16" fill="url(#leafGrad1)" />
        <circle cx="120" cy="35" r="22" fill="url(#leafGrad2)" />
        <circle cx="120" cy="25" r="16" fill="url(#leafGrad1)" />

        <!-- Blossoming Pink & Gold Flowers -->
        <!-- Center Blossom -->
        <circle cx="120" cy="28" r="4.5" fill="#F472B6" />
        <circle cx="120" cy="28" r="2" fill="#FEF08A" />
        <!-- Left Blossom -->
        <circle cx="50" cy="82" r="4.5" fill="#F472B6" />
        <circle cx="50" cy="82" r="2" fill="#FEF08A" />
        <!-- Right Blossom -->
        <circle cx="190" cy="72" r="4.5" fill="#F472B6" />
        <circle cx="190" cy="72" r="2" fill="#FEF08A" />
        <!-- Upper Left -->
        <circle cx="68" cy="42" r="4" fill="#F472B6" />
        <circle cx="68" cy="42" r="1.8" fill="#FEF08A" />
        <!-- Upper Right -->
        <circle cx="172" cy="36" r="4" fill="#F472B6" />
        <circle cx="172" cy="36" r="1.8" fill="#FEF08A" />

        <!-- Floating Pollen Spores / Fireflies -->
        <circle cx="100" cy="50" r="1.5" fill="#FDE047" opacity="0.9" />
        <circle cx="140" cy="55" r="1.8" fill="#FDE047" opacity="0.9" />
        <circle cx="85" cy="80" r="1.5" fill="#FDE047" opacity="0.8" />
        <circle cx="155" cy="75" r="1.5" fill="#FDE047" opacity="0.8" />
      </g>
    `;
  }

  return React.createElement('svg', {
    viewBox: '0 0 240 240',
    className: 'w-56 h-56 drop-shadow-2xl',
    dangerouslySetInnerHTML: { __html: potBase + foliage }
  });
}
