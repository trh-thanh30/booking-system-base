import { ChallengeMeta, ComparisonPair } from "./Challenges.types";

export const CHALLENGES: ChallengeMeta[] = [
  {
    id: "1",
    title: "Double-booked slots",
    desc: "Two customers can end up choosing the same time because availability is not updated in one place.",
    iconName: "calendar",
    tone: "red",
  },
  {
    id: "2",
    title: "No-shows without deposits",
    desc: "Customers forget appointments more often when there is no deposit, confirmation or automatic reminder.",
    iconName: "credit-card",
    tone: "yellow",
  },
  {
    id: "3",
    title: "Too many manual messages",
    desc: "You spend hours asking for preferred times, confirming details and updating schedules manually.",
    iconName: "message-square",
    tone: "blue",
  },
  {
    id: "4",
    title: "Staff schedule conflicts",
    desc: "Without staff availability synced, customers may book times that your team cannot actually serve.",
    iconName: "users",
    tone: "purple",
  },
];

export const COMPARISONS: ComparisonPair[] = [
  {
    id: "1",
    manualText: "Check notes or calendars manually",
    manualExplain:
      "No single source of truth — every manual change risks a scheduling conflict.",
    systemText: "Available slots update automatically",
    systemExplain:
      "Real-time synchronization prevents two customers from picking the same slot.",
  },
  {
    id: "2",
    manualText: "Hope customers show up — no deposit",
    manualExplain:
      "Late cancellations or forgetful no-shows waste the slot and your staff's active hours.",
    systemText: "Deposit or payment collected upfront",
    systemExplain:
      "Customers have skin in the game — no-shows drop by up to 90% immediately.",
  },
  {
    id: "3",
    manualText: "Message customers back and forth",
    manualExplain:
      "Hours spent confirming times, service details, and staff — extremely easy to lose track.",
    systemText: "Customers book service & staff online",
    systemExplain:
      "Zero back-and-forth — they pick exactly what fits their schedule instantly.",
  },
  {
    id: "4",
    manualText: "Confirm staff availability one by one",
    manualExplain:
      "Customers book slots that nobody on your team is actually free or working to serve.",
    systemText: "Automated booking reminders sent",
    systemExplain:
      "Syncs with staff work schedules and sends automated SMS/Email confirmations.",
  },
];
