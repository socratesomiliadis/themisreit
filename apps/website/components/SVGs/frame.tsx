import { cn } from "@/lib/utils";

export default function Frame({ className }: { className?: string }) {
  return (
    <svg
      className={cn("", className)}
      width="100%"
      height="100%"
      preserveAspectRatio="none"
      viewBox="0 0 1874 877"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M1858.51 0.5C1858.67 4.24077 1860.57 7.90622 1863.33 10.666C1866.09 13.4258 1869.76 15.3298 1873.5 15.4873V861.512C1869.76 861.669 1866.09 863.574 1863.33 866.334C1860.57 869.094 1858.67 872.759 1858.51 876.5H15.4883C15.3308 872.759 13.4258 869.094 10.666 866.334C7.90622 863.574 4.24077 861.669 0.5 861.512V15.4873C4.24076 15.3298 7.90623 13.4258 10.666 10.666C13.4258 7.90622 15.3308 4.24077 15.4883 0.5H1858.51Z"
        stroke="currentColor"
      />
    </svg>
  );
}
