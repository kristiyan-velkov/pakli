import { Button } from "@/components/ui/button";
import Logo from "@/components/ui/logo";
import RegistrationForm from "@/components/user-login/registration-form";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Registration | Create your account in Pakli",
  authors: [{ name: "Pakli Team", url: "https://pakli.com" }],
  openGraph: {
    title: "Registration | Pakli",
  },
  twitter: {
    title: "Registration | Pakli",
    card: "summary_large_image",
  },
  robots: {
    index: true,
    follow: true,
  },
  appleWebApp: {
    capable: true,
    title: "Registration | Pakli",
    statusBarStyle: "default",
  },
  description: "Create a new account to access all features and services.",
  keywords: "registration, create account, sign up, pakli",
};

export default function SignupPage() {
  return (
    <main className="relative min-h-screen bg-[#fafbfc] flex flex-col">
      <header className="flex justify-between items-center px-8 py-6">
        <div className="flex items-center gap-2">
          <Logo />
        </div>
        <div className="flex items-center gap-4">
          <p className="text-sm hidden md:flex items-center gap-1 bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 bg-clip-text text-transparent font-semibold">
            Вашият надежден източник за аварии и прекъсвания!{" "}
            <ArrowRight className="ml-1 animate-pulse text-black" size={20} />
          </p>
          <Button variant="default" className="text-sm" asChild>
            <Link href="/login">Вход</Link>
          </Button>
        </div>
      </header>

      <section className="flex flex-grow items-center justify-center relative px-4">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-0 left-0 right-0 h-[600px] md:h-[600px] bg-gradient-to-r from-indigo-500 to-pink-500 rounded-t-xl shadow-lg"
          style={{
            clipPath: "polygon(0 40%, 100% 20%, 100% 100%, 0 100%)",
          }}
        ></div>

        <div className="relative z-10 flex flex-col items-center justify-center w-full mx-auto">
          <div className="relative max-w-md w-full p-10 bg-white rounded-xl shadow-2xl">
            <h1 className="text-3xl font-bold mb-10 text-center select-none text-black">
              Регистрация в <strong className="text-blue-600">Pakli.bg</strong>
              <span className="text-sm text-gray-400 block mt-4">
                Най-добрият сайт за следене на аварии и прекъсвания в България
              </span>
            </h1>
            <RegistrationForm />

            <div className="flex-col items-center mt-1 hidden lg:flex">
              <p className="mt-4 text-center text-sm select-none text-gray-600">
                Вече имате акаунт?{" "}
                <Link
                  href="/login"
                  className="text-blue-500 underline hover:text-blue-600 transition-colors duration-200 select-none"
                >
                  Вход
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
