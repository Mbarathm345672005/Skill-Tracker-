const API_BASE = 'http://localhost:5000/api';

async function req(url, options = {}) {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${JSON.stringify(data)}`);
  }
  return data;
}

async function runTests() {
  console.log('🧪 Starting SkillTrack API Verification Test Suite...\n');

  try {
    // 1. Health check
    const health = await req(`${API_BASE}/health`);
    console.log('✅ Health check passed:', health.message);

    // 2. Categories
    const catRes = await req(`${API_BASE}/categories`);
    console.log(`✅ Fetched ${catRes.count} categories.`);
    const problemCategory = catRes.data.find(c => c.name === 'Problem Solving');
    const projectCategory = catRes.data.find(c => c.name === 'Project');
    const learningCategory = catRes.data.find(c => c.name === 'Learning');

    if (!problemCategory || !projectCategory || !learningCategory) {
      throw new Error('Default categories are missing');
    }

    // 3. Subcategories
    const subRes = await req(`${API_BASE}/subcategories?categoryId=${problemCategory._id}`);
    console.log(`✅ Fetched ${subRes.count} subcategories for Problem Solving.`);
    const leetcodeSub = subRes.data.find(s => s.name === 'LeetCode');

    // 4. Create People (handling if they already exist from previous run)
    let alex, maya;
    const peopleList = await req(`${API_BASE}/people`);
    alex = peopleList.data.find(p => p.name === 'Alex Chen');
    if (!alex) {
      const alexRes = await req(`${API_BASE}/people`, {
        method: 'POST',
        body: JSON.stringify({ name: 'Alex Chen' }),
      });
      alex = alexRes.data;
    }
    console.log(`✅ Person verified: ${alex.name} (ID: ${alex._id})`);

    maya = peopleList.data.find(p => p.name === 'Maya Patel');
    if (!maya) {
      const mayaRes = await req(`${API_BASE}/people`, {
        method: 'POST',
        body: JSON.stringify({ name: 'Maya Patel' }),
      });
      maya = mayaRes.data;
    }
    console.log(`✅ Person verified: ${maya.name} (ID: ${maya._id})`);

    // 5. Create Entries for Alex (Consecutive days for streak test)
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const twoDaysAgo = new Date(today);
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

    // Entry 1: Problem Solving (Medium, Two Sum link, Today)
    const entry1Res = await req(`${API_BASE}/entries`, {
      method: 'POST',
      body: JSON.stringify({
        title: 'Solved Two Sum & 3Sum',
        categoryId: problemCategory._id,
        subcategoryId: leetcodeSub?._id,
        personId: alex._id,
        status: 'Done',
        timeSpentMinutes: 60,
        difficulty: 'Medium',
        problemLink: 'https://leetcode.com/problems/two-sum/',
        notes: 'Used hash map for O(n) time complexity.',
        date: today.toISOString(),
      }),
    });
    console.log(`✅ Created Problem Solving Entry with Difficulty & Link: "${entry1Res.data.title}"`);

    // Entry 2: Learning (Yesterday)
    await req(`${API_BASE}/entries`, {
      method: 'POST',
      body: JSON.stringify({
        title: 'Studied React 19 Server Components',
        categoryId: learningCategory._id,
        personId: alex._id,
        status: 'Done',
        timeSpentMinutes: 90,
        date: yesterday.toISOString(),
      }),
    });

    // Entry 3: Project (2 days ago)
    await req(`${API_BASE}/entries`, {
      method: 'POST',
      body: JSON.stringify({
        title: 'Architected SkillTrack Dashboard',
        categoryId: projectCategory._id,
        personId: alex._id,
        status: 'Done',
        timeSpentMinutes: 120,
        date: twoDaysAgo.toISOString(),
      }),
    });

    // Entry 4: Maya entry
    await req(`${API_BASE}/entries`, {
      method: 'POST',
      body: JSON.stringify({
        title: 'Implemented MongoDB Aggregations',
        categoryId: projectCategory._id,
        personId: maya._id,
        status: 'Done',
        timeSpentMinutes: 75,
        date: today.toISOString(),
      }),
    });

    // 6. Test Streak calculation for Alex
    const streakRes = await req(`${API_BASE}/entries/streak/${alex._id}`);
    console.log(`\n🔥 Streak Verification for Alex Chen:`);
    console.log(`   - Current Streak: ${streakRes.data.currentStreak} days`);
    console.log(`   - Longest Streak: ${streakRes.data.longestStreak} days`);
    console.log(`   - Total Active Days: ${streakRes.data.totalActiveDays} days`);

    if (streakRes.data.currentStreak < 3) {
      throw new Error(`Expected streak of at least 3, got ${streakRes.data.currentStreak}`);
    }

    // 7. Test Summary Aggregation
    const summaryRes = await req(`${API_BASE}/entries/summary`);
    console.log(`\n📊 Summary Aggregation Verification:`);
    console.log(`   - Total Entries: ${summaryRes.data.totalEntries}`);
    console.log(`   - Total Time Spent: ${summaryRes.data.totalTimeSpentMinutes} minutes`);
    console.log(`   - Categories active: ${summaryRes.data.categories.length}`);
    console.log(`   - Difficulties count:`, summaryRes.data.difficulties);

    // 8. Test Leaderboard Aggregation
    const leaderboardRes = await req(`${API_BASE}/entries/leaderboard`);
    console.log(`\n🏆 Leaderboard Verification:`);
    leaderboardRes.data.forEach((p, index) => {
      console.log(`   #${index + 1} ${p.name} — ${p.totalEntries} entries, ${p.totalTimeSpentMinutes} mins`);
    });

    console.log('\n🎉 ALL BACKEND API AND AGGREGATION TESTS PASSED PERFECTLY!\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

runTests();
