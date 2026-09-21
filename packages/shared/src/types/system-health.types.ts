export type HealthServiceStatus = "Healthy" | "Pending";

export type ServiceCheckSummary = {
  latency: string;
  name: string;
  status: HealthServiceStatus;
  target: string;
};
