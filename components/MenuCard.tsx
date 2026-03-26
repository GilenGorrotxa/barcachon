import { MenuItem, Locale } from "@/lib/types";
import { formatPrice, getItemTranslation } from "@/lib/utils";

interface MenuCardProps {
  item: MenuItem;
  locale: Locale;
}

export function MenuCard({ item, locale }: MenuCardProps) {
  const translation = getItemTranslation(item, locale);

  const renderPrice = () => {
    const { unit, halfPortion, fullPortion, standard } = item.price;

    if (unit && halfPortion && fullPortion) {
      return (
        <span className="text-right whitespace-nowrap">
          {formatPrice(unit)}€ / {formatPrice(halfPortion)}€ /{" "}
          {formatPrice(fullPortion)}€
        </span>
      );
    }

    if (unit && fullPortion) {
      return (
        <span className="text-right whitespace-nowrap">
          {formatPrice(unit)}€ / {formatPrice(fullPortion)}€
        </span>
      );
    }

    if (fullPortion) {
      return (
        <span className="text-right whitespace-nowrap">
          {formatPrice(fullPortion)}€
        </span>
      );
    }

    if (standard) {
      return (
        <span className="text-right whitespace-nowrap">
          {formatPrice(standard)}€
        </span>
      );
    }

    return null;
  };

  return (
    <li className="flex justify-between items-start border-b border-gray-200 py-4 px-2 hover:bg-gray-50 transition-colors">
      <div className="flex-1 pr-4">
        <strong className="block text-base font-semibold text-gray-900">
          {translation.name}
        </strong>
        {translation.description && (
          <span className="block text-sm text-gray-600 mt-1">
            {translation.description}
          </span>
        )}
        {item.allergens && item.allergens.length > 0 && (
          <span className="block text-xs text-gray-400 mt-1 italic">
            Alérgenos: {item.allergens.join(", ")}
          </span>
        )}
      </div>
      <div className="font-bold text-lg text-gray-900">{renderPrice()}</div>
    </li>
  );
}
