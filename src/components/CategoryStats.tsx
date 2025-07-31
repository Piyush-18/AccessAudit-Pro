import React from 'react';
import { Image, FormInput, Navigation, Palette, Type, Shield, Keyboard } from 'lucide-react';
import { CategoryStats as CategoryStatsType } from '../types/accessibility';

interface CategoryStatsProps {
  categories: CategoryStatsType[];
}

const categoryIcons = {
  images: Image,
  forms: FormInput,
  navigation: Navigation,
  colors: Palette,
  typography: Type,
  aria: Shield,
  keyboard: Keyboard,
};

const CategoryStats: React.FC<CategoryStatsProps> = ({ categories }) => {
  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-gray-100">
      <h3 className="text-xl font-bold text-gray-800 mb-6 text-center">
        Issues by Category
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {categories.map((category) => {
          const Icon = categoryIcons[category.category as keyof typeof categoryIcons];
          
          return (
            <div
              key={category.category}
              className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex items-center space-x-3 mb-3">
                <div className={`${category.color} p-2 rounded-lg`}>
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <h4 className="font-semibold text-gray-800 capitalize">
                  {category.category}
                </h4>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total</span>
                  <span className="font-semibold text-gray-800">{category.total}</span>
                </div>
                
                {category.critical > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-red-600">Critical</span>
                    <span className="font-semibold text-red-600">{category.critical}</span>
                  </div>
                )}
                
                {category.moderate > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-yellow-600">Moderate</span>
                    <span className="font-semibold text-yellow-600">{category.moderate}</span>
                  </div>
                )}
                
                {category.minor > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-blue-600">Minor</span>
                    <span className="font-semibold text-blue-600">{category.minor}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryStats;