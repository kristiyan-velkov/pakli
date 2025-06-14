import Link from "next/link";
import React, { FC, memo } from "react";

interface NavItem {
  href: string;
  label: string;
}

const navItems: NavItem[] = [
  { href: "/", label: "Начало" },
  //   { href: "/statistics", label: "Статистики" },
  { href: "/about-us", label: "За нас" },
  { href: "/contacts", label: "Контакти" },
];

const Navigation: FC = () => (
  <nav
    className="hidden md:flex items-center space-x-8"
    aria-label="Main navigation"
  >
    {navItems.map(({ href, label }) => (
      <Link
        key={href}
        href={href}
        className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200"
        aria-current={href === "/" ? "page" : undefined}
      >
        {label}
      </Link>
    ))}
  </nav>
);

export default memo(Navigation);
