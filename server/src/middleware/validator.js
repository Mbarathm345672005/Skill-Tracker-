const { z } = require('zod');

const validate = (schema) => (req, res, next) => {
  try {
    schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      const issues = error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join(', ');
      return res.status(400).json({
        success: false,
        error: issues,
        details: error.issues,
      });
    }
    next(error);
  }
};

const categorySchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Category name is required').trim(),
    color: z.string().regex(/^#([0-9a-fA-F]{3}){1,2}$/, 'Invalid color hex code').optional(),
    icon: z.string().optional(),
    isDefault: z.boolean().optional(),
  }),
});

const subcategorySchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Subcategory name is required').trim(),
    categoryId: z.string().min(1, 'Category ID is required'),
  }),
});

const personSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Person name is required').trim(),
  }),
});

const entrySchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required').trim(),
    notes: z.string().optional().nullable(),
    date: z.string().or(z.date()).optional(),
    categoryId: z.string().min(1, 'Category ID is required'),
    subcategoryId: z.string().optional().nullable(),
    personId: z.string().min(1, 'Person ID is required'),
    status: z.enum(['To Do', 'In Progress', 'Done']).optional(),
    timeSpentMinutes: z.number().nonnegative('Time spent cannot be negative').optional(),
    difficulty: z.enum(['Easy', 'Medium', 'Hard']).optional().nullable().or(z.literal('')),
    problemLink: z.string().url('Invalid URL format for problem link').optional().nullable().or(z.literal('')),
  }),
});

module.exports = {
  validate,
  categorySchema,
  subcategorySchema,
  personSchema,
  entrySchema,
};
