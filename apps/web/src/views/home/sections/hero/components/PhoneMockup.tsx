import { Check, Star } from "lucide-react";

interface PhoneMockupProps {
  selectedService: string;
  selectedTimeSlot: string;
  isBooked: boolean;
  isBookingLoading: boolean;
  handleSelectServiceManual: (srv: string) => void;
  handleSelectSlotManual: (slot: string) => void;
  handleBookManual: () => void;
}

export function PhoneMockup({
  selectedService,
  selectedTimeSlot,
  isBooked,
  isBookingLoading,
  handleSelectServiceManual,
  handleSelectSlotManual,
  handleBookManual,
}: PhoneMockupProps) {
  return (
    <>
      {/* Speaker / Camera notches */}
      <div className="w-12 h-3 bg-foreground rounded-full mx-auto mb-2 flex items-center justify-center">
        <div className="w-1 h-1 rounded-full bg-muted-foreground" />
      </div>

      {/* Fake Shop Info */}
      <div className="text-center mb-3">
        <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-1 text-xs font-bold shadow-sm">
          L
        </div>
        <h4 className="text-[10px] font-extrabold text-foreground leading-tight">
          LUMIÈRE SPA & BEAUTY
        </h4>
        <div className="flex items-center justify-center gap-0.5 mt-0.5">
          <Star className="w-2.5 h-2.5 fill-warning-400 stroke-warning-400" />
          <span className="text-[8px] font-bold text-foreground">
            4.9 (186 reviews)
          </span>
        </div>
      </div>

      {/* Service Select */}
      <div className="space-y-1.5 mb-3">
        <span className="text-[8px] font-extrabold text-muted-foreground block">
          SELECT SERVICE
        </span>

        <div
          onClick={() => handleSelectServiceManual("spa")}
          className={`p-1.5 border rounded-[4px] cursor-pointer flex items-center justify-between transition-colors ${
            selectedService === "spa"
              ? "border-primary bg-accent/40"
              : "border-border hover:border-foreground"
          }`}
        >
          <div>
            <span className="text-[9px] font-bold text-foreground block leading-none">
              Hot Stone Massage
            </span>
            <span className="text-[7px] text-muted-foreground">60 mins</span>
          </div>
          <span className="text-[9px] font-bold text-primary">$65.00</span>
        </div>

        <div
          onClick={() => handleSelectServiceManual("hair")}
          className={`p-1.5 border rounded-[4px] cursor-pointer flex items-center justify-between transition-colors ${
            selectedService === "hair"
              ? "border-primary bg-accent/40"
              : "border-border hover:border-foreground"
          }`}
        >
          <div>
            <span className="text-[9px] font-bold text-foreground block leading-none">
              Deep Cleansing Facial
            </span>
            <span className="text-[7px] text-muted-foreground">75 mins</span>
          </div>
          <span className="text-[9px] font-bold text-primary">$85.00</span>
        </div>
      </div>

      {/* Time Slots */}
      <div className="mb-3">
        <span className="text-[8px] font-extrabold text-muted-foreground block mb-1">
          SELECT TIME SLOT
        </span>
        <div className="grid grid-cols-3 gap-1">
          {["09:00", "10:30", "13:00", "15:00", "16:30", "18:00"].map(
            (slot) => {
              const isSlotDisabled = slot === "13:00";
              const isSelected = selectedTimeSlot === slot;
              return (
                <button
                  key={slot}
                  type="button"
                  disabled={isSlotDisabled}
                  onClick={() => handleSelectSlotManual(slot)}
                  className={`text-[8px] py-1 border rounded-[2px] font-medium transition-all ${
                    isSlotDisabled
                      ? "bg-background text-muted-foreground border-border cursor-not-allowed line-through"
                      : isSelected
                        ? "bg-primary text-primary-foreground border-transparent font-bold"
                        : "border-border hover:border-foreground bg-surface text-foreground"
                  }`}
                >
                  {slot}
                </button>
              );
            },
          )}
        </div>
      </div>

      {/* Action Button */}
      <button
        type="button"
        disabled={isBooked || isBookingLoading}
        onClick={handleBookManual}
        className={`w-full py-1.5 text-primary-foreground text-[9px] font-bold rounded-full shadow-sm transition-all duration-300 flex items-center justify-center gap-1 cursor-pointer ${
          isBooked
            ? "bg-success-500 hover:bg-success-600"
            : isBookingLoading
              ? "bg-primary/80"
              : "bg-primary hover:bg-primary-hover"
        }`}
      >
        {isBookingLoading ? (
          <>
            <span className="w-2.5 h-2.5 border border-surface/30 border-t-white rounded-full animate-spin" />
            <span>Booking...</span>
          </>
        ) : isBooked ? (
          <>
            <Check className="w-2.5 h-2.5 stroke-[3]" />
            <span>Booked!</span>
          </>
        ) : (
          <span>
            Book & Pay Deposit (${selectedService === "spa" ? 15 : 18})
          </span>
        )}
      </button>
    </>
  );
}
