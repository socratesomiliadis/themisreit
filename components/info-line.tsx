import { cn } from "@/lib/utils";

function LineItem({ text, className }: { text: string; className?: string }) {
  return (
    <div className={cn("flex flex-col", className)}>
      <div className="w-[1px] h-2.5 bg-white/20"></div>
      <div className="flex flex-row items-center gap-1 -ml-0.5">
        <span className="rounded-full size-1 bg-white"></span>
        <span className="text-white text-sm tracking-tight">{text}</span>
      </div>
    </div>
  );
}
export default function InfoLine({
  number,
  title,
  text,
}: {
  number: string;
  title: string;
  text: string;
}) {
  return (
    <div className="w-full relative">
      <div className="block w-full h-[1px] bg-white/20"> </div>
      <div className="w-full absolute flex flex-row justify-between">
        <div className="flex flex-row gap-[12vw]">
          <LineItem text={number} />
          <LineItem text={title} />
        </div>
        <div className="flex flex-col items-end">
          <div className="w-[1px] h-2.5 bg-white/20"></div>
          <span className="text-white text-sm tracking-tight">{text}</span>
        </div>
      </div>
    </div>
  );
}
