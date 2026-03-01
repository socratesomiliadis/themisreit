type ControlButtonProps = {
  label: string;
  title: string;
  onClick: () => void;
  danger?: boolean;
  muted?: boolean;
  disabled?: boolean;
  badgeCount?: number;
};

export function ControlButton({
  label,
  title,
  onClick,
  danger,
  muted,
  disabled,
  badgeCount,
}: ControlButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      disabled={disabled}
      className={[
        "relative inline-flex size-[74px] items-center justify-center rounded-full border text-2xl transition disabled:cursor-not-allowed disabled:opacity-60",
        danger
          ? "border-red-500 bg-[#ff5449] text-white hover:bg-[#ff463a]"
          : muted
            ? "border-white/25 bg-[#20232d] text-white"
            : "border-transparent bg-white text-black hover:bg-white/90",
      ].join(" ")}
    >
      <span aria-hidden>{label}</span>
      {badgeCount && badgeCount > 0 ? (
        <span className="absolute top-0 right-0 grid min-h-5 min-w-5 -translate-y-1/4 translate-x-1/5 place-items-center rounded-full bg-[#ff5449] px-1 text-[10px] font-semibold leading-none text-white">
          {badgeCount > 99 ? "99+" : badgeCount}
        </span>
      ) : null}
    </button>
  );
}
