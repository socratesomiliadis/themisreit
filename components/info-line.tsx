export default function InfoLine({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  return (
    <div className="w-full relative flex flex-col gap-2">
      <div className="w-full flex flex-row justify-between text-white tracking-tight">
        <span>{title}</span>
        <span>{text}</span>
      </div>
      <div className="block w-full h-[1px] bg-white/20"> </div>
    </div>
  );
}
