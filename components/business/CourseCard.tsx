'use client';

import React, { useState } from 'react';
import {
  Favorite as HeartIcon,
  FavoriteBorder as HeartOutlineIcon,
  Star as StarIcon,
  Group as GroupIcon,
} from '@mui/icons-material';

export interface Category {
  id: string;
  title: string;
  color: string;
  icon?: React.ReactNode;
}

export interface Course {
  id: number;
  categoryId: string;
  title: string;
  imageUrl: string;
  progress: number;
  rating?: number;
  enrolled?: number;
  blobColor?: string;
  hasLessons?: boolean;
  subtitle?: string;
}

export function CourseCard({ course, category, onLessonsClick }: {
  course: Course;
  category: Category;
  onLessonsClick?: () => void;
}) {
  const [fav, setFav] = useState(false);
  const blob = course.blobColor ?? '#f5d120';
  const hasImage = !!course.imageUrl;

  return (
    <div
      className={`bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col ${course.hasLessons ? 'cursor-pointer hover:-translate-y-1' : ''}`}
      onClick={course.hasLessons ? onLessonsClick : undefined}
    >
      {/* Photo / image area */}
      <div className="relative h-44 bg-gray-50 flex items-end justify-center overflow-hidden">
        {hasImage ? (
          <img src={course.imageUrl} alt={course.title} className="w-full h-full object-cover" />
        ) : (
          <>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-36 h-36 rounded-full opacity-90" style={{ background: blob }} />
            <div className="absolute bottom-0 left-1/2 translate-x-2 w-28 h-28 rounded-full opacity-80" style={{ background: blob === '#f5d120' ? '#1e3a8a' : '#f5d120' }} />
          </>
        )}
        {course.hasLessons && (
          <div className="absolute top-2 right-2 bg-white/90 text-[10px] font-black px-2 py-0.5 rounded-full text-[#7c1535] shadow-sm">
            Ver lecciones →
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col gap-3 flex-1">
        <div className="flex items-start justify-between gap-2">
          <span className="text-left text-blue-700 font-bold text-sm leading-snug underline">
            {course.title}
          </span>
          <button
            onClick={(e) => { e.stopPropagation(); setFav(!fav); }}
            className="shrink-0 mt-0.5 text-blue-300 hover:text-red-400 transition-colors"
          >
            {fav
              ? <HeartIcon sx={{ fontSize: 18 }} className="text-red-400" />
              : <HeartOutlineIcon sx={{ fontSize: 18 }} />}
          </button>
        </div>

        {course.subtitle && (
          <p className="text-xs text-gray-500 leading-relaxed">{course.subtitle}</p>
        )}

        <div>
          <div className="flex justify-between text-[11px] text-gray-400 font-medium mb-1">
            <span>Avance</span><span>{course.progress}%</span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-blue-600 rounded-full" style={{ width: `${course.progress}%` }} />
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap mt-auto">
          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full text-white" style={{ background: category.color }}>
            {category.title}
          </span>
          {course.rating != null && course.rating > 0 && (
            <span className="flex items-center gap-0.5 text-[11px] font-bold text-yellow-500">
              <StarIcon sx={{ fontSize: 13 }} />{course.rating}
            </span>
          )}
          {course.enrolled != null && course.enrolled > 0 && (
            <span className="flex items-center gap-0.5 text-[11px] text-gray-400">
              <GroupIcon sx={{ fontSize: 13 }} />{course.enrolled.toLocaleString()}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
