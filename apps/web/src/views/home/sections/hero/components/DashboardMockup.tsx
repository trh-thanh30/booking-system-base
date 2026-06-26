import { motion } from "framer-motion";

interface DashboardMockupProps {
  bookingsCount: number;
  revenueAmount: number;
  flashBookings: boolean;
  flashRevenue: boolean;
}

export function DashboardMockup({
  bookingsCount,
  revenueAmount,
  flashBookings,
  flashRevenue,
}: DashboardMockupProps) {
  return (
    <>
      {/* Fake Dashboard Header */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-border-light">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
          <span className="text-[10px] font-bold text-text-muted ml-2">
            Booking Base Dashboard v1.0
          </span>
        </div>
        <div className="bg-[#E5F0FF] text-brand-blue text-[9px] font-bold px-2 py-0.5 rounded">
          Spa & Beauty
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-2.5 mb-4">
        <div className="p-2 border border-border-light rounded-[4px] bg-bg-secondary/40 transition-colors duration-300">
          <span className="text-[9px] text-text-muted block">
            Today&apos;s Bookings
          </span>
          <motion.span
            animate={
              flashBookings
                ? {
                    scale: [1, 1.15, 1],
                    color: ["#111827", "#10b981", "#111827"],
                  }
                : {}
            }
            transition={{ duration: 0.5 }}
            className="text-sm font-bold text-text-primary block"
          >
            {bookingsCount} bookings
          </motion.span>
        </div>
        <div className="p-2 border border-border-light rounded-[4px] bg-bg-secondary/40 transition-colors duration-300">
          <span className="text-[9px] text-text-muted block">
            Today&apos;s Revenue
          </span>
          <motion.span
            animate={
              flashRevenue
                ? {
                    scale: [1, 1.15, 1],
                    color: ["#3b82f6", "#10b981", "#3b82f6"],
                  }
                : {}
            }
            transition={{ duration: 0.5 }}
            className="text-sm font-bold text-brand-blue block"
          >
            ${revenueAmount.toFixed(2)}
          </motion.span>
        </div>
        <div className="p-2 border border-border-light rounded-[4px] bg-bg-secondary/40">
          <span className="text-[9px] text-text-muted block">
            Cancellation Rate
          </span>
          <span className="text-sm font-bold text-emerald-500">0.8%</span>
        </div>
      </div>

      {/* Lịch làm việc nhân sự */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-[10px] font-bold text-text-muted">
          <span>Staff Shift Status</span>
          <span className="text-brand-blue hover:underline cursor-pointer">
            View All
          </span>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between p-2 border border-border-light rounded-[4px] hover:border-text-secondary transition-colors">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-[#E5F0FF] flex items-center justify-center text-[10px] font-bold text-brand-blue">
                EC
              </div>
              <div>
                <span className="text-[10px] font-bold text-text-primary block leading-none">
                  Stylist Emily Cooper
                </span>
                <span className="text-[8px] text-text-muted">
                  Morning Shift: 08:30 - 14:00
                </span>
              </div>
            </div>
            <span className="text-[9px] bg-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded-[2px]">
              Busy (3 bookings)
            </span>
          </div>

          <div className="flex items-center justify-between p-2 border border-border-light rounded-[4px] hover:border-text-secondary transition-colors">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center text-[10px] font-bold text-purple-700">
                SJ
              </div>
              <div>
                <span className="text-[10px] font-bold text-text-primary block leading-none">
                  Therapist Sarah Jenkins
                </span>
                <span className="text-[8px] text-text-muted">
                  Afternoon Shift: 14:00 - 21:00
                </span>
              </div>
            </div>
            <span className="text-[9px] bg-[#E5F0FF] text-brand-blue font-bold px-2 py-0.5 rounded-[2px]">
              Available
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
