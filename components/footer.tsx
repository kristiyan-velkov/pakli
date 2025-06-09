import { Icon } from "@/components/ui/icon";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-200 mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <Icon name="activity" className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">pakli.com</h3>
                <p className="text-sm text-blue-600 font-medium">
                  Аварии и прекъсвания
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Актуална информация за комунални услуги в София
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Услуги</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <a href="#" className="hover:text-blue-600">
                  Карта на авариите
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-600">
                  Статистики
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-600">
                  Известия
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-600">
                  API достъп
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Контакти</h4>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <Icon name="phone" className="h-4 w-4" />
                <span>0700 10 200</span>
              </div>
              <div className="flex items-center space-x-2">
                <Icon name="mail" className="h-4 w-4" />
                <span>info@pakli.com</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-4">
              Мобилно приложение
            </h4>
            <p className="text-sm text-gray-600 mb-4">Скоро:</p>
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <span>📱</span>
                <span>iOS App</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <span>📱</span>
                <span>Android App</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 mt-8 pt-8 text-center">
          <p className="text-sm text-gray-600">
            © {currentYear} pakli.com. Всички права запазени.
          </p>
        </div>
      </div>
    </footer>
  );
}
