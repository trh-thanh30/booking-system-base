"use client";

import { useState, useMemo, useEffect } from "react";
import { Search, ChevronDown, Map, List, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { RepeatReveal } from "@/src/components/motion/RepeatReveal";
import { WEBSITE_TEMPLATES } from "../home.constants";
import { toast } from "sonner";

interface MarketplaceProps {
  activeTemplateIdx: number;
  setActiveTemplateIdx: (idx: number) => void;
  customBusinessName: string;
}

// Approximate coordinate percentages on the custom SVG map & distances from London
const CITY_COORDS: Record<
  string,
  { mapX: number; mapY: number; distFromLondon: number }
> = {
  "London, UK": { mapX: 47.5, mapY: 28, distFromLondon: 0 },
  "Manchester, UK": { mapX: 46.5, mapY: 26, distFromLondon: 260 },
  "Brighton, UK": { mapX: 47.5, mapY: 29, distFromLondon: 80 },
  "Edinburgh, UK": { mapX: 46, mapY: 24, distFromLondon: 530 },
  "Dublin, IE": { mapX: 45, mapY: 27, distFromLondon: 470 },
  "Birmingham, UK": { mapX: 47, mapY: 27, distFromLondon: 160 },
  "Paris, FR": { mapX: 48.5, mapY: 30, distFromLondon: 340 },
  "Amsterdam, NL": { mapX: 49, mapY: 28, distFromLondon: 360 },
  "Berlin, DE": { mapX: 51, mapY: 28, distFromLondon: 930 },
  "Madrid, ES": { mapX: 47, mapY: 35, distFromLondon: 1260 },
  "Toronto, CA": { mapX: 23, mapY: 33, distFromLondon: 5700 },
  "Vancouver, CA": { mapX: 13, mapY: 31, distFromLondon: 7600 },
  "Seattle, US": { mapX: 14.5, mapY: 32, distFromLondon: 7800 },
  "New York, US": { mapX: 27, mapY: 36, distFromLondon: 5570 },
  "Boston, US": { mapX: 27.5, mapY: 35, distFromLondon: 5270 },
  "Tokyo, JP": { mapX: 84, mapY: 36, distFromLondon: 9560 },
  "Singapore, SG": { mapX: 75, mapY: 55, distFromLondon: 10880 },
  "Sydney, AU": { mapX: 86, mapY: 72, distFromLondon: 17000 },
  "Cape Town, ZA": { mapX: 53, mapY: 73, distFromLondon: 9660 },
  "Online / Remote": { mapX: 50, mapY: 50, distFromLondon: 0 },
};

// 20 Mock Marketplace Listings from service-discovery.html
const MARKETPLACE_LISTINGS = [
  {
    id: 2,
    name: "Glow & Co. Salon",
    initials: "GC",
    av: "av-pink",
    pin: "pin-pink",
    category: "Beauty",
    desc: "Premium hair styling, manicures and facial therapies.",
    location: "London, UK",
    price: 25,
    availability: "Available today",
    tag: "verified",
    tagLabel: "Verified",
  },
  {
    id: 3,
    name: "Brighton Beauty Bar",
    initials: "BB",
    av: "av-pink",
    pin: "pin-pink",
    category: "Beauty",
    desc: "Coastal-inspired treatments, lashes and brow design.",
    location: "Brighton, UK",
    price: 45,
    availability: "Bookings open",
    tag: "verified",
    tagLabel: "Verified",
  },
  {
    id: 4,
    name: "Manchester Glow",
    initials: "MG",
    av: "av-pink",
    pin: "pin-pink",
    category: "Beauty",
    desc: "Hair color, balayage and styling in the Northern Quarter.",
    location: "Manchester, UK",
    price: 55,
    availability: "Walk-ins welcome",
    tag: "new",
    tagLabel: "New",
  },
  {
    id: 5,
    name: "Dr. Sarah's Dental",
    initials: "DS",
    av: "av-green",
    pin: "pin-green",
    category: "Healthcare",
    desc: "General dentistry, cleanings and emergency oral care.",
    location: "Seattle, US",
    price: 80,
    availability: "Next opening today",
    tag: "verified",
    tagLabel: "Verified",
  },
  {
    id: 6,
    name: "London Wellness Clinic",
    initials: "LW",
    av: "av-green",
    pin: "pin-green",
    category: "Healthcare",
    desc: "Physiotherapy, sports rehab and acupuncture.",
    location: "London, UK",
    price: 95,
    availability: "Next opening today",
    tag: "verified",
    tagLabel: "Verified",
  },
  {
    id: 7,
    name: "Apex Fitness Studio",
    initials: "AF",
    av: "av-purple",
    pin: "pin-purple",
    category: "Fitness",
    desc: "1-on-1 personal training, strength coaching and yoga.",
    location: "Sydney, AU",
    price: 45,
    availability: "Classes this week",
    tag: "new",
    tagLabel: "New",
  },
  {
    id: 8,
    name: "Birmingham Strength Lab",
    initials: "BS",
    av: "av-purple",
    pin: "pin-purple",
    category: "Fitness",
    desc: "Powerlifting coaching and Olympic weightlifting classes.",
    location: "Birmingham, UK",
    price: 40,
    availability: "New slots",
    tag: "verified",
    tagLabel: "Verified",
  },
  {
    id: 9,
    name: "Paris Yoga Collective",
    initials: "PY",
    av: "av-purple",
    pin: "pin-purple",
    category: "Fitness",
    desc: "Vinyasa, yin and prenatal yoga in central Paris.",
    location: "Paris, FR",
    price: 28,
    availability: "Drop-in classes",
    tag: "verified",
    tagLabel: "Verified",
  },
  {
    id: 10,
    name: "Zenith Coaching",
    initials: "ZC",
    av: "av-blue",
    pin: "pin-blue",
    category: "Consulting",
    desc: "Business strategy, legal advisory and growth coaching.",
    location: "New York, US",
    price: 120,
    availability: "Online sessions",
    tag: "verified",
    tagLabel: "Verified",
  },
  {
    id: 11,
    name: "London Strategy Partners",
    initials: "LS",
    av: "av-blue",
    pin: "pin-blue",
    category: "Consulting",
    desc: "B2B go-to-market strategy and pricing optimization.",
    location: "London, UK",
    price: 150,
    availability: "Free 30-min consult",
    tag: "verified",
    tagLabel: "Verified",
  },
  {
    id: 12,
    name: "Amsterdam Coaching",
    initials: "AC",
    av: "av-blue",
    pin: "pin-blue",
    category: "Consulting",
    desc: "Career transition coaching for tech professionals.",
    location: "Amsterdam, NL",
    price: 95,
    availability: "Online or in-person",
    tag: "verified",
    tagLabel: "Verified",
  },
  {
    id: 13,
    name: "Apex Code Academy",
    initials: "AC",
    av: "av-amber",
    pin: "pin-amber",
    category: "Education",
    desc: "Learn React, Next.js and Node.js with 1-on-1 tutoring.",
    location: "Online / Remote",
    price: 35,
    availability: "Remote lessons",
    tag: "early",
    tagLabel: "Early Access",
  },
  {
    id: 14,
    name: "Edinburgh Tutors",
    initials: "ET",
    av: "av-amber",
    pin: "pin-amber",
    category: "Education",
    desc: "GCSE, A-Level and university prep in sciences & maths.",
    location: "Edinburgh, UK",
    price: 30,
    availability: "Term-time slots",
    tag: "verified",
    tagLabel: "Verified",
  },
  {
    id: 15,
    name: "Cape Town Surf School",
    initials: "CT",
    av: "av-amber",
    pin: "pin-amber",
    category: "Education",
    desc: "Beginner to advanced surf coaching at Muizenberg.",
    location: "Cape Town, ZA",
    price: 50,
    availability: "Daily sessions",
    tag: "new",
    tagLabel: "New",
  },
  {
    id: 16,
    name: "Pro Fixit Handyman",
    initials: "PF",
    av: "av-teal",
    pin: "pin-teal",
    category: "Repair",
    desc: "Fast home repair, plumbing fixes and door installations.",
    location: "Boston, US",
    price: 50,
    availability: "Home visits",
    tag: "verified",
    tagLabel: "Verified",
  },
  {
    id: 17,
    name: "London Quick Fix",
    initials: "LQ",
    av: "av-teal",
    pin: "pin-teal",
    category: "Repair",
    desc: "Same-day plumbing, electrical and lockout services.",
    location: "London, UK",
    price: 65,
    availability: "Same-day slots",
    tag: "verified",
    tagLabel: "Verified",
  },
  {
    id: 18,
    name: "Dublin Clean Co.",
    initials: "DC",
    av: "av-teal",
    pin: "pin-teal",
    category: "Repair",
    desc: "End-of-tenancy cleans, deep cleans and recurring service.",
    location: "Dublin, IE",
    price: 40,
    availability: "This week",
    tag: "new",
    tagLabel: "New",
  },
  {
    id: 19,
    name: "Tokyo Dental Studio",
    initials: "TD",
    av: "av-green",
    pin: "pin-green",
    category: "Healthcare",
    desc: "Cosmetic dentistry and Invisalign-certified care.",
    location: "Tokyo, JP",
    price: 110,
    availability: "English-speaking",
    tag: "verified",
    tagLabel: "Verified",
  },
  {
    id: 20,
    name: "Vancouver Wellness",
    initials: "VW",
    av: "av-green",
    pin: "pin-green",
    category: "Healthcare",
    desc: "Massage therapy, chiropractic and naturopathy.",
    location: "Vancouver, CA",
    price: 85,
    availability: "Same-week bookings",
    tag: "verified",
    tagLabel: "Verified",
  },
];

const getCategoryAvatarStyles = (category: string) => {
  switch (category) {
    case "Beauty":
      return "bg-[#FDF2F8] text-[#DB2777]"; // pink
    case "Healthcare":
      return "bg-[#ECFDF5] text-[#059669]"; // emerald
    case "Fitness":
      return "bg-[#F5F3FF] text-[#7C3AED]"; // purple
    case "Consulting":
      return "bg-[#EFF6FF] text-[#2563EB]"; // blue
    case "Education":
      return "bg-[#FFFBEB] text-[#D97706]"; // amber
    case "Repair":
    case "Home Services":
      return "bg-[#F0FDFA] text-[#0D9488]"; // teal
    default:
      return "bg-bg-secondary text-text-muted";
  }
};

const getMarketplaceCategory = (templateId: string) => {
  switch (templateId) {
    case "beauty":
      return "Beauty";
    case "healthcare":
      return "Healthcare";
    case "fitness":
      return "Fitness";
    case "consulting":
      return "Consulting";
    case "education":
      return "Education";
    case "repair":
      return "Repair";
    default:
      return "Beauty";
  }
};

export function Marketplace({
  activeTemplateIdx,
  setActiveTemplateIdx,
  customBusinessName,
}: MarketplaceProps) {
  // State
  const [marketplaceSearchQuery, setMarketplaceSearchQuery] = useState("");
  const [marketplaceSelectedCategory, setMarketplaceSelectedCategory] =
    useState("All");
  const [marketplaceVisibility, setMarketplaceVisibility] = useState(true);
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [radiusKm, setRadiusKm] = useState<number>(Infinity);
  const [sortMode, setSortMode] = useState<string>("recommended");
  const [pageSize, setPageSize] = useState(6);
  const [activePinId, setActivePinId] = useState<number | null>(null);
  const [openDropdown, setOpenDropdown] = useState<
    "category" | "distance" | "sort" | null
  >(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleOutsideClick = () => setOpenDropdown(null);
    document.addEventListener("click", handleOutsideClick);
    return () => document.removeEventListener("click", handleOutsideClick);
  }, []);

  // Trigger toast on visibility change
  useEffect(() => {
    toast.success(
      marketplaceVisibility
        ? "Your booking site is now listed publicly!"
        : "Your booking site is now hidden from the public directory.",
      {
        icon: marketplaceVisibility ? "✨" : "🔒",
      },
    );
  }, [marketplaceVisibility]);

  const handleSeeWorkflow = (categoryName: string) => {
    const templateIndices: Record<string, number> = {
      beauty: 0,
      healthcare: 1,
      fitness: 2,
      consulting: 3,
      education: 4,
      repair: 5,
    };
    const idx = templateIndices[categoryName.toLowerCase()];
    if (idx !== undefined) {
      setActiveTemplateIdx(idx);
    }
    const el = document.getElementById("templates");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Build the list of providers dynamically including the custom user site if public
  const allProvidersWithCustom = useMemo(() => {
    const list = [...MARKETPLACE_LISTINGS] as Array<
      (typeof MARKETPLACE_LISTINGS)[number] & { isCustom?: boolean }
    >;

    if (marketplaceVisibility) {
      const activeTemplate =
        WEBSITE_TEMPLATES[activeTemplateIdx] || WEBSITE_TEMPLATES[0];
      if (activeTemplate) {
        const customListing = {
          id: 1,
          name: customBusinessName || "Lumière Wellness",
          initials: (customBusinessName || "L").trim().charAt(0).toUpperCase(),
          category: getMarketplaceCategory(activeTemplate.id),
          status: "Verified",
          desc:
            activeTemplate.heroTagline ||
            "Premium treatments tailored to your body's wellness",
          location: "London, UK",
          price: 35,
          availability: "Available today",
          tag: "verified",
          tagLabel: "Verified",
          av: "av-pink",
          pin: "pin-yours",
          isCustom: true,
        };
        list.unshift(customListing);
      }
    }
    return list;
  }, [marketplaceVisibility, customBusinessName, activeTemplateIdx]);

  // Filter listings based on category, search text & distance
  const filteredProviders = useMemo(() => {
    return allProvidersWithCustom.filter((provider) => {
      const matchesCategory =
        marketplaceSelectedCategory === "All" ||
        provider.category === marketplaceSelectedCategory;

      const matchesSearch =
        provider.name
          .toLowerCase()
          .includes(marketplaceSearchQuery.toLowerCase()) ||
        provider.desc
          .toLowerCase()
          .includes(marketplaceSearchQuery.toLowerCase()) ||
        provider.category
          .toLowerCase()
          .includes(marketplaceSearchQuery.toLowerCase()) ||
        provider.location
          .toLowerCase()
          .includes(marketplaceSearchQuery.toLowerCase());

      const coords = CITY_COORDS[provider.location] || { distFromLondon: 0 };
      const matchesRadius =
        radiusKm === Infinity || coords.distFromLondon <= radiusKm;

      return matchesCategory && matchesSearch && matchesRadius;
    });
  }, [
    allProvidersWithCustom,
    marketplaceSelectedCategory,
    marketplaceSearchQuery,
    radiusKm,
  ]);

  // Sort listings based on selected sorting mode
  const sortedProviders = useMemo(() => {
    const data = [...filteredProviders];
    if (sortMode === "price-asc") {
      data.sort((a, b) => a.price - b.price);
    } else if (sortMode === "price-desc") {
      data.sort((a, b) => b.price - a.price);
    } else {
      // Recommended: Yours first, then original order
      data.sort((a, b) => {
        const aVal = a.isCustom ? 1 : 0;
        const bVal = b.isCustom ? 1 : 0;
        return bVal - aVal;
      });
    }
    return data;
  }, [filteredProviders, sortMode]);

  // Paginated listings for List View
  const shownProviders = useMemo(() => {
    return sortedProviders.slice(0, pageSize);
  }, [sortedProviders, pageSize]);

  const remainingCount = sortedProviders.length - shownProviders.length;

  // Compute category counts dynamically based on search & radius
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    const baseList = allProvidersWithCustom.filter((provider) => {
      const matchesSearch =
        provider.name
          .toLowerCase()
          .includes(marketplaceSearchQuery.toLowerCase()) ||
        provider.desc
          .toLowerCase()
          .includes(marketplaceSearchQuery.toLowerCase()) ||
        provider.category
          .toLowerCase()
          .includes(marketplaceSearchQuery.toLowerCase()) ||
        provider.location
          .toLowerCase()
          .includes(marketplaceSearchQuery.toLowerCase());
      const coords = CITY_COORDS[provider.location] || { distFromLondon: 0 };
      return (
        matchesSearch &&
        (radiusKm === Infinity || coords.distFromLondon <= radiusKm)
      );
    });

    counts["All"] = baseList.length;
    [
      "Beauty",
      "Healthcare",
      "Fitness",
      "Consulting",
      "Education",
      "Repair",
    ].forEach((cat) => {
      counts[cat] = baseList.filter((l) => l.category === cat).length;
    });
    return counts;
  }, [allProvidersWithCustom, marketplaceSearchQuery, radiusKm]);

  // Selected Listing in Map View
  const activeListing = useMemo(() => {
    if (activePinId === null) return sortedProviders[0] || null;
    return (
      sortedProviders.find((l) => l.id === activePinId) ||
      sortedProviders[0] ||
      null
    );
  }, [activePinId, sortedProviders]);

  const hasActiveFilters = useMemo(() => {
    return (
      marketplaceSearchQuery.trim() !== "" ||
      marketplaceSelectedCategory !== "All" ||
      radiusKm !== Infinity ||
      sortMode !== "recommended"
    );
  }, [marketplaceSearchQuery, marketplaceSelectedCategory, radiusKm, sortMode]);

  const clearAllFilters = () => {
    setMarketplaceSearchQuery("");
    setMarketplaceSelectedCategory("All");
    setRadiusKm(Infinity);
    setSortMode("recommended");
    setPageSize(6);
    setActivePinId(null);
    setOpenDropdown(null);
    toast.info("Filters cleared successfully");
  };

  return (
    <RepeatReveal
      as="section"
      id="marketplace"
      className="scroll-mt-20 md:scroll-mt-24 py-16 md:py-24 lg:py-28 bg-bg-primary border-t border-border-light"
    >
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          {/* Left Column: Config simulator & filters */}
          <div className="lg:col-span-5 space-y-8 lg:sticky lg:top-28 lg:self-start">
            <div className="space-y-4 text-left">
              <span className="text-xs font-bold text-brand-blue uppercase tracking-wider block">
                Service Discovery
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-text-primary">
                Get discovered by customers searching for services
              </h2>
              <p className="text-text-muted text-base leading-relaxed">
                List your booking site in a public marketplace so customers can
                find your services by category, location or service — then book
                directly from your page.
              </p>
            </div>

            {/* Marketplace Visibility Settings Simulator */}
            <div className="bg-white border border-border-light rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-border-light/60 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded bg-[#E6F9ED] text-[#15803D] flex items-center justify-center text-[10px] font-bold">
                    ✓
                  </div>
                  <span className="text-[10px] font-extrabold text-text-primary uppercase tracking-wider">
                    MARKETPLACE VISIBILITY
                  </span>
                </div>
                <span className="text-[9px] bg-bg-secondary text-text-muted px-2 py-0.5 rounded font-bold border border-border-light">
                  Optional listing
                </span>
              </div>

              <div className="flex items-center justify-between py-1 text-left">
                <div className="space-y-0.5 pr-4">
                  <span className="text-xs font-bold text-text-primary block">
                    List your booking site publicly
                  </span>
                  <span className="text-[10px] text-text-muted">
                    Allow customers to search and find you publicly
                  </span>
                </div>

                {/* Styled Switch Button */}
                <button
                  type="button"
                  onClick={() =>
                    setMarketplaceVisibility(!marketplaceVisibility)
                  }
                  className={`w-9 h-5 rounded-full p-0.5 transition-colors focus:outline-none cursor-pointer shrink-0 relative ${
                    marketplaceVisibility ? "bg-brand-blue" : "bg-border-light"
                  }`}
                >
                  <span
                    className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform block transform ${
                      marketplaceVisibility ? "translate-x-4" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              <div
                className={`grid grid-cols-2 gap-3 pt-2 text-[11px] transition-all duration-300 text-left ${
                  marketplaceVisibility
                    ? "opacity-100"
                    : "opacity-40 pointer-events-none"
                }`}
              >
                <div className="bg-bg-secondary/60 border border-border-light/80 rounded-lg p-2.5 space-y-1">
                  <span className="text-[8px] font-extrabold text-text-muted uppercase block">
                    Directory category
                  </span>
                  <span className="font-bold text-text-secondary">
                    {getMarketplaceCategory(
                      WEBSITE_TEMPLATES[activeTemplateIdx]?.id || "beauty",
                    )}
                  </span>
                </div>
                <div className="bg-bg-secondary/60 border border-border-light/80 rounded-lg p-2.5 space-y-1">
                  <span className="text-[8px] font-extrabold text-text-muted uppercase block">
                    Target location
                  </span>
                  <span className="font-bold text-text-secondary">
                    London, UK
                  </span>
                </div>
              </div>
            </div>

            {/* Interactive Search & Discovery Demo */}
            <div className="p-5 bg-bg-secondary/50 border border-border-light rounded-2xl space-y-5 text-left">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold text-text-muted uppercase tracking-wider block">
                  Live Directory Search
                </span>
                <span className="inline-flex items-center gap-1 text-[8px] font-extrabold text-[#22C55E] uppercase bg-[#E6F9ED] px-1.5 py-0.5 rounded border border-[#BBF7D0]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse" />
                  Customer Demo
                </span>
              </div>

              {/* Search Bar Input */}
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-muted">
                  <Search className="w-3.5 h-3.5" />
                </span>
                <input
                  type="text"
                  value={marketplaceSearchQuery}
                  onChange={(e) => {
                    setMarketplaceSearchQuery(e.target.value);
                    setPageSize(6);
                  }}
                  className="w-full pl-8.5 pr-4 py-2.5 border border-border-light rounded-lg text-xs focus:outline-none focus:border-brand-blue bg-white transition-all shadow-sm focus:shadow"
                  placeholder="Search category, location, business name..."
                />
              </div>

              {/* Dropdowns Filters Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 relative z-30">
                {/* Category Dropdown */}
                <div className="relative">
                  <span className="text-[9px] font-bold text-text-muted uppercase block mb-1">
                    Category
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenDropdown((prev) =>
                        prev === "category" ? null : "category",
                      );
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 border border-border-light rounded-lg text-xs font-semibold bg-white text-text-secondary hover:border-brand-blue/40 transition shadow-sm cursor-pointer select-none"
                  >
                    <span className="truncate">
                      {marketplaceSelectedCategory} (
                      {categoryCounts[marketplaceSelectedCategory] ?? 0})
                    </span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 ml-1 shrink-0 text-text-muted transition-transform duration-200 ${openDropdown === "category" ? "rotate-180" : ""}`}
                    />
                  </button>
                  <AnimatePresence>
                    {openDropdown === "category" && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.12 }}
                        className="absolute left-0 right-0 mt-1 bg-white border border-border-light rounded-xl shadow-lg py-1 z-50 max-h-48 overflow-y-auto scrollbar-thin"
                      >
                        {[
                          "All",
                          "Beauty",
                          "Healthcare",
                          "Fitness",
                          "Consulting",
                          "Education",
                          "Repair",
                        ].map((cat) => {
                          const count = categoryCounts[cat] ?? 0;
                          const isSelected =
                            marketplaceSelectedCategory === cat;
                          return (
                            <button
                              key={cat}
                              type="button"
                              onClick={() => {
                                setMarketplaceSelectedCategory(cat);
                                setPageSize(6);
                                setOpenDropdown(null);
                              }}
                              className={`w-full flex items-center justify-between px-3 py-2 text-left text-xs font-medium transition-colors cursor-pointer ${
                                isSelected
                                  ? "bg-brand-blue text-white"
                                  : "text-text-secondary hover:bg-bg-secondary"
                              }`}
                            >
                              <span>{cat}</span>
                              <span
                                className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                                  isSelected
                                    ? "bg-white/20 text-white"
                                    : "bg-bg-secondary text-text-muted font-bold"
                                }`}
                              >
                                {count}
                              </span>
                            </button>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Distance Dropdown */}
                <div className="relative">
                  <span className="text-[9px] font-bold text-text-muted uppercase block mb-1">
                    Distance
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenDropdown((prev) =>
                        prev === "distance" ? null : "distance",
                      );
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 border border-border-light rounded-lg text-xs font-semibold bg-white text-text-secondary hover:border-brand-blue/40 transition shadow-sm cursor-pointer select-none"
                  >
                    <span className="truncate">
                      {radiusKm === Infinity
                        ? "Any distance"
                        : `≤ ${radiusKm} km`}
                    </span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 ml-1 shrink-0 text-text-muted transition-transform duration-200 ${openDropdown === "distance" ? "rotate-180" : ""}`}
                    />
                  </button>
                  <AnimatePresence>
                    {openDropdown === "distance" && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.12 }}
                        className="absolute left-0 right-0 mt-1 bg-white border border-border-light rounded-xl shadow-lg py-1 z-50"
                      >
                        {[
                          { label: "Near (≤ 25km)", km: 25 },
                          { label: "Region (≤ 500km)", km: 500 },
                          { label: "Continent (≤ 5k km)", km: 5000 },
                          { label: "Any (Worldwide)", km: Infinity },
                        ].map((rad) => {
                          const isSelected = radiusKm === rad.km;
                          return (
                            <button
                              key={rad.label}
                              type="button"
                              onClick={() => {
                                setRadiusKm(rad.km);
                                setPageSize(6);
                                setOpenDropdown(null);
                              }}
                              className={`w-full text-left px-3 py-2 text-xs font-medium transition-colors cursor-pointer ${
                                isSelected
                                  ? "bg-brand-blue text-white"
                                  : "text-text-secondary hover:bg-bg-secondary"
                              }`}
                            >
                              {rad.label}
                            </button>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Sort By Dropdown */}
                <div className="relative">
                  <span className="text-[9px] font-bold text-text-muted uppercase block mb-1">
                    Sort by
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenDropdown((prev) =>
                        prev === "sort" ? null : "sort",
                      );
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 border border-border-light rounded-lg text-xs font-semibold bg-white text-text-secondary hover:border-brand-blue/40 transition shadow-sm cursor-pointer select-none"
                  >
                    <span className="truncate">
                      {sortMode === "recommended"
                        ? "Recommended"
                        : sortMode === "price-asc"
                          ? "Price ↑"
                          : "Price ↓"}
                    </span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 ml-1 shrink-0 text-text-muted transition-transform duration-200 ${openDropdown === "sort" ? "rotate-180" : ""}`}
                    />
                  </button>
                  <AnimatePresence>
                    {openDropdown === "sort" && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.12 }}
                        className="absolute left-0 right-0 mt-1 bg-white border border-border-light rounded-xl shadow-lg py-1 z-50"
                      >
                        {[
                          { id: "recommended", label: "Recommended" },
                          { id: "price-asc", label: "Price: Low to High" },
                          { id: "price-desc", label: "Price: High to Low" },
                        ].map((s) => {
                          const isSelected = sortMode === s.id;
                          return (
                            <button
                              key={s.id}
                              type="button"
                              onClick={() => {
                                setSortMode(s.id);
                                setPageSize(6);
                                setOpenDropdown(null);
                              }}
                              className={`w-full text-left px-3 py-2 text-xs font-medium transition-colors cursor-pointer ${
                                isSelected
                                  ? "bg-brand-blue text-white"
                                  : "text-text-secondary hover:bg-bg-secondary"
                              }`}
                            >
                              {s.label}
                            </button>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Conditional Reset Filters Link */}
              {hasActiveFilters && (
                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={clearAllFilters}
                    className="inline-flex items-center gap-1 text-[10px] text-red-500 hover:text-red-600 font-bold cursor-pointer transition select-none"
                  >
                    <X className="w-3.5 h-3.5" />
                    Reset Filters
                  </button>
                </div>
              )}
            </div>

            <div>
              <button
                type="button"
                onClick={() => {
                  const el = document.getElementById("early-access");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}
                className="inline-flex min-h-11 items-center justify-center rounded-full bg-brand-blue hover:bg-brand-blue-hover px-6 text-sm font-bold text-white transition-all duration-200 cursor-pointer shadow-sm hover:shadow"
              >
                List your booking site
              </button>
            </div>
          </div>

          {/* Right Column: Dynamic Listings stack & Interactive SVG Map */}
          <div className="lg:col-span-7 space-y-4 min-h-[560px] lg:min-h-[820px]">
            {/* Header with list/map tabs */}
            <div className="flex items-center justify-between pb-2.5 border-b border-border-light/60">
              <span className="text-xs font-bold text-text-muted uppercase">
                Live Marketplace Directory
              </span>
              <div className="flex items-center gap-3">
                {/* View Mode Toggle */}
                <div className="flex gap-0.5 p-0.5 bg-bg-secondary rounded-lg border border-border-light">
                  <button
                    type="button"
                    onClick={() => {
                      setViewMode("list");
                      setActivePinId(null);
                    }}
                    className={`p-1 rounded cursor-pointer transition ${
                      viewMode === "list"
                        ? "bg-white text-brand-blue shadow-sm"
                        : "text-text-muted hover:text-text-primary"
                    }`}
                  >
                    <List className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setViewMode("map");
                      setActivePinId(null);
                    }}
                    className={`p-1 rounded cursor-pointer transition ${
                      viewMode === "map"
                        ? "bg-white text-brand-blue shadow-sm"
                        : "text-text-muted hover:text-text-primary"
                    }`}
                  >
                    <Map className="w-3.5 h-3.5" />
                  </button>
                </div>

                <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2.5 py-0.5 rounded border border-emerald-100">
                  {sortedProviders.length} matching{" "}
                  {sortedProviders.length === 1 ? "listing" : "listings"}
                </span>
              </div>
            </div>

            {/* Warning banner when site visibility is off */}
            {!marketplaceVisibility && (
              <div className="bg-amber-50 text-[#92400E] border border-amber-200/50 px-4 py-2.5 rounded-xl text-[10px] font-extrabold text-center select-none">
                🔒 Listing is private — toggle visibility ON in the left panel
                to appear in the directory.
              </div>
            )}

            {/* 1. MAP VIEW CONTAINER */}
            {viewMode === "map" && sortedProviders.length > 0 && (
              <div className="w-full h-[450px] lg:h-[750px] bg-sky-50 rounded-2xl relative overflow-hidden border border-border-light shadow-inner flex flex-col justify-between select-none">
                {/* Grid pattern overlay */}
                <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

                {/* SVG Continents Map */}
                <svg
                  className="absolute inset-0 w-full h-full text-slate-200/60"
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                >
                  {/* North America */}
                  <path
                    d="M5,18 Q12,8 25,12 Q33,18 30,30 Q22,38 12,36 Q4,30 5,18 Z"
                    fill="currentColor"
                    stroke="rgba(148,163,184,0.3)"
                    strokeWidth="0.3"
                  />
                  {/* Central America */}
                  <path
                    d="M22,38 Q26,42 25,46 Q22,46 21,42 Z"
                    fill="currentColor"
                    stroke="rgba(148,163,184,0.3)"
                    strokeWidth="0.3"
                  />
                  {/* South America */}
                  <path
                    d="M27,46 Q33,48 33,58 Q31,72 26,75 Q20,72 21,60 Q22,50 27,46 Z"
                    fill="currentColor"
                    stroke="rgba(148,163,184,0.3)"
                    strokeWidth="0.3"
                  />
                  {/* Europe */}
                  <path
                    d="M44,18 Q50,15 56,18 Q57,24 52,27 Q46,28 44,24 Z"
                    fill="currentColor"
                    stroke="rgba(148,163,184,0.3)"
                    strokeWidth="0.3"
                  />
                  {/* Africa */}
                  <path
                    d="M46,30 Q55,30 56,42 Q55,55 50,58 Q44,55 44,42 Z"
                    fill="currentColor"
                    stroke="rgba(148,163,184,0.3)"
                    strokeWidth="0.3"
                  />
                  {/* Asia */}
                  <path
                    d="M56,16 Q75,12 86,20 Q88,28 80,32 Q72,30 64,26 Q57,22 56,16 Z"
                    fill="currentColor"
                    stroke="rgba(148,163,184,0.3)"
                    strokeWidth="0.3"
                  />
                  {/* India */}
                  <path
                    d="M65,28 Q70,30 68,38 Q64,40 63,35 Z"
                    fill="currentColor"
                    stroke="rgba(148,163,184,0.3)"
                    strokeWidth="0.3"
                  />
                  {/* SE Asia */}
                  <path
                    d="M75,38 Q80,38 80,44 Q76,46 74,42 Z"
                    fill="currentColor"
                    stroke="rgba(148,163,184,0.3)"
                    strokeWidth="0.3"
                  />
                  {/* Australia */}
                  <path
                    d="M80,62 Q90,60 90,70 Q86,74 80,70 Z"
                    fill="currentColor"
                    stroke="rgba(148,163,184,0.3)"
                    strokeWidth="0.3"
                  />
                  {/* UK */}
                  <path
                    d="M45.5,22 L46.5,21 L47,23 L46,24 Z"
                    fill="currentColor"
                    stroke="rgba(148,163,184,0.3)"
                    strokeWidth="0.3"
                  />
                </svg>

                {/* London Home Center Marker (You) */}
                <div
                  className="absolute w-5 h-5 rounded-full bg-brand-blue/20 border-2 border-brand-blue flex items-center justify-center -translate-x-1/2 -translate-y-1/2"
                  style={{ left: "47.5%", top: "28%" }}
                >
                  <div className="w-2 h-2 rounded-full bg-brand-blue animate-pulse" />
                </div>
                <div
                  className="absolute bg-brand-blue text-white px-2 py-0.5 rounded text-[8px] font-extrabold -translate-x-1/2 mt-3.5 whitespace-nowrap shadow-sm"
                  style={{ left: "47.5%", top: "28%" }}
                >
                  London · You
                </div>

                {/* Render pins */}
                {sortedProviders.map((l) => {
                  const coords = CITY_COORDS[l.location] || {
                    mapX: 50,
                    mapY: 50,
                  };
                  const isActive = activeListing?.id === l.id;
                  return (
                    <button
                      key={l.id}
                      type="button"
                      onClick={() => {
                        setActivePinId(l.id);
                      }}
                      className={`absolute -translate-x-1/2 -translate-y-full flex flex-col items-center group cursor-pointer transition-all duration-200 ${
                        isActive ? "z-30 scale-110" : "z-10 hover:scale-105"
                      }`}
                      style={{
                        left: `${coords.mapX}%`,
                        top: `${coords.mapY}%`,
                      }}
                    >
                      <div
                        className={`w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-[9px] font-black text-white shadow-md relative ${
                          l.isCustom
                            ? "bg-brand-blue"
                            : l.category === "Beauty"
                              ? "bg-pink-500"
                              : l.category === "Healthcare"
                                ? "bg-emerald-500"
                                : l.category === "Fitness"
                                  ? "bg-violet-500"
                                  : l.category === "Consulting"
                                    ? "bg-blue-600"
                                    : l.category === "Education"
                                      ? "bg-amber-500"
                                      : "bg-teal-500"
                        }`}
                      >
                        {l.initials}
                        {l.isCustom && (
                          <div className="absolute -top-1.5 -right-1.5 bg-yellow-400 border border-white text-gray-900 rounded-full w-3.5 h-3.5 flex items-center justify-center text-[7px] font-bold">
                            ★
                          </div>
                        )}
                      </div>
                      {/* Pin pointer pin-tip */}
                      <div className="w-1.5 h-1.5 bg-white border-r border-b border-gray-200/80 rotate-45 -mt-1 shadow-sm" />
                    </button>
                  );
                })}

                {/* Active Pin Details Drawer Popup */}
                {activeListing && (
                  <div className="absolute top-3 left-3 w-64 bg-white/95 backdrop-blur border border-border-light rounded-xl p-3.5 shadow-xl space-y-2.5 z-40 text-left">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-extrabold ${getCategoryAvatarStyles(
                            activeListing.category,
                          )}`}
                        >
                          {activeListing.initials}
                        </div>
                        <div>
                          <h6 className="text-[11px] font-black text-text-primary leading-tight">
                            {activeListing.name}
                          </h6>
                          <span className="text-[8px] bg-bg-secondary text-text-muted px-1.5 py-0.5 rounded font-bold">
                            {activeListing.category}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActivePinId(null)}
                        className="text-text-muted hover:text-text-primary cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-[9.5px] text-text-muted leading-relaxed">
                      {activeListing.desc}
                    </p>
                    <div className="text-[9px] text-text-secondary space-y-0.5 font-semibold">
                      <div className="flex items-center gap-1">
                        <span>📍 {activeListing.location}</span>
                        {activeListing.location !== "Online / Remote" && (
                          <span className="text-text-muted">
                            (
                            {
                              CITY_COORDS[activeListing.location]
                                ?.distFromLondon
                            }{" "}
                            km away)
                          </span>
                        )}
                      </div>
                      <div>💼 Services from ${activeListing.price}</div>
                      <div className="text-emerald-600 font-extrabold flex items-center gap-1">
                        <span className="w-1 h-1 rounded-full bg-emerald-500" />
                        {activeListing.availability}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        handleSeeWorkflow(activeListing.category.toLowerCase())
                      }
                      className="w-full py-2 bg-brand-blue hover:bg-brand-blue-hover text-white text-[9.5px] font-bold rounded-full shadow-sm transition cursor-pointer active:scale-[0.98]"
                    >
                      View booking page
                    </button>
                  </div>
                )}

                {/* Map Legend */}
                <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur px-2.5 py-1.5 border border-border-light rounded-lg text-[8px] font-bold text-text-secondary flex gap-3 shadow-md z-20">
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-brand-blue" />
                    <span>Your Location</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2.5 h-2.5 bg-brand-blue rounded-full border border-white flex items-center justify-center text-[5px] font-bold text-white relative">
                      ★
                    </div>
                    <span>Your Listing</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-pink-500" />
                    <span>Others</span>
                  </div>
                </div>
              </div>
            )}

            {/* 2. LIST VIEW OR EMPTY STATES CONTAINER */}
            <AnimatePresence mode="popLayout">
              {viewMode === "list" && shownProviders.length > 0 ? (
                <div className="h-[450px] lg:h-[750px] overflow-y-auto pr-2 space-y-4 scrollbar-thin">
                  {shownProviders.map((provider) => (
                    <motion.div
                      layout
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      key={provider.name}
                      className={`p-5 bg-white border rounded-xl hover:border-brand-blue/40 shadow-sm hover:shadow transition-all duration-300 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${
                        provider.isCustom
                          ? "border-brand-blue/30 bg-[#F8FAFC]/50"
                          : "border-border-light"
                      }`}
                    >
                      <div className="flex items-start gap-4 text-left">
                        <div
                          className={`w-12 h-12 rounded-xl flex items-center justify-center text-sm font-extrabold flex-shrink-0 select-none ${getCategoryAvatarStyles(
                            provider.category,
                          )}`}
                        >
                          {provider.initials}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-sm font-bold text-text-primary flex items-center gap-1.5">
                              {provider.name}
                              {provider.isCustom && (
                                <span className="text-[8px] bg-brand-blue/15 text-brand-blue font-bold px-1.5 py-0.5 rounded-full">
                                  Your site
                                </span>
                              )}
                            </h3>
                            <span className="text-[9px] bg-bg-secondary text-text-muted px-2 py-0.5 rounded-[4px] font-bold">
                              {provider.category}
                            </span>
                            {provider.tagLabel && (
                              <span
                                className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded border ${
                                  provider.tag === "verified"
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                                    : provider.tag === "new"
                                      ? "bg-blue-50 text-blue-700 border-blue-100"
                                      : "bg-amber-50 text-amber-700 border-amber-100"
                                }`}
                              >
                                {provider.tagLabel}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-text-muted mt-1 leading-relaxed max-w-md">
                            {provider.desc}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-[10px] text-text-muted font-semibold flex-wrap">
                            <span>📍 {provider.location}</span>
                            <span>💵 Services from ${provider.price}</span>
                            <span className="inline-flex items-center gap-1 text-[#15803D] bg-[#E6F9ED] px-1.5 py-0.5 rounded text-[9px] font-bold border border-[#BBF7D0]">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
                              {provider.availability}
                            </span>
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          handleSeeWorkflow(provider.category.toLowerCase())
                        }
                        className="w-full sm:w-auto px-4 py-2 border border-border-light hover:border-brand-blue hover:text-brand-blue text-xs font-bold rounded-full transition-colors cursor-pointer text-center bg-bg-primary active:scale-[0.98]"
                      >
                        View booking page
                      </button>
                    </motion.div>
                  ))}

                  {/* Load more button */}
                  {remainingCount > 0 && (
                    <div className="flex flex-col items-center pt-2">
                      <button
                        type="button"
                        onClick={() => setPageSize((prev) => prev + 6)}
                        className="flex items-center gap-1.5 px-5 py-2.5 border border-border-light rounded-full text-xs font-extrabold text-brand-blue bg-white hover:bg-[#F8FAFC] transition-colors cursor-pointer shadow-sm"
                      >
                        Load more listings
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-[10px] text-text-muted mt-2 font-medium">
                        {remainingCount} more listings to show
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                // 3. EMPTY STATE
                (viewMode === "list" || sortedProviders.length === 0) && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="p-12 text-center border border-dashed border-border-light rounded-xl space-y-4 bg-bg-secondary/40 select-none"
                  >
                    <div className="w-12 h-12 mx-auto bg-white rounded-full flex items-center justify-center text-lg text-text-muted shadow-sm border border-border-light">
                      🔍
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-sm font-bold text-text-primary">
                        {!marketplaceVisibility
                          ? "Listing is private"
                          : "No matching listings"}
                      </h3>
                      <p className="text-xs text-text-muted max-w-sm mx-auto leading-relaxed">
                        {!marketplaceVisibility
                          ? "Your booking site will not appear to customers until you make it public."
                          : "Try widening your distance radius, selecting another category, or clearing filters."}
                      </p>
                    </div>
                    {marketplaceVisibility && (
                      <button
                        type="button"
                        onClick={clearAllFilters}
                        className="px-4 py-2 border border-border-light hover:border-brand-blue hover:text-brand-blue bg-white text-xs font-bold rounded-full transition-colors cursor-pointer"
                      >
                        Clear filters
                      </button>
                    )}
                  </motion.div>
                )
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </RepeatReveal>
  );
}
