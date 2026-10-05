import { nextJsConfig } from "@repo/eslint-config/next-js";

export default [
  { ignores: [".next-*/**"] },
  ...nextJsConfig,
  {
    files: ["src/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "sonner",
              message:
                "Use useToast from @repo/hooks; shared UI owns the Toaster.",
            },
          ],
        },
      ],
    },
  },
];
