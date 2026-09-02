const mongoose = require('mongoose');
const Entry = require('../models/Entry');
const Person = require('../models/Person');
const Category = require('../models/Category');

// Helper to construct date filter
const buildDateFilter = (startDate, endDate) => {
  const dateFilter = {};
  if (startDate) {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    dateFilter.$gte = start;
  }
  if (endDate) {
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    dateFilter.$lte = end;
  }
  return Object.keys(dateFilter).length > 0 ? dateFilter : null;
};

// @desc    Get entries with query filters
// @route   GET /api/entries
exports.getEntries = async (req, res, next) => {
  try {
    const { startDate, endDate, categoryIds, personId, status, search, limit, skip } = req.query;
    const filter = {};

    // Date range filter
    const dateQuery = buildDateFilter(startDate, endDate);
    if (dateQuery) {
      filter.date = dateQuery;
    }

    // Person filter
    if (personId && mongoose.Types.ObjectId.isValid(personId)) {
      filter.personId = new mongoose.Types.ObjectId(personId);
    }

    // Status filter
    if (status) {
      filter.status = status;
    }

    // Category IDs filter (comma-separated or single)
    if (categoryIds) {
      const ids = categoryIds.split(',').map((id) => id.trim()).filter((id) => mongoose.Types.ObjectId.isValid(id));
      if (ids.length > 0) {
        filter.categoryId = { $in: ids.map((id) => new mongoose.Types.ObjectId(id)) };
      }
    }

    // Text search on title and notes
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { notes: { $regex: search, $options: 'i' } },
      ];
    }

    const query = Entry.find(filter)
      .populate('categoryId', 'name color icon isDefault')
      .populate('subcategoryId', 'name')
      .populate('personId', 'name')
      .sort({ date: -1, createdAt: -1 });

    if (limit) query.limit(parseInt(limit, 10));
    if (skip) query.skip(parseInt(skip, 10));

    const [entries, total] = await Promise.all([
      query.exec(),
      Entry.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      count: entries.length,
      total,
      data: entries,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single entry
// @route   GET /api/entries/:id
exports.getEntry = async (req, res, next) => {
  try {
    const entry = await Entry.findById(req.params.id)
      .populate('categoryId', 'name color icon isDefault')
      .populate('subcategoryId', 'name')
      .populate('personId', 'name');

    if (!entry) {
      return res.status(404).json({ success: false, error: 'Entry not found' });
    }
    res.status(200).json({ success: true, data: entry });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new entry
// @route   POST /api/entries
exports.createEntry = async (req, res, next) => {
  try {
    const {
      title,
      notes,
      date,
      categoryId,
      subcategoryId,
      personId,
      status,
      timeSpentMinutes,
      difficulty,
      problemLink,
    } = req.body;

    const entry = await Entry.create({
      title,
      notes: notes || '',
      date: date ? new Date(date) : new Date(),
      categoryId,
      subcategoryId: subcategoryId || null,
      personId,
      status: status || 'Done',
      timeSpentMinutes: timeSpentMinutes ? Number(timeSpentMinutes) : 0,
      difficulty: difficulty || null,
      problemLink: problemLink || '',
    });

    const populated = await entry.populate([
      { path: 'categoryId', select: 'name color icon isDefault' },
      { path: 'subcategoryId', select: 'name' },
      { path: 'personId', select: 'name' },
    ]);

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};

// @desc    Update entry
// @route   PUT /api/entries/:id
exports.updateEntry = async (req, res, next) => {
  try {
    const updateFields = { ...req.body };
    if (updateFields.date) {
      updateFields.date = new Date(updateFields.date);
    }
    if (updateFields.timeSpentMinutes !== undefined) {
      updateFields.timeSpentMinutes = Number(updateFields.timeSpentMinutes) || 0;
    }
    if (updateFields.subcategoryId === '' || updateFields.subcategoryId === null) {
      updateFields.subcategoryId = null;
    }
    if (updateFields.difficulty === '') {
      updateFields.difficulty = null;
    }

    const entry = await Entry.findByIdAndUpdate(req.params.id, updateFields, {
      new: true,
      runValidators: true,
    }).populate([
      { path: 'categoryId', select: 'name color icon isDefault' },
      { path: 'subcategoryId', select: 'name' },
      { path: 'personId', select: 'name' },
    ]);

    if (!entry) {
      return res.status(404).json({ success: false, error: 'Entry not found' });
    }
    res.status(200).json({ success: true, data: entry });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete entry
// @route   DELETE /api/entries/:id
exports.deleteEntry = async (req, res, next) => {
  try {
    const entry = await Entry.findById(req.params.id);
    if (!entry) {
      return res.status(404).json({ success: false, error: 'Entry not found' });
    }
    await entry.deleteOne();
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};

// @desc    Aggregation summary for charts and overview
// @route   GET /api/entries/summary
exports.getSummary = async (req, res, next) => {
  try {
    const { startDate, endDate, categoryIds, personId, status } = req.query;
    const match = {};

    const dateQuery = buildDateFilter(startDate, endDate);
    if (dateQuery) {
      match.date = dateQuery;
    }

    if (personId && mongoose.Types.ObjectId.isValid(personId)) {
      match.personId = new mongoose.Types.ObjectId(personId);
    }

    if (status) {
      match.status = status;
    }

    if (categoryIds) {
      const ids = categoryIds.split(',').map((id) => id.trim()).filter((id) => mongoose.Types.ObjectId.isValid(id));
      if (ids.length > 0) {
        match.categoryId = { $in: ids.map((id) => new mongoose.Types.ObjectId(id)) };
      }
    }

    // 1. Total Metrics
    const totalMetricsPromise = Entry.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          totalEntries: { $sum: 1 },
          totalTimeSpentMinutes: { $sum: '$timeSpentMinutes' },
        },
      },
    ]);

    // 2. Breakdown by Category
    const categoryBreakdownPromise = Entry.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$categoryId',
          count: { $sum: 1 },
          totalTimeSpentMinutes: { $sum: '$timeSpentMinutes' },
        },
      },
      {
        $lookup: {
          from: 'categories',
          localField: '_id',
          foreignField: '_id',
          as: 'category',
        },
      },
      { $unwind: '$category' },
      {
        $project: {
          _id: 1,
          name: '$category.name',
          color: '$category.color',
          icon: '$category.icon',
          count: 1,
          totalTimeSpentMinutes: 1,
        },
      },
      { $sort: { count: -1 } },
    ]);

    // 3. Breakdown by Subcategory
    const subcategoryBreakdownPromise = Entry.aggregate([
      { $match: { ...match, subcategoryId: { $ne: null } } },
      {
        $group: {
          _id: {
            subcategoryId: '$subcategoryId',
            categoryId: '$categoryId',
          },
          count: { $sum: 1 },
          totalTimeSpentMinutes: { $sum: '$timeSpentMinutes' },
        },
      },
      {
        $lookup: {
          from: 'subcategories',
          localField: '_id.subcategoryId',
          foreignField: '_id',
          as: 'subcategory',
        },
      },
      { $unwind: '$subcategory' },
      {
        $lookup: {
          from: 'categories',
          localField: '_id.categoryId',
          foreignField: '_id',
          as: 'category',
        },
      },
      { $unwind: '$category' },
      {
        $project: {
          _id: '$_id.subcategoryId',
          name: '$subcategory.name',
          categoryId: '$_id.categoryId',
          categoryName: '$category.name',
          categoryColor: '$category.color',
          count: 1,
          totalTimeSpentMinutes: 1,
        },
      },
      { $sort: { count: -1 } },
    ]);

    // 4. Activity Over Time (Daily timeline)
    const timelinePromise = Entry.aggregate([
      { $match: match },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$date' },
          },
          count: { $sum: 1 },
          totalTimeSpentMinutes: { $sum: '$timeSpentMinutes' },
        },
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          date: '$_id',
          count: 1,
          totalTimeSpentMinutes: 1,
          _id: 0,
        },
      },
    ]);

    // 5. Difficulty breakdown (for Problem Solving)
    const difficultyPromise = Entry.aggregate([
      { $match: { ...match, difficulty: { $in: ['Easy', 'Medium', 'Hard'] } } },
      {
        $group: {
          _id: '$difficulty',
          count: { $sum: 1 },
          totalTimeSpentMinutes: { $sum: '$timeSpentMinutes' },
        },
      },
    ]);

    // 6. Status breakdown
    const statusPromise = Entry.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalTimeSpentMinutes: { $sum: '$timeSpentMinutes' },
        },
      },
    ]);

    const [
      totalMetrics,
      categoryBreakdown,
      subcategoryBreakdown,
      timeline,
      difficultyBreakdown,
      statusBreakdown,
    ] = await Promise.all([
      totalMetricsPromise,
      categoryBreakdownPromise,
      subcategoryBreakdownPromise,
      timelinePromise,
      difficultyPromise,
      statusPromise,
    ]);

    const totals = totalMetrics[0] || { totalEntries: 0, totalTimeSpentMinutes: 0 };

    res.status(200).json({
      success: true,
      data: {
        totalEntries: totals.totalEntries,
        totalTimeSpentMinutes: totals.totalTimeSpentMinutes,
        categories: categoryBreakdown,
        subcategories: subcategoryBreakdown,
        timeline,
        difficulties: difficultyBreakdown.reduce((acc, curr) => {
          acc[curr._id] = curr.count;
          return acc;
        }, { Easy: 0, Medium: 0, Hard: 0 }),
        statuses: statusBreakdown.reduce((acc, curr) => {
          acc[curr._id] = curr.count;
          return acc;
        }, { 'To Do': 0, 'In Progress': 0, 'Done': 0 }),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Leaderboard ranking for people
// @route   GET /api/entries/leaderboard
exports.getLeaderboard = async (req, res, next) => {
  try {
    const { startDate, endDate, categoryIds } = req.query;
    const match = {};

    const dateQuery = buildDateFilter(startDate, endDate);
    if (dateQuery) {
      match.date = dateQuery;
    }

    if (categoryIds) {
      const ids = categoryIds.split(',').map((id) => id.trim()).filter((id) => mongoose.Types.ObjectId.isValid(id));
      if (ids.length > 0) {
        match.categoryId = { $in: ids.map((id) => new mongoose.Types.ObjectId(id)) };
      }
    }

    // Get all people first to include those with 0 entries in the leaderboard
    const allPeople = await Person.find().sort({ name: 1 });

    const personStats = await Entry.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$personId',
          totalEntries: { $sum: 1 },
          totalTimeSpentMinutes: { $sum: '$timeSpentMinutes' },
          lastActiveDate: { $max: '$date' },
        },
      },
    ]);

    const statsMap = new Map();
    personStats.forEach((stat) => {
      statsMap.set(stat._id.toString(), stat);
    });

    const leaderboard = allPeople.map((person) => {
      const stat = statsMap.get(person._id.toString()) || {
        totalEntries: 0,
        totalTimeSpentMinutes: 0,
        lastActiveDate: null,
      };

      return {
        personId: person._id,
        name: person.name,
        totalEntries: stat.totalEntries,
        totalTimeSpentMinutes: stat.totalTimeSpentMinutes,
        lastActiveDate: stat.lastActiveDate,
      };
    });

    // Sort descending by totalEntries, then totalTimeSpentMinutes
    leaderboard.sort((a, b) => {
      if (b.totalEntries !== a.totalEntries) {
        return b.totalEntries - a.totalEntries;
      }
      return b.totalTimeSpentMinutes - a.totalTimeSpentMinutes;
    });

    res.status(200).json({
      success: true,
      count: leaderboard.length,
      data: leaderboard,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Compute consecutive-day activity streak for a person
// @route   GET /api/entries/streak/:personId
exports.getStreak = async (req, res, next) => {
  try {
    const { personId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(personId)) {
      return res.status(400).json({ success: false, error: 'Invalid person ID' });
    }

    const person = await Person.findById(personId);
    if (!person) {
      return res.status(404).json({ success: false, error: 'Person not found' });
    }

    // Fetch all entry dates for this person sorted descending
    const entries = await Entry.find({ personId })
      .select('date')
      .sort({ date: -1 });

    if (!entries || entries.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          personId,
          personName: person.name,
          currentStreak: 0,
          longestStreak: 0,
          totalActiveDays: 0,
          lastActiveDate: null,
        },
      });
    }

    // Extract unique dates in YYYY-MM-DD format (normalized to local/UTC date string)
    const uniqueDateSet = new Set();
    entries.forEach((e) => {
      const d = new Date(e.date);
      const dateString = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      uniqueDateSet.add(dateString);
    });

    const sortedDates = Array.from(uniqueDateSet).sort((a, b) => (a < b ? 1 : -1)); // latest first

    // Helper function to get difference in days
    const diffInDays = (dateStr1, dateStr2) => {
      const d1 = new Date(dateStr1);
      const d2 = new Date(dateStr2);
      const utc1 = Date.UTC(d1.getFullYear(), d1.getMonth(), d1.getDate());
      const utc2 = Date.UTC(d2.getFullYear(), d2.getMonth(), d2.getDate());
      return Math.round((utc1 - utc2) / (1000 * 60 * 60 * 24));
    };

    // Determine today and yesterday strings
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

    let currentStreak = 0;
    const latestDate = sortedDates[0];

    // Check if the streak is active (logged today or yesterday)
    const isTodayLogged = uniqueDateSet.has(todayStr);
    const isYesterdayLogged = uniqueDateSet.has(yesterdayStr);

    if (isTodayLogged || isYesterdayLogged) {
      let checkDate = isTodayLogged ? todayStr : yesterdayStr;
      let checkDateObj = new Date(checkDate);

      for (let i = 0; i < sortedDates.length; i++) {
        const expectedDateStr = `${checkDateObj.getFullYear()}-${String(checkDateObj.getMonth() + 1).padStart(2, '0')}-${String(checkDateObj.getDate()).padStart(2, '0')}`;
        
        if (uniqueDateSet.has(expectedDateStr)) {
          currentStreak++;
          checkDateObj.setDate(checkDateObj.getDate() - 1);
        } else {
          break;
        }
      }
    }

    // Calculate longest streak across all time
    let longestStreak = 0;
    let tempStreak = 0;
    let prevDateStr = null;

    // Iterate through sorted dates (ascending for calculating all-time longest streak)
    const chronologicalDates = [...sortedDates].reverse();
    for (const dStr of chronologicalDates) {
      if (!prevDateStr) {
        tempStreak = 1;
      } else {
        const gap = diffInDays(dStr, prevDateStr);
        if (gap === 1) {
          tempStreak++;
        } else if (gap > 1) {
          tempStreak = 1;
        }
      }
      if (tempStreak > longestStreak) {
        longestStreak = tempStreak;
      }
      prevDateStr = dStr;
    }

    res.status(200).json({
      success: true,
      data: {
        personId,
        personName: person.name,
        currentStreak,
        longestStreak: Math.max(longestStreak, currentStreak),
        totalActiveDays: uniqueDateSet.size,
        lastActiveDate: latestDate,
      },
    });
  } catch (error) {
    next(error);
  }
};
