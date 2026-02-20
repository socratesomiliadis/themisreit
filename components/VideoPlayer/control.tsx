"use client";

import { Slider } from "@/components/ui/slider";

const Control = ({
  onPlayPause,
  playing,
  onRewind,
  onForward,
  played,
  onSeek,
  onSeekMouseUp,
  onVolumeChangeHandler,
  onVolumeSeekUp,
  volume,
  mute,
  onMute,
  duration,
  currentTime,
  onMouseSeekDown,
  controlRef,
  toggleFullScreen,
  isFullScreen,
  color = "#51FD01",
}: {
  onPlayPause: () => void;
  playing: boolean;
  onRewind: () => void;
  onForward: () => void;
  played: number;
  onSeek: (newValue: any) => void;
  onSeekMouseUp: (newValue: any) => void;
  onVolumeChangeHandler: (newValue: any) => void;
  onVolumeSeekUp: (newValue: any) => void;
  volume: number;
  mute: boolean;
  onMute: () => void;
  duration: string;
  currentTime: string;
  onMouseSeekDown: (e: any) => void;
  controlRef: any;
  toggleFullScreen: () => void;
  isFullScreen: boolean;
  color?: string;
}) => {
  return (
    <div
      style={{
        borderRadius: isFullScreen ? "0" : "1rem",
      }}
      className="absolute overflow-hidden pointer-events-none z-3 inset-0 w-full h-full flex flex-col justify-end"
      ref={controlRef}
    >
      <div className="bottom-wrapper pointer-events-auto w-full px-6 pt-8 pb-4 bg-linear-to-t from-black/80 to-transparent">
        <div className="w-full">
          <Slider
            //@ts-expect-error
            trackColor="#fcfcfc30"
            indicatorColor={color}
            onValueCommit={onSeekMouseUp}
            onValueChange={onSeek}
            onMouseDown={onMouseSeekDown}
            defaultValue={[0]}
            value={[played * 100]}
            max={100}
            step={1}
          />
        </div>
        <div className="left-control__box w-full mt-4 flex flex-row items-center justify-between">
          <div className="inner__controls flex flex-row items-center gap-3 text-white">
            <div
              className="icon__btn w-4 h-4 flex items-center justify-center cursor-pointer"
              onClick={onPlayPause}
            >
              {playing ? (
                <svg
                  width="100%"
                  height="100%"
                  viewBox="0 0 128 144"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M24 0C10.7452 0 0 10.7452 0 24V120C0 133.255 10.7452 144 24 144C37.2548 144 48 133.255 48 120V24C48 10.7452 37.2548 0 24 0Z"
                    fill="currentColor"
                  />
                  <path
                    d="M104 0C90.7452 0 80 10.7452 80 24V120C80 133.255 90.7452 144 104 144C117.255 144 128 133.255 128 120V24C128 10.7452 117.255 0 104 0Z"
                    fill="currentColor"
                  />
                </svg>
              ) : (
                <svg
                  width="100%"
                  height="100%"
                  viewBox="0 0 147 156"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M53.466 5.20629C30.5162 -8.50228 0 6.46137 0 31.4233V124.577C0 149.539 30.5163 164.502 53.4661 150.794L131.441 104.217C152.186 91.8253 152.186 64.1747 131.441 51.7829L53.466 5.20629Z"
                    fill="currentColor"
                  />
                </svg>
              )}
            </div>

            <div className="volume-wrapper group flex flex-row items-center gap-1">
              <div
                className="icon__btn w-5 flex items-center justify-center cursor-pointer"
                onClick={onMute}
              >
                {mute ? (
                  <svg
                    width="100%"
                    height="100%"
                    viewBox="0 0 181 148"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M73.4072 3.89976C84.3738 -5.15792 101.023 2.57119 101.023 16.7197V131.28C101.023 145.429 84.3737 153.158 73.4072 144.1L41.3866 117.653C39.8737 116.404 37.9666 115.719 35.9971 115.719H25.2558C11.3074 115.719 0 104.512 0 90.6877V57.3123C0 43.4877 11.3074 32.2806 25.2558 32.2806H35.9971C37.9666 32.2806 39.8737 31.5963 41.3866 30.3467L73.4072 3.89976Z"
                      fill="currentColor"
                    />
                    <path
                      d="M178.534 63.2123C181.822 59.9538 181.822 54.6708 178.534 51.4123C175.247 48.1538 169.916 48.1538 166.629 51.4123L154.723 63.2123L142.817 51.4123C139.529 48.1538 134.199 48.1538 130.911 51.4123C127.624 54.6708 127.624 59.9538 130.911 63.2123L142.817 75.0123L130.911 86.8123C127.624 90.0708 127.624 95.3539 130.911 98.6124C134.199 101.871 139.529 101.871 142.817 98.6124L154.723 86.8123L166.629 98.6124C169.916 101.871 175.247 101.871 178.534 98.6124C181.822 95.3539 181.822 90.0708 178.534 86.8123L166.629 75.0123L178.534 63.2123Z"
                      fill="currentColor"
                    />
                  </svg>
                ) : volume > 0.5 ? (
                  <svg
                    width="100%"
                    viewBox="0 0 220 178"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M120 20.1088C120 3.09238 100.223 -6.20344 87.1964 4.69025L49.1609 36.4981C47.3637 38.001 45.0984 38.824 42.759 38.824H30C13.4315 38.824 0 52.3027 0 68.9296V109.07C0 125.697 13.4315 139.176 30 139.176H42.759C45.0984 139.176 47.3637 139.999 49.1609 141.502L87.1964 173.31C100.223 184.203 120 174.908 120 157.891V20.1088Z"
                      fill="currentColor"
                    />
                    <path
                      d="M187.782 10.9532C183.876 7.0342 177.545 7.0342 173.64 10.9532C169.734 14.8722 169.734 21.2261 173.64 25.1451C189.937 41.5002 200 64.0657 200 89.0087C200 113.952 189.937 136.517 173.64 152.872C169.734 156.791 169.734 163.145 173.64 167.064C177.545 170.983 183.876 170.983 187.782 167.064C207.677 147.099 220 119.489 220 89.0087C220 58.5289 207.677 30.9184 187.782 10.9532Z"
                      fill="currentColor"
                    />
                    <path
                      d="M155.963 42.8816C152.058 38.9626 145.726 38.9626 141.821 42.8816C137.915 46.8006 137.915 53.1545 141.821 57.0735C149.975 65.2566 155.001 76.5324 155.001 89.0053C155.001 101.478 149.975 112.754 141.821 120.937C137.915 124.856 137.915 131.21 141.821 135.129C145.726 139.048 152.058 139.048 155.963 135.129C167.715 123.336 175.001 107.015 175.001 89.0053C175.001 70.9957 167.715 54.6747 155.963 42.8816Z"
                      fill="currentColor"
                    />
                  </svg>
                ) : (
                  <svg
                    width="70%"
                    viewBox="0 0 144 160"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M78.4765 4.21596C90.2003 -5.57613 108 2.77966 108 18.0753V141.925C108 157.22 90.2003 165.576 78.4764 155.784L44.2446 127.193C42.6272 125.842 40.5884 125.102 38.483 125.102H26.9999C12.0883 125.102 0 112.986 0 98.0408V61.9592C0 47.0137 12.0883 34.898 26.9999 34.898H38.483C40.5884 34.898 42.6272 34.1582 44.2446 32.8072L78.4765 4.21596Z"
                      fill="currentColor"
                    />
                    <path
                      d="M137.974 57.4426C135.485 53.1304 129.979 51.6569 125.677 54.1515C121.374 56.6461 119.904 62.1641 122.393 66.4764C124.685 70.4476 126 75.0567 126 80.0008C126 84.945 124.685 89.5541 122.393 93.5253C119.904 97.8376 121.374 103.356 125.677 105.85C129.979 108.345 135.485 106.871 137.974 102.559C141.808 95.9158 144 88.2012 144 80.0008C144 71.8005 141.808 64.0859 137.974 57.4426Z"
                      fill="currentColor"
                    />
                  </svg>
                )}
              </div>
              <Slider
                //@ts-expect-error
                trackColor="#fcfcfc40"
                indicatorColor={color}
                className="w-0 group-hover:w-20 transition-[width] duration-200 ease-out"
                onValueChange={onVolumeChangeHandler}
                value={[!mute ? volume * 100 : 0]}
                onValueCommit={onVolumeSeekUp}
              />
            </div>

            <span className="text-white">
              {currentTime} / {duration}
            </span>
          </div>
          <div className="right-control__box flex flex-row items-center gap-3 text-white">
            <div
              className="icon__btn w-4 flex items-center justify-center cursor-pointer"
              onClick={toggleFullScreen}
            >
              {isFullScreen ? (
                <svg
                  width="100%"
                  viewBox="0 0 186 191"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M53 13C53 35.0914 35.0914 53 13 53"
                    stroke="currentColor"
                    strokeWidth="24.25"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M133 13C133 35.0914 150.909 53 173 53"
                    stroke="currentColor"
                    strokeWidth="24.25"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M53 178C53 155.909 35.0914 138 13 138"
                    stroke="currentColor"
                    strokeWidth="24.25"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M133 178C133 155.909 150.909 138 173 138"
                    stroke="currentColor"
                    strokeWidth="24.25"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : (
                <svg
                  width="100%"
                  viewBox="0 0 186 186"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M53 13H43C26.4315 13 13 26.4315 13 43V53M133 13H143C159.569 13 173 26.4315 173 43V53M173 133V143C173 159.569 159.569 173 143 173H133M53 173H43C26.4315 173 13 159.569 13 143V133"
                    stroke="currentColor"
                    strokeWidth="24.25"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Control;
