import Link from "next/link";
import { UserActions } from "@/components/user-actions";
import Logo from "./ui/logo";

export function Header() {

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Logo />

          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href="/"
              className="text-gray-700 hover:text-blue-600 font-medium"
            >
              Начало
            </Link>
            <Link
              href="/statistics"
              className="text-gray-700 hover:text-blue-600 font-medium"
            >
              Статистики
            </Link>
            <Link
              href="/about-us"
              className="text-gray-700 hover:text-blue-600 font-medium"
            >
              За нас
            </Link>
            <Link
              href="/contacts"
              className="text-gray-700 hover:text-blue-600 font-medium"
            >
              Контакти
            </Link>
          </nav>
          <UserActions />
        </div>
      </div>
    </header>
  );
}
