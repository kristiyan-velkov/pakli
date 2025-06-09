import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";

export function Hero() {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-pink-500 via-purple-500 to-orange-400">
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-pink-500/20 via-purple-500/20 to-orange-400/20" />
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-[90rem] px-4 sm:px-6 lg:px-8">
        <div className="py-24 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-white">
              <h1 className="text-5xl lg:text-7xl font-bold leading-tight mb-8">
                Комунална <span className="block">инфраструктура</span>
                <span className="block">
                  под{" "}
                  <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                    контрол
                  </span>
                </span>
              </h1>

              <p className="text-xl text-white/90 mb-8 leading-relaxed max-w-lg">
                Присъединете се към хилядите жители на София, които използват
                нашата платформа за актуална информация за прекъсвания на вода,
                ток и отопление.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Button className="bg-gray-900 hover:bg-gray-800 text-white px-8 whitespace-nowrap">
                  Започни сега
                  <Icon name="arrow-right" className="ml-2 h-4 w-4" />
                </Button>
              </div>

              <div className="flex items-center gap-2 text-white/80">
                <Icon name="gem" className="h-6 w-6" />
                <span>1 месец безплатни известия за вашия район</span>
              </div>
            </div>

            <div className="relative lg:block hidden">
              <div className="relative">
                <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-6 transform rotate-3 hover:rotate-0 transition-transform duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900">
                      Днешни аварии
                    </h3>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
                      <Icon name="droplets" className="h-5 w-5 text-red-500" />
                      <div>
                        <p className="font-medium text-gray-900">
                          Студентски град
                        </p>
                        <p className="text-sm text-gray-600">
                          Авария на водопровод
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                      <Icon name="zap" className="h-5 w-5 text-yellow-500" />
                      <div>
                        <p className="font-medium text-gray-900">Младост 4</p>
                        <p className="text-sm text-gray-600">
                          Планирано спиране
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="absolute -top-4 -right-4 bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-4 transform -rotate-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">24/7</div>
                    <div className="text-sm text-gray-600">Мониторинг</div>
                  </div>
                </div>

                <div className="absolute -bottom-4 -left-4 bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-4 max-w-xs">
                  <div className="flex items-center gap-2">
                    <Icon name="droplets" className="h-5 w-5 text-red-500" />
                    <span className="text-sm font-medium text-gray-900">
                      Ново известие
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    Авария на водопровод в Дружба 2
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
