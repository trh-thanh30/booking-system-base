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
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-danger-400" />
          <div className="w-2.5 h-2.5 rounded-full bg-warning-400" />
          <div className="w-2.5 h-2.5 rounded-full bg-success-400" />
          <span className="text-[10px] font-bold text-muted-foreground ml-2">
            Booking Base Dashboard v1.0
          </span>
        </div>
        <div className="bg-accent text-primary text-[9px] font-bold px-2 py-0.5 rounded">
          Spa & Beauty
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-2.5 mb-4">
        <div className="p-2 border border-border rounded-[4px] bg-background/40 transition-colors duration-300">
          <span className="text-[9px] text-muted-foreground block">
            Today&apos;s Bookings
          </span>
          <motion.span
            animate={
              flashBookings
                ? {
                    scale: [1, 1.15, 1],
                    color: [
                      "var(--color-foreground)",
                      "var(--color-success)",
                      "var(--color-foreground)",
                    ],
                  }
                : {}
            }
            transition={{ duration: 0.5 }}
            className="text-sm font-bold text-foreground block"
          >
            {bookingsCount} bookings
          </motion.span>
        </div>
        <div className="p-2 border border-border rounded-[4px] bg-background/40 transition-colors duration-300">
          <span className="text-[9px] text-muted-foreground block">
            Today&apos;s Revenue
          </span>
          <motion.span
            animate={
              flashRevenue
                ? {
                    scale: [1, 1.15, 1],
                    color: [
                      "var(--color-primary)",
                      "var(--color-success)",
                      "var(--color-primary)",
                    ],
                  }
                : {}
            }
            transition={{ duration: 0.5 }}
            className="text-sm font-bold text-primary block"
          >
            ${revenueAmount.toFixed(2)}
          </motion.span>
        </div>
        <div className="p-2 border border-border rounded-[4px] bg-background/40">
          <span className="text-[9px] text-muted-foreground block">
            Cancellation Rate
          </span>
          <span className="text-sm font-bold text-success-500">0.8%</span>
        </div>
      </div>

      {/* Lịch làm việc nhân sự */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-[10px] font-bold text-muted-foreground">
          <span>Staff Shift Status</span>
          <span className="text-primary hover:underline cursor-pointer">
            View All
          </span>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between p-2 border border-border rounded-[4px] hover:border-foreground transition-colors">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-accent flex items-center justify-center text-[10px] font-bold text-primary">
                EC
              </div>
              <div>
                <span className="text-[10px] font-bold text-foreground block leading-none">
                  Stylist Emily Cooper
                </span>
                <span className="text-[8px] text-muted-foreground">
                  Morning Shift: 08:30 - 14:00
                </span>
              </div>
            </div>
            <span className="text-[9px] bg-success-surface text-success-surface-foreground font-bold px-2 py-0.5 rounded-[2px]">
              Busy (3 bookings)
            </span>
          </div>

          <div className="flex items-center justify-between p-2 border border-border rounded-[4px] hover:border-foreground transition-colors">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-info-surface flex items-center justify-center text-[10px] font-bold text-info-surface-foreground">
                SJ
              </div>
              <div>
                <span className="text-[10px] font-bold text-foreground block leading-none">
                  Therapist Sarah Jenkins
                </span>
                <span className="text-[8px] text-muted-foreground">
                  Afternoon Shift: 14:00 - 21:00
                </span>
              </div>
            </div>
            <span className="text-[9px] bg-accent text-primary font-bold px-2 py-0.5 rounded-[2px]">
              Available
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
