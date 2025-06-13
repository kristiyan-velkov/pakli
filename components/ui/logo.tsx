"use client";

import Link from "next/link";
import { Icon } from "./icon";

export const Logo = () => (
  <Link
    href="/"
    className="flex items-center space-x-4 select-none hover:opacity-80 transition-opacity"
  >
    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-600 shadow-lg">
      <Icon name="droplets" className="w-6 h-6 text-white" />
    </div>
    <div>
      <h1 className="text-2xl font-extrabold text-gray-900">Pakli</h1>
      <p className="text-sm font-semibold text-blue-600 tracking-wide">
        Аварии и прекъсвания
      </p>
    </div>
  </Link>
);

export default Logo;
