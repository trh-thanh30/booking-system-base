export type ChallengeId = "1" | "2" | "3" | "4";

export interface ChallengeMeta {
  id: ChallengeId;
  title: string;
  desc: string;
  iconName: "calendar" | "credit-card" | "message-square" | "users";
  tone: "red" | "yellow" | "blue" | "purple";
}

export interface ComparisonPair {
  id: ChallengeId;
  manualText: string;
  manualExplain: string;
  systemText: string;
  systemExplain: string;
}
