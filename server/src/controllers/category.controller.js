import Category from '../models/Category.js';

export const getCategories = async (req, res, next) => {
  try { res.json({ success: true, categories: await Category.find() }); } catch (err) { next(err); }
};
export const getCategory = async (req, res, next) => {
  try {
    const cat = await Category.findById(req.params.id);
    if (!cat) return res.status(404).json({ success: false, message: 'Category not found' });
    res.json({ success: true, category: cat });
  } catch (err) { next(err); }
};
export const createCategory = async (req, res, next) => {
  try { res.status(201).json({ success: true, category: await Category.create(req.body) }); } catch (err) { next(err); }
};
export const updateCategory = async (req, res, next) => {
  try {
    const cat = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!cat) return res.status(404).json({ success: false, message: 'Category not found' });
    res.json({ success: true, category: cat });
  } catch (err) { next(err); }
};
export const deleteCategory = async (req, res, next) => {
  try { await Category.findByIdAndDelete(req.params.id); res.json({ success: true, message: 'Category deleted' }); } catch (err) { next(err); }
};

