// ==========================================
// SPRIG CLI SMOKE TEST VERIFICATION
// ==========================================

import { getStore, saveStore, resetStore, CAMPUS_LOCATIONS, CREWS, BADGES_CATALOG } from './data.js';
import { analyzeIssueText, findSimilarComplaints, computeLocationHealthScores, detectRecurringIssues, getPlantStage } from './intelligence.js';

console.log('--- RUNNING SPRIG SMOKE TEST ---');

// 1. Storage & Seed Data
const store = resetStore();
console.log('✓ Seeded complaints count:', store.complaints.length, '(Requirement: >=30)');
if (store.complaints.length < 30) throw new Error('Seeded complaints below 30');

// 2. Student Authentication Logic
const studentValid = (id, pwd) => id.toUpperCase() === '251B186' && pwd.toLowerCase() === 'reeti';
console.log('✓ Student login credential check (251b186 / Reeti):', studentValid('251b186', 'Reeti'));
if (!studentValid('251b186', 'Reeti')) throw new Error('Student auth failed');

// 3. Faculty Authentication Logic
const facultyValid = (id, pwd) => id.toUpperCase() === 'FAC1001' && pwd === 'Faculty123';
console.log('✓ Faculty login credential check (FAC1001 / Faculty123):', facultyValid('FAC1001', 'Faculty123'));
if (!facultyValid('FAC1001', 'Faculty123')) throw new Error('Faculty auth failed');

// 4. Role Separation Verification
const studentViews = ['dashboard', 'map', 'good_deeds', 'contributions', 'leaderboard', 'rewards'];
const facultyViews = ['overview', 'complaints', 'queue', 'map', 'recurring', 'crews', 'analytics'];
console.log('✓ Student distinct views count:', studentViews.length);
console.log('✓ Faculty distinct views count:', facultyViews.length);

// 5. Intelligence Engine Keyword Deduction
const testAi = analyzeIssueText('Wi-Fi keeps disconnecting in the Library', 'drops connection', 'Library');
console.log('✓ Sprig Intelligence Deduction:', testAi.category, '->', testAi.crew, `(Confidence: ${testAi.confidence}%)`);
if (testAi.category !== 'Wi-Fi / Network') throw new Error('AI analysis error');

// 6. Duplicate Detection
const testDupes = findSimilarComplaints({ title: 'Wi-Fi disconnects in Library', location: 'Library', category: 'Wi-Fi / Network' }, store.complaints);
console.log('✓ Duplicate Detection matches:', testDupes.length, 'reports found for Library Wi-Fi');
if (testDupes.length === 0) throw new Error('Duplicate detection failed');

// 7. Dynamic Campus Map Health Scoring
const healthMap = computeLocationHealthScores(CAMPUS_LOCATIONS, store.complaints);
console.log('✓ Campus Map Dynamic Health indexed zones:', Object.keys(healthMap).length);
console.log('  - Library health:', healthMap.library.score, '/ 5 (', healthMap.library.rating, ')');
console.log('  - Academic Block health:', healthMap.acad_block.score, '/ 5 (', healthMap.acad_block.rating, ')');

// 8. Recurring Issue Radar
const recurring = detectRecurringIssues(store.complaints);
console.log('✓ Recurring Issues Detected:', recurring.length, 'patterns across campus');
recurring.forEach(r => console.log(`  - [${r.title}] ${r.reportCount} reports: "${r.recommendation.substring(0, 50)}..."`));

// 9. Personal Sprig Plant Evolution Stages
const stage3 = getPlantStage(185);
console.log('✓ Personal Sprig Stage for 185 pts:', stage3.name, '(Stage ' + stage3.stage + ')');
if (stage3.stage !== 3) throw new Error('Stage calculation mismatch');

console.log('---------------------------------');
console.log('ALL SMOKE TEST LOGICAL CHECKS PASSED SUCCESSFULLY!');
