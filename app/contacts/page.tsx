import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Icon } from "@/components/ui/icon";

export default function ContactsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Свържете се с нас
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Имате въпроси или предложения? Не се колебайте да се свържете с нас.
            Ние сме тук, за да ви помогнем!
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Contact Info */}
          <div className="bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">
              Контактна информация
            </h2>

            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <Icon name="mail" className="h-6 w-6 text-blue-600 mt-1" />
                <div>
                  <h3 className="font-medium text-gray-900">Електронна поща</h3>
                  <p className="text-gray-600">info@pakli.com</p>
                  <p className="text-gray-600">support@pakli.com</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <Icon name="map-pin" className="h-6 w-6 text-blue-600 mt-1" />
                <div>
                  <h3 className="font-medium text-gray-900">Адрес</h3>
                  <p className="text-gray-600">София, България</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <Icon name="clock" className="h-6 w-6 text-blue-600 mt-1" />
                <div>
                  <h3 className="font-medium text-gray-900">Работно време</h3>
                  <p className="text-gray-600">
                    Понеделник - Петък: 9:00 - 18:00
                  </p>
                  <p className="text-gray-600">
                    Събота - Неделя: 10:00 - 16:00
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">
              Изпратете съобщение
            </h2>

            <form className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="firstName"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Име
                  </label>
                  <Input id="firstName" placeholder="Вашето име" />
                </div>
                <div>
                  <label
                    htmlFor="lastName"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Фамилия
                  </label>
                  <Input id="lastName" placeholder="Вашата фамилия" />
                </div>
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Електронна поща
                </label>
                <Input id="email" type="email" placeholder="your@email.com" />
              </div>

              <div>
                <label
                  htmlFor="subject"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Тема
                </label>
                <Input id="subject" placeholder="Темата на съобщението" />
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Съобщение
                </label>
                <Textarea
                  id="message"
                  rows={5}
                  placeholder="Вашето съобщение..."
                />
              </div>

              <Button type="submit" className="w-full">
                Изпрати съобщение
              </Button>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
