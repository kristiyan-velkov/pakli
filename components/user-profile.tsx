"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Settings,
  LogOut,
  MapPin,
  Bell,
  Mail,
  CheckCircle,
  UserCog,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAppStore, User } from "@/lib/store";
import { sofiaDistrictNames } from "@/constants/sofiaDistricts";
import { deleteUser } from "@/app/actions/user/deleteUser";
import { logout } from "@/app/actions/user/logout";

interface UserProfileProps {
  user: User;
}

export default function UserProfile({ user }: Readonly<UserProfileProps>) {
  const [showSettings, setShowSettings] = useState(false);
  const [formData, setFormData] = useState(user);
  const [loading, setLoading] = useState(false);
  const setUser = useAppStore((state) => state.setUser);

  const [userSubscription, setUserSubscription] = useState<any>(null);

  useEffect(() => {
    const savedSubscription = localStorage.getItem(
      "sofia-utility-subscription"
    );
    if (savedSubscription) {
      setUserSubscription(JSON.parse(savedSubscription));
    }
  }, []);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleLogout = async () => {
    try {
      await logout();
      setUser(null);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleSave = async () => {
    setLoading(true);

    await new Promise((resolve) => setTimeout(resolve, 1000));

    localStorage.setItem("sofia-utility-user", JSON.stringify(formData));

    setLoading(false);
    setShowSettings(false);
  };

  const handleDelete = async () => {
    if (
      !confirm(
        "Сигурни ли сте, че искате да изтриете профила си? Това действие е необратимо."
      )
    ) {
      return;
    }
    setLoading(true);
    try {
      if (!user.id) {
        alert("Профилът не е валиден за изтриване");
        return;
      }
      await deleteUser(user.id);
      setShowSettings(false);
    } catch (err) {
      alert("Грешка при изтриване на профила");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="rounded-full hover:bg-gray-200/50 transition-colors bg-white  font-semibold">
                <UserCog />
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <div className="flex items-center justify-start gap-2 p-2">
            <div className="flex flex-col space-y-1 leading-none">
              <p className="font-medium">{user.name}</p>
              <p className="w-[200px] truncate text-sm text-muted-foreground">
                {user.email}
              </p>
              <p className="text-xs text-muted-foreground">
                Квартал: {user.district}
              </p>
            </div>
          </div>
          <DropdownMenuItem onClick={() => setShowSettings(true)}>
            <Settings className="mr-2 h-4 w-4" />
            <span>Настройки</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Изход</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Настройки на профила
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="profile-name">Име</Label>
              <Input
                id="profile-name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="profile-email">Имейл</Label>
              <Input
                id="profile-email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="profile-address">Адрес</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="profile-address"
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="profile-district">Квартал</Label>
              <Select
                value={formData.district}
                onValueChange={(value) => handleInputChange("district", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sofiaDistrictNames.map((district) => (
                    <SelectItem key={district} value={district}>
                      {district}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3 pt-4 border-t">
              <h4 className="font-medium">Настройки за известия</h4>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="profile-notifications"
                  checked={formData.notifications}
                  onCheckedChange={(checked) =>
                    handleInputChange("notifications", checked as boolean)
                  }
                />
                <Label
                  htmlFor="profile-notifications"
                  className="text-sm flex items-center gap-2"
                >
                  <Bell className="h-4 w-4" />
                  Известия в сайта за аварии в моя квартал
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="profile-email-notifications"
                  checked={formData.emailNotifications}
                  onCheckedChange={(checked) =>
                    handleInputChange("emailNotifications", checked as boolean)
                  }
                />
                <Label
                  htmlFor="profile-email-notifications"
                  className="text-sm flex items-center gap-2"
                >
                  <Mail className="h-4 w-4" />
                  Известия по имейл за аварии в моя квартал
                </Label>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t">
              <h4 className="font-medium">Абонамент за известия</h4>

              {userSubscription?.active ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-green-800">
                        Активен абонамент
                      </span>
                    </div>
                    <Badge className="bg-green-600">1 лв/месец</Badge>
                  </div>
                  <div className="text-xs text-gray-600 space-y-1">
                    <p>
                      Валиден до:{" "}
                      {new Date(userSubscription.expiresAt).toLocaleDateString(
                        "bg-BG"
                      )}
                    </p>
                    <p>
                      Платежен метод:{" "}
                      {userSubscription.paymentMethod === "epay"
                        ? "ePay.bg"
                        : "Банкова карта"}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-red-600 hover:text-red-700"
                    onClick={() => {
                      localStorage.removeItem("sofia-utility-subscription");
                      setUserSubscription(null);
                    }}
                  >
                    Отмени абонамента
                  </Button>
                </div>
              ) : (
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800 mb-2">
                    Няма активен абонамент
                  </p>
                  <p className="text-xs text-blue-600 mb-3">
                    Активирайте известията за 1 лв месечно
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                onClick={handleSave}
                disabled={loading}
                className="flex-1"
              >
                {loading ? "Запазване..." : "Запази промените"}
              </Button>
              <Button
                variant="outline"
                onClick={handleDelete}
                disabled={loading}
                className="text-red-600 border-red-600 hover:bg-red-600 hover:text-white"
              >
                Изтрийй профила
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
