const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const Category = require('../models/Category');
const Subcategory = require('../models/Subcategory');

const defaultCategories = [
  {
    name: 'Project',
    color: '#3B82F6',
    icon: 'FolderGit2',
    isDefault: true,
    subcategories: ['Personal', 'Open Source', 'Freelance/Client'],
  },
  {
    name: 'Learning',
    color: '#22C55E',
    icon: 'BookOpen',
    isDefault: true,
    subcategories: ['Course', 'Book', 'Tutorial', 'Article'],
  },
  {
    name: 'Problem Solving',
    color: '#F97316',
    icon: 'Code2',
    isDefault: true,
    subcategories: ['LeetCode', 'GeeksforGeeks', 'HackerRank'],
  },
];

const seedDatabase = async () => {
  const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/skilltrack';
  console.log(`Connecting to MongoDB at: ${mongoURI}`);

  try {
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB successfully.');

    for (const catData of defaultCategories) {
      let category = await Category.findOne({ name: catData.name });
      if (!category) {
        category = await Category.create({
          name: catData.name,
          color: catData.color,
          icon: catData.icon,
          isDefault: catData.isDefault,
        });
        console.log(`Created Category: ${category.name}`);
      } else {
        category.color = catData.color;
        category.icon = catData.icon;
        category.isDefault = catData.isDefault;
        await category.save();
        console.log(`Updated Category: ${category.name}`);
      }

      for (const subName of catData.subcategories) {
        let sub = await Subcategory.findOne({
          name: subName,
          categoryId: category._id,
        });
        if (!sub) {
          sub = await Subcategory.create({
            name: subName,
            categoryId: category._id,
          });
          console.log(`  └─ Created Subcategory: ${sub.name}`);
        } else {
          console.log(`  └─ Existing Subcategory: ${sub.name}`);
        }
      }
    }

    console.log('\n✅ Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding Error:', error);
    process.exit(1);
  }
};

seedDatabase();
