import { cn } from "@/lib/utils";
import SimpleMarquee from "./simple-marquee";

export default function TitleMarquee({
  title,
  number,
  className,
}: {
  title: string;
  number: number;
  className?: string;
}) {
  return (
    <SimpleMarquee
      direction="left"
      repeat={6}
      className={cn(
        "py-0 text-[#434343] markos border-y border-[#303030]/10 h-[4.6rem] items-center",
        className
      )}
    >
      <div className="relative font-ballet text-9xl mt-5 pr-2">
        {title}{" "}
        <span className="text-[#5E5E5E] font-helvetica-now text-lg absolute top-4 -right-8">
          ({number.toString().padStart(2, "0")})
        </span>
      </div>
      <div className="text-8xl px-10 flex items-center gap-6 tracking-tight">
        <span className="w-12 h-[6px] bg-[#434343]"></span>
        By Pensatori Irrazionali
        <span className="w-12 h-[6px] bg-[#434343]"></span>
      </div>
    </SimpleMarquee>
  );
}
