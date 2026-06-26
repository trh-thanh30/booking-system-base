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
      <div className="w-12 h-3 bg-text-primary rounded-full mx-auto mb-2 flex items-center justify-center">
        <div className="w-1 h-1 rounded-full bg-text-muted" />
      </div>

      {/* Fake Shop Info */}
      <div className="text-center mb-3">
        <div className="w-8 h-8 rounded-full bg-brand-blue text-white flex items-center justify-center mx-auto mb-1 text-xs font-bold shadow-sm">
          L
        </div>
        <h4 className="text-[10px] font-extrabold text-text-primary leading-tight">
          LUMIÈRE SPA & BEAUTY
        </h4>
        <div className="flex items-center justify-center gap-0.5 mt-0.5">
          <Star className="w-2.5 h-2.5 fill-yellow-400 stroke-yellow-400" />
          <span className="text-[8px] font-bold text-text-primary">
            4.9 (186 reviews)
          </span>
        </div>
      </div>

      {/* Service Select */}
      <div className="space-y-1.5 mb-3">
        <span className="text-[8px] font-extrabold text-text-muted block">
          SELECT SERVICE
        </span>

        <div
          onClick={() => handleSelectServiceManual("spa")}
          className={`p-1.5 border rounded-[4px] cursor-pointer flex items-center justify-between transition-colors ${
            selectedService === "spa"
              ? "border-brand-blue bg-[#E5F0FF]/40"
              : "border-border-light hover:border-text-secondary"
          }`}
        >
          <div>
            <span className="text-[9px] font-bold text-text-primary block leading-none">
              Hot Stone Massage
            </span>
            <span className="text-[7px] text-text-muted">60 mins</span>
          </div>
          <span className="text-[9px] font-bold text-brand-blue">$65.00</span>
        </div>

        <div
          onClick={() => handleSelectServiceManual("hair")}
          className={`p-1.5 border rounded-[4px] cursor-pointer flex items-center justify-between transition-colors ${
            selectedService === "hair"
              ? "border-brand-blue bg-[#E5F0FF]/40"
              : "border-border-light hover:border-text-secondary"
          }`}
        >
          <div>
            <span className="text-[9px] font-bold text-text-primary block leading-none">
              Deep Cleansing Facial
            </span>
            <span className="text-[7px] text-text-muted">75 mins</span>
          </div>
          <span className="text-[9px] font-bold text-brand-blue">$85.00</span>
        </div>
      </div>

      {/* Time Slots */}
      <div className="mb-3">
        <span className="text-[8px] font-extrabold text-text-muted block mb-1">
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
                      ? "bg-bg-secondary text-text-muted border-border-light cursor-not-allowed line-through"
                      : isSelected
                        ? "bg-brand-blue text-white border-transparent font-bold"
                        : "border-border-light hover:border-text-primary bg-bg-primary text-text-primary"
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
        className={`w-full py-1.5 text-white text-[9px] font-bold rounded-full shadow-sm transition-all duration-300 flex items-center justify-center gap-1 cursor-pointer ${
          isBooked
            ? "bg-emerald-500 hover:bg-emerald-600"
            : isBookingLoading
              ? "bg-brand-blue/80"
              : "bg-brand-blue hover:bg-brand-blue-hover"
        }`}
      >
        {isBookingLoading ? (
          <>
            <span className="w-2.5 h-2.5 border border-white/30 border-t-white rounded-full animate-spin" />
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
