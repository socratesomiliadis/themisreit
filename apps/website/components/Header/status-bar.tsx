export default function StatusBar() {
  return (
    <div className="absolute right-14 status-bar h-fit text-[#B9B9B9] px-8 py-3 rounded-full bg-[#1e1e1e]/80 backdrop-blur text-sm flex flex-row items-center gap-5">
      <span className="block size-4">
        <svg
          width="100%"
          viewBox="0 0 17 17"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M16.4092 0.792488L14.6935 1.5734C14.5836 1.6241 14.4822 1.6934 14.396 1.77961L11.6001 4.57701L1.97181 3.42256C1.7977 3.40227 1.62191 3.46143 1.49851 3.58651L0.962663 4.12233C0.678682 4.4063 0.76658 4.88633 1.13339 5.05029L8.03346 8.14349L6.05235 10.1245H2.59217C2.44004 10.1245 2.29467 10.1853 2.18649 10.2918L1.89743 10.5825C1.61007 10.8699 1.70473 11.355 2.07661 11.5139L4.99587 12.7647L6.24674 15.6838C6.40564 16.0556 6.89246 16.1503 7.17815 15.863L7.46888 15.5722C7.57706 15.4641 7.63622 15.3187 7.63622 15.1666V11.7066L9.61733 9.72559L12.7107 16.627C12.8747 16.9938 13.3547 17.0817 13.6387 16.7977L14.1745 16.2619C14.2996 16.1368 14.3588 15.9627 14.3385 15.7886L13.1823 6.16082L15.9798 3.36341C16.0661 3.27721 16.1354 3.17748 16.1861 3.06592L16.967 1.3503C17.131 0.997012 16.7659 0.630222 16.4092 0.792488Z"
            fill="currentColor"
          />
        </svg>
      </span>
      <span className="">Currently Traveling to</span>
      <span className="block w-4">
        <svg
          width="100%"
          viewBox="0 0 14 12"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M7.59425 0.701172L12.7529 5.85984L7.59425 11.0185M0.224708 5.85984L12.3845 5.85985"
            stroke="white"
            strokeWidth="1.47391"
          />
        </svg>
      </span>
      <span className="text-white">Abu Dhabi</span>
    </div>
  );
}
