"use client";

import ReactPlayer from "react-player";
import Control from "./control";
import { useState, useRef, useEffect } from "react";
import { formatTime } from "@/lib/utils";
import screenfull from "screenfull";
import { gsap } from "gsap";

let count = 0;

export default function Player({
  url,
  doAutoPlay = true,
  color = "#51FD01",
}: {
  url: string;
  doAutoPlay?: boolean;
  color?: string;
}) {
  const videoPlayerRef = useRef<HTMLVideoElement>(null);
  const blurVideoPlayerRef = useRef<HTMLVideoElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const controlRef = useRef<HTMLDivElement>(null);
  const [hasWindow, setHasWindow] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [resetTimer, setResetTimer] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setHasWindow(true);
    }
  }, []);

  const [videoState, setVideoState] = useState({
    playing: doAutoPlay,
    muted: true,
    volume: 0.5,
    playbackRate: 1.0,
    played: 0,
    seeking: false,
    buffer: true,
    isFullScreen: false,
  });

  //Destructuring the properties from the videoState
  const { playing, muted, volume, playbackRate, played, seeking, buffer } =
    videoState;

  const currentTime = videoPlayerRef.current
    ? videoPlayerRef.current.currentTime
    : 0;
  const duration = videoPlayerRef.current ? videoPlayerRef.current.duration : 0;

  const formatCurrentTime = formatTime(currentTime);
  const formatDuration = formatTime(duration);

  const playPauseHandler = () => {
    //plays and pause the video (toggling)
    setVideoState((prev) => ({ ...prev, playing: !prev.playing }));
  };

  const rewindHandler = () => {
    //Rewinds the video player reducing 10 seconds
    const newTime = videoPlayerRef.current
      ? videoPlayerRef.current.currentTime - 10
      : 0;
    if (videoPlayerRef.current) videoPlayerRef.current.currentTime = newTime;
    if (blurVideoPlayerRef.current)
      blurVideoPlayerRef.current.currentTime = newTime;
  };

  const fullScreenHandler = () => {
    //FullScreen the video player
    setVideoState((prev) => ({ ...prev, isFullScreen: !prev.isFullScreen }));
  };

  const handleFastFoward = () => {
    //FastFowards the video player by adding 10
    const currentPlus10 = videoPlayerRef.current
      ? videoPlayerRef.current.currentTime + 10
      : 0;
    if (videoPlayerRef.current)
      videoPlayerRef.current.currentTime = currentPlus10;
    if (blurVideoPlayerRef.current)
      blurVideoPlayerRef.current.currentTime = currentPlus10;
  };

  //console.log("========", (controlRef.current.style.visibility = "false"));
  const progressHandler = () => {
    if (count > 3) {
      if (controlRef.current) controlRef.current.style.visibility = "hidden"; // toggling player control container
    } else if (
      controlRef.current &&
      controlRef.current.style.visibility === "visible"
    ) {
      count += 1;
    }

    if (!seeking && videoPlayerRef.current) {
      const el = videoPlayerRef.current;
      const played = el.duration ? el.currentTime / el.duration : 0;
      const loaded =
        el.buffered?.length && el.duration
          ? el.buffered.end(el.buffered.length - 1) / el.duration
          : 0;
      setVideoState((prev) => ({ ...prev, played, loaded }));
    }
  };

  const seekHandler = (value: number) => {
    const fraction = value / 100;
    setVideoState({ ...videoState, played: fraction });
    const dur = videoPlayerRef.current?.duration ?? 0;
    if (videoPlayerRef.current)
      videoPlayerRef.current.currentTime = fraction * dur;
    if (blurVideoPlayerRef.current)
      blurVideoPlayerRef.current.currentTime = fraction * dur;
  };

  const seekMouseUpHandler = (value: number) => {
    console.log(value);

    setVideoState({ ...videoState, seeking: false });
    const fraction = value / 100;
    const dur = videoPlayerRef.current?.duration ?? 0;
    if (videoPlayerRef.current)
      videoPlayerRef.current.currentTime = fraction * dur;
    if (blurVideoPlayerRef.current)
      blurVideoPlayerRef.current.currentTime = fraction * dur;
  };

  const volumeChangeHandler = (value: number) => {
    const newVolume = value / 100;

    setVideoState({
      ...videoState,
      volume: newVolume,
      muted: Number(newVolume) === 0 ? true : false, // volume === 0 then muted
    });
  };

  const volumeSeekUpHandler = (value: number) => {
    const newVolume = value / 100;

    setVideoState({
      ...videoState,
      volume: newVolume,
      muted: newVolume === 0 ? true : false,
    });
  };

  const muteHandler = () => {
    //Mutes the video player
    setVideoState({ ...videoState, muted: !videoState.muted });
  };

  const onSeekMouseDownHandler = () => {
    setVideoState({ ...videoState, seeking: true });
  };

  const mouseMoveHandler = () => {
    if (controlRef.current) controlRef.current.style.visibility = "visible";
    count = 0;
  };

  const bufferStartHandler = () => {
    console.log("Bufering.......");
    setVideoState({ ...videoState, buffer: true });
  };

  const bufferEndHandler = () => {
    console.log("buffering stoped ,,,,,,play");
    setVideoState({ ...videoState, buffer: false });
  };

  const handleSpaceBar = (e: any) => {
    if (e.code === "Space") {
      e.preventDefault();
      playPauseHandler();
    }
  };

  const handleArrowRight = (e: any) => {
    if (e.code === "ArrowRight") {
      setResetTimer((prev) => !prev);
      handleFastFoward();
    }
  };

  const handleArrowLeft = (e: any) => {
    if (e.code === "ArrowLeft") {
      setResetTimer((prev) => !prev);
      rewindHandler();
    }
  };

  const handleArrows = (e: any) => {
    handleArrowLeft(e);
    handleArrowRight(e);
  };

  useEffect(() => {
    addEventListener("keydown", handleSpaceBar);

    return () => {
      removeEventListener("keydown", handleSpaceBar);
    };
  }, [videoState.playing]);

  useEffect(() => {
    addEventListener("keydown", handleArrows);

    return () => {
      removeEventListener("keydown", handleArrows);
    };
  }, []);

  useEffect(() => {
    if (videoState.isFullScreen) {
      //@ts-expect-error
      screenfull.request(wrapperRef.current);
    } else {
      //@ts-expect-error
      screenfull.exit(wrapperRef.current);
    }
  }, [videoState.isFullScreen]);

  useEffect(() => {
    setShowControls(true);
    const timer = setTimeout(() => {
      setShowControls(false);
    }, 3000);

    return () => {
      clearTimeout(timer);
    };
  }, [videoState.playing, resetTimer]);

  useEffect(() => {
    const controlsTl = gsap.timeline({ paused: true });
    const wrapper = wrapperRef.current as HTMLDivElement;
    if (showControls) {
      controlsTl.to(controlRef.current, {
        opacity: 1,
        duration: 0.45,
        ease: "power3.out",
      });
      if (videoState.isFullScreen) wrapper.style.cursor = "auto";
      controlsTl.restart();
    } else if (!showControls) {
      controlsTl.to(controlRef.current, {
        opacity: 0,
        duration: 0.45,
        ease: "power3.out",
      });
      if (videoState.isFullScreen) wrapper.style.cursor = "none";
      controlsTl.restart();
    }

    return () => {
      controlsTl.kill();
    };
  }, [showControls, videoState.isFullScreen]);

  return (
    <div
      // onKeyDown={(e) => {
      //   if (e.code === "32") playPauseHandler();
      // }}
      ref={wrapperRef}
      onMouseMove={() => {
        setResetTimer((prev) => !prev);
      }}
      className="w-full h-full"
    >
      <div
        style={{
          height: videoState.isFullScreen ? "100%" : "auto",
        }}
        className="relative w-full h-full flex items-center justify-center"
        onMouseMove={mouseMoveHandler}
      >
        {hasWindow && (
          <div
            style={{
              borderRadius: videoState.isFullScreen ? "0" : "1rem",
            }}
            className="video-wrapper z-1 w-full h-full overflow-hidden"
          >
            <ReactPlayer
              ref={videoPlayerRef}
              className="w-full h-full relative overflow-hidden"
              src={url}
              width="100%"
              height="100%"
              playing={playing}
              volume={volume}
              muted={muted}
              onTimeUpdate={progressHandler}
              onProgress={progressHandler}
              onWaiting={bufferStartHandler}
              onPlaying={bufferEndHandler}
            />
          </div>
        )}

        {buffer && (
          <div className="absolute z-4 pointer-events-none inset-0 flex items-center justify-center">
            {/* <CircularProgress
              classNames={{
                track: "stroke-white/20",
                indicator: "stroke-white",
              }}
              size="sm"
            /> */}
          </div>
        )}
        <div
          onClick={playPauseHandler}
          onDoubleClick={fullScreenHandler}
          className="absolute z-2 inset-0"
        ></div>
        <Control
          controlRef={controlRef}
          onPlayPause={playPauseHandler}
          playing={playing}
          onRewind={rewindHandler}
          onForward={handleFastFoward}
          played={played}
          onSeek={seekHandler}
          onSeekMouseUp={seekMouseUpHandler}
          volume={volume}
          onVolumeChangeHandler={volumeChangeHandler}
          onVolumeSeekUp={volumeSeekUpHandler}
          mute={muted}
          onMute={muteHandler}
          duration={formatDuration}
          currentTime={formatCurrentTime}
          onMouseSeekDown={onSeekMouseDownHandler}
          toggleFullScreen={fullScreenHandler}
          isFullScreen={videoState.isFullScreen}
          color={color}
        />
      </div>
    </div>
  );
}
