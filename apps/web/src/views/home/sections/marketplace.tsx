"use client";

import { useState, useMemo, useEffect } from "react";
import { Search, ChevronDown, Map, List, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { RepeatReveal } from "@/src/components/motion/RepeatReveal";
import { WEBSITE_TEMPLATES } from "../constants/home.constants";
import { useToast } from "@repo/hooks";

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
      return "bg-primary text-primary"; // pink
    case "Healthcare":
      return "bg-primary text-primary"; // emerald
    case "Fitness":
      return "bg-primary text-info"; // purple
    case "Consulting":
      return "bg-primary text-primary"; // blue
    case "Education":
      return "bg-primary text-primary"; // amber
    case "Repair":
    case "Home Services":
      return "bg-primary text-primary"; // teal
    default:
      return "bg-background text-muted-foreground";
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
  const { toast } = useToast();
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
  }, [marketplaceVisibility, toast]);

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
      className="scroll-mt-20 md:scroll-mt-24 py-16 md:py-24 lg:py-28 bg-surface border-t border-border"
    >
      <div className="mx-auto w-full max-w-landing px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          {/* Left Column: Config simulator & filters */}
          <div className="lg:col-span-5 space-y-8 lg:sticky lg:top-28 lg:self-start">
            <div className="space-y-4 text-left">
              <span className="text-xs font-bold text-primary uppercase tracking-wider block">
                Service Discovery
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
                Get discovered by customers searching for services
              </h2>
              <p className="text-muted-foreground text-base leading-relaxed">
                List your booking site in a public marketplace so customers can
                find your services by category, location or service — then book
                directly from your page.
              </p>
            </div>

            {/* Marketplace Visibility Settings Simulator */}
            <div className="bg-surface border border-border rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-border/60 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded bg-primary text-primary flex items-center justify-center text-[10px] font-bold">
                    ✓
                  </div>
                  <span className="text-[10px] font-extrabold text-foreground uppercase tracking-wider">
                    MARKETPLACE VISIBILITY
                  </span>
                </div>
                <span className="text-[9px] bg-background text-muted-foreground px-2 py-0.5 rounded font-bold border border-border">
                  Optional listing
                </span>
              </div>

              <div className="flex items-center justify-between py-1 text-left">
                <div className="space-y-0.5 pr-4">
                  <span className="text-xs font-bold text-foreground block">
                    List your booking site publicly
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    Allow customers to search and find you publicly
                  </span>
                </div>

                {/* Styled Switch Button */}
                <button
                  type="button"
                  onClick={() =>
                    setMarketplaceVisibility(!marketplaceVisibility)
                  }
                  className={`w-9 h-5 rounded-full p-0.5 transition-colors focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2 cursor-pointer shrink-0 relative ${
                    marketplaceVisibility ? "bg-primary" : "bg-border"
                  }`}
                >
                  <span
                    className={`w-4 h-4 rounded-full bg-surface shadow-sm transition-transform block transform ${
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
                <div className="bg-background/60 border border-border/80 rounded-lg p-2.5 space-y-1">
                  <span className="text-[8px] font-extrabold text-muted-foreground uppercase block">
                    Directory category
                  </span>
                  <span className="font-bold text-foreground">
                    {getMarketplaceCategory(
                      WEBSITE_TEMPLATES[activeTemplateIdx]?.id || "beauty",
                    )}
                  </span>
                </div>
                <div className="bg-background/60 border border-border/80 rounded-lg p-2.5 space-y-1">
                  <span className="text-[8px] font-extrabold text-muted-foreground uppercase block">
                    Target location
                  </span>
                  <span className="font-bold text-foreground">London, UK</span>
                </div>
              </div>
            </div>

            {/* Interactive Search & Discovery Demo */}
            <div className="p-5 bg-background/50 border border-border rounded-2xl space-y-5 text-left">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider block">
                  Live Directory Search
                </span>
                <span className="inline-flex items-center gap-1 text-[8px] font-extrabold text-primary uppercase bg-primary px-1.5 py-0.5 rounded border border-success-border">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  Customer Demo
                </span>
              </div>

              {/* Search Bar Input */}
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                  <Search className="w-3.5 h-3.5" />
                </span>
                <input
                  type="text"
                  value={marketplaceSearchQuery}
                  onChange={(e) => {
                    setMarketplaceSearchQuery(e.target.value);
                    setPageSize(6);
                  }}
                  className="w-full pl-8.5 pr-4 py-2.5 border border-border rounded-lg text-xs focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2 focus:border-primary bg-surface transition-all shadow-sm focus:shadow"
                  placeholder="Search category, location, business name..."
                />
              </div>

              {/* Dropdowns Filters Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 relative z-30">
                {/* Category Dropdown */}
                <div className="relative">
                  <span className="text-[9px] font-bold text-muted-foreground uppercase block mb-1">
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
                    className="w-full flex items-center justify-between px-3 py-2 border border-border rounded-lg text-xs font-semibold bg-surface text-foreground hover:border-primary/40 transition shadow-sm cursor-pointer select-none"
                  >
                    <span className="truncate">
                      {marketplaceSelectedCategory} (
                      {categoryCounts[marketplaceSelectedCategory] ?? 0})
                    </span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 ml-1 shrink-0 text-muted-foreground transition-transform duration-200 ${openDropdown === "category" ? "rotate-180" : ""}`}
                    />
                  </button>
                  <AnimatePresence>
                    {openDropdown === "category" && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.12 }}
                        className="absolute left-0 right-0 mt-1 bg-surface border border-border rounded-xl shadow-lg py-1 z-50 max-h-48 overflow-y-auto scrollbar-thin"
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
                                  ? "bg-primary text-primary-foreground"
                                  : "text-foreground hover:bg-background"
                              }`}
                            >
                              <span>{cat}</span>
                              <span
                                className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                                  isSelected
                                    ? "bg-surface/20 text-primary-foreground"
                                    : "bg-background text-muted-foreground font-bold"
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
                  <span className="text-[9px] font-bold text-muted-foreground uppercase block mb-1">
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
                    className="w-full flex items-center justify-between px-3 py-2 border border-border rounded-lg text-xs font-semibold bg-surface text-foreground hover:border-primary/40 transition shadow-sm cursor-pointer select-none"
                  >
                    <span className="truncate">
                      {radiusKm === Infinity
                        ? "Any distance"
                        : `≤ ${radiusKm} km`}
                    </span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 ml-1 shrink-0 text-muted-foreground transition-transform duration-200 ${openDropdown === "distance" ? "rotate-180" : ""}`}
                    />
                  </button>
                  <AnimatePresence>
                    {openDropdown === "distance" && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.12 }}
                        className="absolute left-0 right-0 mt-1 bg-surface border border-border rounded-xl shadow-lg py-1 z-50"
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
                                  ? "bg-primary text-primary-foreground"
                                  : "text-foreground hover:bg-background"
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
                  <span className="text-[9px] font-bold text-muted-foreground uppercase block mb-1">
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
                    className="w-full flex items-center justify-between px-3 py-2 border border-border rounded-lg text-xs font-semibold bg-surface text-foreground hover:border-primary/40 transition shadow-sm cursor-pointer select-none"
                  >
                    <span className="truncate">
                      {sortMode === "recommended"
                        ? "Recommended"
                        : sortMode === "price-asc"
                          ? "Price ↑"
                          : "Price ↓"}
                    </span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 ml-1 shrink-0 text-muted-foreground transition-transform duration-200 ${openDropdown === "sort" ? "rotate-180" : ""}`}
                    />
                  </button>
                  <AnimatePresence>
                    {openDropdown === "sort" && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.12 }}
                        className="absolute left-0 right-0 mt-1 bg-surface border border-border rounded-xl shadow-lg py-1 z-50"
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
                                  ? "bg-primary text-primary-foreground"
                                  : "text-foreground hover:bg-background"
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
                    className="inline-flex items-center gap-1 text-[10px] text-danger-500 hover:text-danger-surface-foreground font-bold cursor-pointer transition select-none"
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
                className="inline-flex min-h-11 items-center justify-center rounded-full bg-primary hover:bg-primary-hover px-6 text-sm font-bold text-primary-foreground transition-all duration-200 cursor-pointer shadow-sm hover:shadow"
              >
                List your booking site
              </button>
            </div>
          </div>

          {/* Right Column: Dynamic Listings stack & Interactive SVG Map */}
          <div className="lg:col-span-7 space-y-4 min-h-[560px] lg:min-h-[820px]">
            {/* Header with list/map tabs */}
            <div className="flex items-center justify-between pb-2.5 border-b border-border/60">
              <span className="text-xs font-bold text-muted-foreground uppercase">
                Live Marketplace Directory
              </span>
              <div className="flex items-center gap-3">
                {/* View Mode Toggle */}
                <div className="flex gap-0.5 p-0.5 bg-background rounded-lg border border-border">
                  <button
                    type="button"
                    onClick={() => {
                      setViewMode("list");
                      setActivePinId(null);
                    }}
                    className={`p-1 rounded cursor-pointer transition ${
                      viewMode === "list"
                        ? "bg-surface text-primary shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
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
                        ? "bg-surface text-primary shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Map className="w-3.5 h-3.5" />
                  </button>
                </div>

                <span className="text-[10px] bg-success-surface text-success-surface-foreground font-bold px-2.5 py-0.5 rounded border border-success-border">
                  {sortedProviders.length} matching{" "}
                  {sortedProviders.length === 1 ? "listing" : "listings"}
                </span>
              </div>
            </div>

            {/* Warning banner when site visibility is off */}
            {!marketplaceVisibility && (
              <div className="bg-warning-surface text-primary border border-warning-border/50 px-4 py-2.5 rounded-xl text-[10px] font-extrabold text-center select-none">
                🔒 Listing is private — toggle visibility ON in the left panel
                to appear in the directory.
              </div>
            )}

            {/* 1. MAP VIEW CONTAINER */}
            {viewMode === "map" && sortedProviders.length > 0 && (
              <div className="w-full h-[450px] lg:h-[750px] bg-info-surface rounded-2xl relative overflow-hidden border border-border shadow-inner flex flex-col justify-between select-none">
                {/* Grid pattern overlay */}
                <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

                {/* SVG Continents Map */}
                <svg
                  className="absolute inset-0 w-full h-full text-neutral-200/60"
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                >
                  {/* North America */}
                  <path
                    d="M5,18 Q12,8 25,12 Q33,18 30,30 Q22,38 12,36 Q4,30 5,18 Z"
                    fill="currentColor"
                    stroke="var(--color-border)"
                    strokeWidth="0.3"
                  />
                  {/* Central America */}
                  <path
                    d="M22,38 Q26,42 25,46 Q22,46 21,42 Z"
                    fill="currentColor"
                    stroke="var(--color-border)"
                    strokeWidth="0.3"
                  />
                  {/* South America */}
                  <path
                    d="M27,46 Q33,48 33,58 Q31,72 26,75 Q20,72 21,60 Q22,50 27,46 Z"
                    fill="currentColor"
                    stroke="var(--color-border)"
                    strokeWidth="0.3"
                  />
                  {/* Europe */}
                  <path
                    d="M44,18 Q50,15 56,18 Q57,24 52,27 Q46,28 44,24 Z"
                    fill="currentColor"
                    stroke="var(--color-border)"
                    strokeWidth="0.3"
                  />
                  {/* Africa */}
                  <path
                    d="M46,30 Q55,30 56,42 Q55,55 50,58 Q44,55 44,42 Z"
                    fill="currentColor"
                    stroke="var(--color-border)"
                    strokeWidth="0.3"
                  />
                  {/* Asia */}
                  <path
                    d="M56,16 Q75,12 86,20 Q88,28 80,32 Q72,30 64,26 Q57,22 56,16 Z"
                    fill="currentColor"
                    stroke="var(--color-border)"
                    strokeWidth="0.3"
                  />
                  {/* India */}
                  <path
                    d="M65,28 Q70,30 68,38 Q64,40 63,35 Z"
                    fill="currentColor"
                    stroke="var(--color-border)"
                    strokeWidth="0.3"
                  />
                  {/* SE Asia */}
                  <path
                    d="M75,38 Q80,38 80,44 Q76,46 74,42 Z"
                    fill="currentColor"
                    stroke="var(--color-border)"
                    strokeWidth="0.3"
                  />
                  {/* Australia */}
                  <path
                    d="M80,62 Q90,60 90,70 Q86,74 80,70 Z"
                    fill="currentColor"
                    stroke="var(--color-border)"
                    strokeWidth="0.3"
                  />
                  {/* UK */}
                  <path
                    d="M45.5,22 L46.5,21 L47,23 L46,24 Z"
                    fill="currentColor"
                    stroke="var(--color-border)"
                    strokeWidth="0.3"
                  />
                </svg>

                {/* London Home Center Marker (You) */}
                <div
                  className="absolute w-5 h-5 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center -translate-x-1/2 -translate-y-1/2"
                  style={{ left: "47.5%", top: "28%" }}
                >
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                </div>
                <div
                  className="absolute bg-primary text-primary-foreground px-2 py-0.5 rounded text-[8px] font-extrabold -translate-x-1/2 mt-3.5 whitespace-nowrap shadow-sm"
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
                        className={`w-7 h-7 rounded-full border-2 border-surface flex items-center justify-center text-[9px] font-black text-primary-foreground shadow-md relative ${
                          l.isCustom
                            ? "bg-primary"
                            : l.category === "Beauty"
                              ? "bg-danger-500"
                              : l.category === "Healthcare"
                                ? "bg-success-500"
                                : l.category === "Fitness"
                                  ? "bg-info-500"
                                  : l.category === "Consulting"
                                    ? "bg-primary-600"
                                    : l.category === "Education"
                                      ? "bg-warning-500"
                                      : "bg-success-500"
                        }`}
                      >
                        {l.initials}
                        {l.isCustom && (
                          <div className="absolute -top-1.5 -right-1.5 bg-warning-400 border border-surface text-neutral-900 rounded-full w-3.5 h-3.5 flex items-center justify-center text-[7px] font-bold">
                            ★
                          </div>
                        )}
                      </div>
                      {/* Pin pointer pin-tip */}
                      <div className="w-1.5 h-1.5 bg-surface border-r border-b border-neutral-200/80 rotate-45 -mt-1 shadow-sm" />
                    </button>
                  );
                })}

                {/* Active Pin Details Drawer Popup */}
                {activeListing && (
                  <div className="absolute top-3 left-3 w-64 bg-surface/95 backdrop-blur border border-border rounded-xl p-3.5 shadow-xl space-y-2.5 z-40 text-left">
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
                          <h6 className="text-[11px] font-black text-foreground leading-tight">
                            {activeListing.name}
                          </h6>
                          <span className="text-[8px] bg-background text-muted-foreground px-1.5 py-0.5 rounded font-bold">
                            {activeListing.category}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActivePinId(null)}
                        className="text-muted-foreground hover:text-foreground cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-[9.5px] text-muted-foreground leading-relaxed">
                      {activeListing.desc}
                    </p>
                    <div className="text-[9px] text-foreground space-y-0.5 font-semibold">
                      <div className="flex items-center gap-1">
                        <span>📍 {activeListing.location}</span>
                        {activeListing.location !== "Online / Remote" && (
                          <span className="text-muted-foreground">
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
                      <div className="text-success-surface-foreground font-extrabold flex items-center gap-1">
                        <span className="w-1 h-1 rounded-full bg-success-500" />
                        {activeListing.availability}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        handleSeeWorkflow(activeListing.category.toLowerCase())
                      }
                      className="w-full py-2 bg-primary hover:bg-primary-hover text-primary-foreground text-[9.5px] font-bold rounded-full shadow-sm transition cursor-pointer active:scale-[0.98]"
                    >
                      View booking page
                    </button>
                  </div>
                )}

                {/* Map Legend */}
                <div className="absolute bottom-3 right-3 bg-surface/90 backdrop-blur px-2.5 py-1.5 border border-border rounded-lg text-[8px] font-bold text-foreground flex gap-3 shadow-md z-20">
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <span>Your Location</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2.5 h-2.5 bg-primary rounded-full border border-surface flex items-center justify-center text-[5px] font-bold text-primary-foreground relative">
                      ★
                    </div>
                    <span>Your Listing</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-danger-500" />
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
                      className={`p-5 bg-surface border rounded-xl hover:border-primary/40 shadow-sm hover:shadow transition-all duration-300 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${
                        provider.isCustom
                          ? "border-primary/30 bg-primary/50"
                          : "border-border"
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
                            <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                              {provider.name}
                              {provider.isCustom && (
                                <span className="text-[8px] bg-primary/15 text-primary font-bold px-1.5 py-0.5 rounded-full">
                                  Your site
                                </span>
                              )}
                            </h3>
                            <span className="text-[9px] bg-background text-muted-foreground px-2 py-0.5 rounded-[4px] font-bold">
                              {provider.category}
                            </span>
                            {provider.tagLabel && (
                              <span
                                className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded border ${
                                  provider.tag === "verified"
                                    ? "bg-success-surface text-success-surface-foreground border-success-border"
                                    : provider.tag === "new"
                                      ? "bg-accent text-accent-foreground border-primary-100"
                                      : "bg-warning-surface text-warning-surface-foreground border-warning-border"
                                }`}
                              >
                                {provider.tagLabel}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1 leading-relaxed max-w-md">
                            {provider.desc}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-[10px] text-muted-foreground font-semibold flex-wrap">
                            <span>📍 {provider.location}</span>
                            <span>💵 Services from ${provider.price}</span>
                            <span className="inline-flex items-center gap-1 text-primary bg-primary px-1.5 py-0.5 rounded text-[9px] font-bold border border-success-border">
                              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
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
                        className="w-full sm:w-auto px-4 py-2 border border-border hover:border-primary hover:text-primary text-xs font-bold rounded-full transition-colors cursor-pointer text-center bg-surface active:scale-[0.98]"
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
                        className="flex items-center gap-1.5 px-5 py-2.5 border border-border rounded-full text-xs font-extrabold text-primary bg-surface hover:bg-primary transition-colors cursor-pointer shadow-sm"
                      >
                        Load more listings
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-[10px] text-muted-foreground mt-2 font-medium">
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
                    className="p-12 text-center border border-dashed border-border rounded-xl space-y-4 bg-background/40 select-none"
                  >
                    <div className="w-12 h-12 mx-auto bg-surface rounded-full flex items-center justify-center text-lg text-muted-foreground shadow-sm border border-border">
                      🔍
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-sm font-bold text-foreground">
                        {!marketplaceVisibility
                          ? "Listing is private"
                          : "No matching listings"}
                      </h3>
                      <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
                        {!marketplaceVisibility
                          ? "Your booking site will not appear to customers until you make it public."
                          : "Try widening your distance radius, selecting another category, or clearing filters."}
                      </p>
                    </div>
                    {marketplaceVisibility && (
                      <button
                        type="button"
                        onClick={clearAllFilters}
                        className="px-4 py-2 border border-border hover:border-primary hover:text-primary bg-surface text-xs font-bold rounded-full transition-colors cursor-pointer"
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
