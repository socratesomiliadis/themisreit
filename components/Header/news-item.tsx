import Image from "next/image";

export default function NewsItem({
  tag,
  title,
  date,
  description,
  image,
}: {
  tag: string;
  title: string;
  date: string;
  description: string;
  image: string;
}) {
  return (
    <div className="bg-[#1e1e1e]/80 hover:bg-[#1e1e1e]/60 transition-colors duration-200 ease-out cursor-pointer news-item opacity-0 -translate-y-8 rounded-2xl  backdrop-blur-xl gap-12 flex justify-between overflow-hidden p-5 basis-1/4">
      <div className="flex flex-col justify-between">
        <span className="text-[#5E5E5E] text-sm tracking-tighter font-medium">
          ({tag})
        </span>
        <div className="flex flex-col">
          <div className="flex flex-row items-center text-white font-semibold text-xl gap-3">
            <span>{title}</span>
            <span className="w-4 block">
              <svg
                width="100%"
                viewBox="0 0 19 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M10 1L17 7.99998L10 15M0 7.99998L16.5 8"
                  stroke="currentColor"
                  strokeWidth="2"
                />
              </svg>
            </span>
            <span>{date}</span>
          </div>
          <p className="text-[#B9B9B9] max-w-[18vw]">{description}</p>
        </div>
      </div>
      <div className="w-auto h-auto aspect-square">
        <Image
          src={image}
          width={800}
          height={800}
          alt=""
          className="rounded-2xl w-full h-full object-cover"
        />
      </div>
    </div>
  );
}
