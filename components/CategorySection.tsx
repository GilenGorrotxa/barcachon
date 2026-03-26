"use client";

import { MenuItem, Locale, MenuCategory } from "@/lib/types";
import {
  formatPrice,
  getItemTranslation,
  getCategoryTranslation,
} from "@/lib/utils";
import { MenuCard } from "./MenuCard";

interface CategorySectionProps {
  category: MenuCategory;
  items: MenuItem[];
  locale: Locale;
  showSubtitle?: string;
}

export function CategorySection({
  category,
  items,
  locale,
  showSubtitle,
}: CategorySectionProps) {
  const categoryName = getCategoryTranslation(category, locale);

  if (items.length === 0) return null;

  return (
    <section id={category.id} className="mb-12 scroll-mt-24">
      <div className="text-center mb-6">
        <h2 className="text-2xl md:text-3xl font-bold tracking-wider uppercase mb-2">
          {category.icon} {categoryName}
        </h2>
        {showSubtitle && (
          <p className="text-sm md:text-base text-blue-600 font-medium">
            {showSubtitle}
          </p>
        )}
      </div>

      <ul className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm border border-gray-200">
        {items.map((item) => (
          <MenuCard key={item.id} item={item} locale={locale} />
        ))}
      </ul>
    </section>
  );
}
