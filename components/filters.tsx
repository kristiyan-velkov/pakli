"use client";

import type React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter, RotateCcw } from "lucide-react";
import { useAppStore } from "@/lib/store";

export function Filters() {
  const {
    filters,
    setSearchQuery,
    setSelectedService,
    setSelectedCategory,
    setSelectedType,
    resetFilters,
    applyFilters,
  } = useAppStore();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    applyFilters();
  };

  const handleServiceChange = (value: string) => {
    setSelectedService(value);
    applyFilters();
  };

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    applyFilters();
  };

  const handleTypeChange = (value: string) => {
    setSelectedType(value);
    applyFilters();
  };

  const handleResetFilters = () => {
    resetFilters();
    applyFilters();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-gradient-to-r from-gray-50 to-white rounded-2xl border border-gray-200 p-6 shadow-sm"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-100 rounded-xl">
          <Filter className="h-5 w-5 text-blue-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">
          Търсене и филтри
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {/* Search Input */}
        <div className="relative group lg:col-span-2 xl:col-span-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 transition-colors group-focus-within:text-blue-500" />
          <Input
            placeholder="Търси по район или улица..."
            value={filters.searchQuery}
            onChange={handleSearchChange}
            className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-xl bg-white/80 backdrop-blur-sm transition-all duration-300 hover:bg-white focus:bg-white"
          />
        </div>

        {/* Service Filter */}
        <Select
          value={filters.selectedService}
          onValueChange={handleServiceChange}
        >
          <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-xl bg-white/80 backdrop-blur-sm transition-all duration-300 hover:bg-white focus:bg-white">
            <SelectValue placeholder="Всички услуги" />
          </SelectTrigger>
          <SelectContent className="rounded-xl border-gray-200 shadow-lg">
            <SelectItem value="all" className="rounded-lg">
              Всички услуги
            </SelectItem>
            <SelectItem value="water" className="rounded-lg">
              💧 Вода
            </SelectItem>
            <SelectItem value="electricity" className="rounded-lg">
              ⚡ Ток
            </SelectItem>
            <SelectItem value="heating" className="rounded-lg">
              🔥 Топлофикация
            </SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.selectedCategory}
          onValueChange={handleCategoryChange}
        >
          <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-xl bg-white/80 backdrop-blur-sm transition-all duration-300 hover:bg-white focus:bg-white">
            <SelectValue placeholder="Всички категории" />
          </SelectTrigger>
          <SelectContent className="rounded-xl border-gray-200 shadow-lg">
            <SelectItem value="all" className="rounded-lg">
              Всички категории
            </SelectItem>
            <SelectItem value="emergency" className="rounded-lg">
              🚨 Аварийни
            </SelectItem>
            <SelectItem value="scheduled" className="rounded-lg">
              🔧 Планирани
            </SelectItem>
          </SelectContent>
        </Select>

        {/* Type Filter */}
        <Select value={filters.selectedType} onValueChange={handleTypeChange}>
          <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-xl bg-white/80 backdrop-blur-sm transition-all duration-300 hover:bg-white focus:bg-white">
            <SelectValue placeholder="Всички типове" />
          </SelectTrigger>
          <SelectContent className="rounded-xl border-gray-200 shadow-lg">
            <SelectItem value="all" className="rounded-lg">
              Всички типове
            </SelectItem>
            <SelectItem value="emergency" className="rounded-lg">
              🚨 Аварийни
            </SelectItem>
            <SelectItem value="scheduled" className="rounded-lg">
              📅 Планирани
            </SelectItem>
          </SelectContent>
        </Select>

        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            variant="outline"
            onClick={handleResetFilters}
            className="w-full border-gray-300 hover:border-gray-400 hover:bg-gray-50 rounded-xl bg-white/80 backdrop-blur-sm transition-all duration-300 flex items-center justify-center gap-2 group"
          >
            <RotateCcw className="h-4 w-4 transition-transform group-hover:rotate-180 duration-300" />
            <span className="hidden sm:inline">Нулирай</span>
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
}
