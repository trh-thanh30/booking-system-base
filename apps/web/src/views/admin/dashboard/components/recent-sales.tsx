import { Avatar, AvatarFallback } from "@repo/ui";

const sales = [
  {
    amount: "+$1,999.00",
    email: "olivia.martin@email.com",
    initials: "OM",
    name: "Olivia Martin",
  },
  {
    amount: "+$39.00",
    email: "jackson.lee@email.com",
    initials: "JL",
    name: "Jackson Lee",
  },
  {
    amount: "+$299.00",
    email: "isabella.nguyen@email.com",
    initials: "IN",
    name: "Isabella Nguyen",
  },
  {
    amount: "+$99.00",
    email: "will@email.com",
    initials: "WK",
    name: "William Kim",
  },
  {
    amount: "+$39.00",
    email: "sofia.davis@email.com",
    initials: "SD",
    name: "Sofia Davis",
  },
];

export function RecentSales() {
  return (
    <div className="divide-y divide-border">
      {sales.map((sale) => (
        <div
          className="flex items-center py-3 first:pt-0 last:pb-0"
          key={sale.email}
        >
          <Avatar className="h-9 w-9">
            <AvatarFallback>{sale.initials}</AvatarFallback>
          </Avatar>
          <div className="ml-4 min-w-0 flex-1 space-y-1">
            <p className="truncate text-sm font-medium leading-none text-foreground">
              {sale.name}
            </p>
            <p className="truncate text-sm text-muted-foreground">
              {sale.email}
            </p>
          </div>
          <div className="ml-4 text-sm font-semibold tabular-nums text-foreground">
            {sale.amount}
          </div>
        </div>
      ))}
    </div>
  );
}
