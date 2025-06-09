import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-24">
          <div className="text-center">
            <Badge className="mb-6 bg-white/20 text-white border-white/30 hover:bg-white/30">
              🚀 Иновативна платформа
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
              За Pakli.com
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
              Революционна платформа за мониторинг на комунални услуги в
              България 🇧🇬
            </p>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-blue-50 to-transparent"></div>
      </section>

      {/* Stats Section */}
      <section className="py-16 -mt-10 relative z-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { number: "24/7", label: "Мониторинг", icon: "⏰" },
              { number: "100+", label: "Района", icon: "🏘️" },
              { number: "5000+", label: "Потребители", icon: "👥" },
              { number: "99.9%", label: "Точност", icon: "🎯" },
            ].map((stat, index) => (
              <Card
                key={index}
                className="text-center p-6 bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
              >
                <CardContent className="p-0">
                  <div className="text-3xl mb-2">{stat.icon}</div>
                  <div className="text-3xl font-bold text-blue-600 mb-1">
                    {stat.number}
                  </div>
                  <div className="text-gray-600 font-medium">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
            <div>
              <Badge className="mb-4 bg-blue-100 text-blue-700 border-blue-200">
                🎯 Нашата мисия
              </Badge>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Обединяваме информацията за{" "}
                <span className="text-blue-600">комунални услуги</span>
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed mb-6">
                Pakli.com е създадена с цел да обедини информацията за аварии и
                прекъсвания на комуналните услуги в София на едно място.
                Предоставяме лесен достъп до актуални данни за всички важни
                услуги.
              </p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  "💧 Водоснабдяване",
                  "⚡ Електричество",
                  "🔥 Газоснабдяване",
                  "📡 Интернет",
                ].map((service, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-2 text-gray-700"
                  >
                    <span className="text-lg">{service.split(" ")[0]}</span>
                    <span className="font-medium">
                      {service.split(" ").slice(1).join(" ")}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-blue-400 to-purple-500 rounded-2xl p-8 text-white shadow-2xl">
                <h3 className="text-2xl font-bold mb-4">
                  3D Интерактивна карта
                </h3>
                <p className="text-blue-100 mb-6">
                  Използваме най-новите технологии за визуализация на данните в
                  реално време
                </p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-white/20 rounded-lg p-3">
                    <div className="font-semibold">Google Maps 3D</div>
                    <div className="text-blue-100">Реални сгради</div>
                  </div>
                  <div className="bg-white/20 rounded-lg p-3">
                    <div className="font-semibold">Real-time</div>
                    <div className="text-blue-100">Актуални данни</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 mb-20">
            {[
              {
                icon: "📊",
                title: "Статистика и анализи",
                description:
                  "Подробни анализи и статистики за всички прекъсвания във вашия район и на национално ниво.",
                color: "from-green-400 to-blue-500",
              },
              {
                icon: "👤",
                title: "Персонализирани акаунти",
                description:
                  "Създайте акаунт за персонализирани известия и проследяване на авариите във вашия район.",
                color: "from-purple-400 to-pink-500",
              },
              {
                icon: "🔔",
                title: "Известия в реално време",
                description:
                  "Получавайте моментални известия за нови аварии и възстановяване на услугите.",
                color: "from-orange-400 to-red-500",
              },
            ].map((feature, index) => (
              <Card
                key={index}
                className="group hover:shadow-2xl transition-all duration-300 hover:scale-105 border-0 overflow-hidden"
              >
                <div className={`h-2 bg-gradient-to-r ${feature.color}`}></div>
                <CardContent className="p-8">
                  <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Info Note */}
          <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200 shadow-lg">
            <CardContent className="p-8">
              <div className="flex items-start space-x-4">
                <div className="text-3xl">ℹ️</div>
                <div>
                  <h3 className="text-xl font-bold text-amber-800 mb-3">
                    Бележка относно информацията
                  </h3>
                  <p className="text-amber-700 leading-relaxed">
                    Информацията на Pakli.com се събира директно от официалните
                    уебсайтове на съответните комунални доставчици. Ние се
                    стремим да предоставим най-актуалната и точна информация, за
                    да можете да планирате ежедневието си без излишни
                    неудобства.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
}
