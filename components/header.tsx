import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { UserActions } from "@/components/user-actions";

export function Header() {
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <Icon name="droplets" className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Pakli</h1>
              <p className="text-sm text-blue-600 font-medium">
                Аварии и прекъсвания
              </p>
            </div>
          </Link>

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
