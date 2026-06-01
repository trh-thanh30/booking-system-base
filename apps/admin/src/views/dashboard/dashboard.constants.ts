import { Activity, CreditCard, DollarSign, Users } from "lucide-react";

export const dashboardStats = [
  {
    title: "Total Revenue",
    value: "$45,231.89",
    description: "+20.1% from last month",
    trend: "Live",
    icon: DollarSign,
  },
  {
    title: "Subscriptions",
    value: "+2350",
    description: "+180.1% from last month",
    trend: "+12%",
    icon: Users,
  },
  {
    title: "Sales",
    value: "+12,234",
    description: "+19% from last month",
    trend: "+19%",
    icon: CreditCard,
  },
  {
    title: "Active Now",
    value: "+573",
    description: "+201 since last hour",
    trend: "Now",
    icon: Activity,
  },
];

export const dashboardTabs = [
  {
    label: "Overview",
    value: "overview",
  },
  {
    label: "Analytics",
    value: "analytics",
  },
  {
    label: "Reports",
    value: "reports",
  },
  {
    label: "Notifications",
    value: "notifications",
  },
] as const;
