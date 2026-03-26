/**
 * Componente para mostrar una categoría como botón negro
 */

import Link from "next/link";

interface CategoryButtonProps {
  href: string;
  title: string;
  icon?: string;
}

export function CategoryButton({ href, title, icon }: CategoryButtonProps) {
  return (
    <Link
      href={href}
      className="block w-full rounded-sm bg-black text-white text-center py-3 px-2 text-sm hover:bg-gray-800 transition-colors"
    >
      {icon && <span className="mr-2">{icon}</span>}
      {title}
    </Link>
  );
}
