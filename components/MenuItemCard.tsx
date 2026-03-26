/**
 * Componente para mostrar un item del menú con su precio
 */

"use client";

import { MenuItem, Locale } from "@/lib/types/menu.types";
import {
  getItemName,
  getItemDescription,
  getPriceDisplay,
} from "@/lib/menu-utils";

interface MenuItemCardProps {
  item: MenuItem;
  locale: Locale;
}

export function MenuItemCard({ item, locale }: MenuItemCardProps) {
  const name = getItemName(item, locale);
  const description = getItemDescription(item, locale);
  const priceDisplay = getPriceDisplay(item.pricing, locale);
  const extras = item.translations[locale]?.extras;

  return (
    <div className="border-b border-gray-200 py-4 last:border-b-0">
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gray-900 mb-1">{name}</h3>
          {description && (
            <p className="text-sm text-gray-600 mb-1">{description}</p>
          )}
          {extras && <p className="text-sm text-blue-600">{extras}</p>}
        </div>
        <div className="text-right self-end">
          <p className="font-medium text-gray-900 whitespace-nowrap">
            {priceDisplay}
          </p>
        </div>
      </div>
    </div>
  );
}
