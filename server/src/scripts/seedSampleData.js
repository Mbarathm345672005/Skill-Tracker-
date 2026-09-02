const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const Category = require('../models/Category');
const Subcategory = require('../models/Subcategory');
const Person = require('../models/Person');
const Entry = require('../models/Entry');

const seedSampleData = async () => {
  const mongoURI = process.env.MONGO_URI;
  console.log(`Connecting to MongoDB Atlas...`);

  try {
    await mongoose.connect(mongoURI);
    console.log('Connected successfully.\n');

    // 1. Fetch categories
    const problemCat = await Category.findOne({ name: 'Problem Solving' });
    const projectCat = await Category.findOne({ name: 'Project' });
    const learningCat = await Category.findOne({ name: 'Learning' });

    if (!problemCat || !projectCat || !learningCat) {
      console.error('Categories not found. Please run "npm run seed" first.');
      process.exit(1);
    }

    // 2. Fetch subcategories
    const leetcodeSub = await Subcategory.findOne({ name: 'LeetCode', categoryId: problemCat._id });
    const personalSub = await Subcategory.findOne({ name: 'Personal', categoryId: projectCat._id });
    const openSourceSub = await Subcategory.findOne({ name: 'Open Source', categoryId: projectCat._id });
    const courseSub = await Subcategory.findOne({ name: 'Course', categoryId: learningCat._id });
    const bookSub = await Subcategory.findOne({ name: 'Book', categoryId: learningCat._id });

    // 3. Create or find People
    const peopleNames = ['Barath M', 'Alex Chen', 'Maya Patel'];
    const peopleMap = {};

    for (const name of peopleNames) {
      let p = await Person.findOne({ name });
      if (!p) {
        p = await Person.create({ name });
        console.log(`👤 Created Person: ${p.name}`);
      } else {
        console.log(`👤 Found Person: ${p.name}`);
      }
      peopleMap[name] = p;
    }

    // 4. Sample entries with dates
    const now = new Date();
    const d0 = new Date(now); // Today
    const d1 = new Date(now); d1.setDate(d1.getDate() - 1); // Yesterday
    const d2 = new Date(now); d2.setDate(d2.getDate() - 2); // 2 days ago
    const d3 = new Date(now); d3.setDate(d3.getDate() - 3); // 3 days ago
    const d4 = new Date(now); d4.setDate(d4.getDate() - 4); // 4 days ago

    const sampleEntries = [
      // Barath M (4-day active streak)
      {
        personId: peopleMap['Barath M']._id,
        categoryId: problemCat._id,
        subcategoryId: leetcodeSub?._id,
        title: 'Solved Two Sum & 3Sum',
        difficulty: 'Medium',
        problemLink: 'https://leetcode.com/problems/two-sum/',
        notes: 'Optimized hash map lookups with O(n) runtime.',
        timeSpentMinutes: 60,
        status: 'Done',
        date: d0,
      },
      {
        personId: peopleMap['Barath M']._id,
        categoryId: projectCat._id,
        subcategoryId: personalSub?._id,
        title: 'Built SkillTrack Full-Stack MERN Application',
        notes: 'Implemented REST endpoints, MongoDB aggregations, and responsive React dashboard.',
        timeSpentMinutes: 180,
        status: 'Done',
        date: d0,
      },
      {
        personId: peopleMap['Barath M']._id,
        categoryId: learningCat._id,
        subcategoryId: courseSub?._id,
        title: 'Mastered React 19 Server Components & Hooks',
        notes: 'Learned useActionState, optimistic updates, and streaming SSR.',
        timeSpentMinutes: 90,
        status: 'Done',
        date: d1,
      },
      {
        personId: peopleMap['Barath M']._id,
        categoryId: problemCat._id,
        subcategoryId: leetcodeSub?._id,
        title: 'Solved Valid Anagram & Group Anagrams',
        difficulty: 'Easy',
        problemLink: 'https://leetcode.com/problems/valid-anagram/',
        notes: 'Categorized strings by character count frequency arrays.',
        timeSpentMinutes: 45,
        status: 'Done',
        date: d2,
      },
      {
        personId: peopleMap['Barath M']._id,
        categoryId: learningCat._id,
        subcategoryId: bookSub?._id,
        title: 'Read System Design Interview Guide (Ch 1-3)',
        notes: 'Scaling databases, load balancers, and CDN caching patterns.',
        timeSpentMinutes: 75,
        status: 'Done',
        date: d3,
      },

      // Alex Chen
      {
        personId: peopleMap['Alex Chen']._id,
        categoryId: projectCat._id,
        subcategoryId: openSourceSub?._id,
        title: 'Contributed PR to Open Source Tailwind Component Library',
        notes: 'Added accessible dialog modal with focus trapping.',
        timeSpentMinutes: 120,
        status: 'Done',
        date: d0,
      },
      {
        personId: peopleMap['Alex Chen']._id,
        categoryId: problemCat._id,
        subcategoryId: leetcodeSub?._id,
        title: 'Solved Trapping Rain Water',
        difficulty: 'Hard',
        problemLink: 'https://leetcode.com/problems/trapping-rain-water/',
        notes: 'Used two-pointer approach to compute trapped water volume in O(1) space.',
        timeSpentMinutes: 80,
        status: 'Done',
        date: d1,
      },

      // Maya Patel
      {
        personId: peopleMap['Maya Patel']._id,
        categoryId: learningCat._id,
        subcategoryId: courseSub?._id,
        title: 'Completed Full-Stack TypeScript Certification Course',
        notes: 'Generics, utility types, and strict type safety across full-stack apps.',
        timeSpentMinutes: 110,
        status: 'Done',
        date: d0,
      },
      {
        personId: peopleMap['Maya Patel']._id,
        categoryId: problemCat._id,
        subcategoryId: leetcodeSub?._id,
        title: 'Solved Best Time to Buy and Sell Stock',
        difficulty: 'Easy',
        problemLink: 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock/',
        notes: 'Single-pass sliding window tracking minimum price.',
        timeSpentMinutes: 30,
        status: 'Done',
        date: d1,
      },
    ];

    for (const entry of sampleEntries) {
      const exists = await Entry.findOne({
        title: entry.title,
        personId: entry.personId,
      });

      if (!exists) {
        await Entry.create(entry);
        console.log(`📝 Added Entry: "${entry.title}"`);
      } else {
        console.log(`📝 Existing Entry: "${entry.title}"`);
      }
    }

    console.log('\n🎉 Successfully populated sample people & entries in MongoDB Atlas!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding sample data:', error);
    process.exit(1);
  }
};

seedSampleData();
