import { UserActions } from "@/components/user-actions";
import Logo from "./ui/logo";
import Navigation from "./navigation";

export function Header() {
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Logo />
          <Navigation />
          <UserActions />
        </div>
      </div>
    </header>
  );
}
