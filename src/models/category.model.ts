import mongoose, { Schema, Document, Model } from 'mongoose';
import { ICategory } from '../types';

export interface CategoryDocument extends Omit<ICategory, '_id'>, Document {}

const categorySchema = new Schema<CategoryDocument>(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      unique: true,
      trim: true,
      minlength: [1, 'Name must be at least 1 character'],
      maxlength: [50, 'Name must not exceed 50 characters'],
    },
    color: {
      type: String,
      default: '#6366f1',
      trim: true,
      match: [/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/, 'Color must be a valid hex color'],
    },
    icon: {
      type: String,
      default: '📁',
      trim: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

categorySchema.index({ name: 1 }, { unique: true });

const Category: Model<CategoryDocument> = mongoose.model<CategoryDocument>(
  'Category',
  categorySchema,
);

export default Category;
