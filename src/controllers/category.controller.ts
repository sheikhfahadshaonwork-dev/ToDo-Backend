import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import Category from '../models/category.model';
import Todo from '../models/todo.model';
import { CreateCategoryBody, UpdateCategoryBody } from '../types';

export async function listCategories(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const categories = await Category.find().sort({ name: 1 }).lean();
    res.status(200).json({ success: true, data: categories });
  } catch (error) {
    next(error);
  }
}

export async function createCategory(
  req: Request<object, object, CreateCategoryBody>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const category = await Category.create(req.body);
    res.status(201).json({ success: true, data: category });
  } catch (error) {
    next(error);
  }
}

export async function getCategory(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      res.status(400).json({ success: false, message: 'Invalid category id' });
      return;
    }

    const category = await Category.findById(req.params.id).lean();
    if (!category) {
      res.status(404).json({ success: false, message: 'Category not found' });
      return;
    }

    res.status(200).json({ success: true, data: category });
  } catch (error) {
    next(error);
  }
}

export async function updateCategory(
  req: Request<{ id: string }, object, UpdateCategoryBody>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      res.status(400).json({ success: false, message: 'Invalid category id' });
      return;
    }

    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true },
    ).lean();

    if (!category) {
      res.status(404).json({ success: false, message: 'Category not found' });
      return;
    }

    res.status(200).json({ success: true, data: category });
  } catch (error) {
    next(error);
  }
}

export async function deleteCategory(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      res.status(400).json({ success: false, message: 'Invalid category id' });
      return;
    }

    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
      res.status(404).json({ success: false, message: 'Category not found' });
      return;
    }

    // Remove categoryId references from all todos that used this category
    await Todo.updateMany(
      { categoryId: req.params.id },
      { $unset: { categoryId: '' } },
    );

    res.status(200).json({
      success: true,
      message: 'Category deleted successfully',
    });
  } catch (error) {
    next(error);
  }
}
