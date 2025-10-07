export function slideOutIn() {
  document.documentElement.animate(
    [
      {
        transform: "scale(1)",
      },
      {
        transform: "scale(0.85)",
      },
    ],
    {
      duration: 600,
      easing: "cubic-bezier(0.86, 0, 0.07, 1)",
      fill: "forwards",
      pseudoElement: "::view-transition-old(root)",
    }
  );
  document.documentElement.animate(
    [
      {
        transform: "translateX(0) scale(0.85)",
      },
      {
        transform: "translateX(-100%) scale(0.85)",
      },
    ],
    {
      delay: 600,
      duration: 600,
      easing: "cubic-bezier(0.86, 0, 0.07, 1)",
      fill: "forwards",
      pseudoElement: "::view-transition-old(root)",
    }
  );

  document.documentElement.animate(
    [
      {
        transform: "translateX(100%) scale(0.85)",
      },
      {
        transform: "translateX(0) scale(0.85)",
      },
    ],
    {
      delay: 600,
      duration: 600,
      easing: "cubic-bezier(0.86, 0, 0.07, 1)",
      fill: "forwards",
      pseudoElement: "::view-transition-new(root)",
    }
  );
  document.documentElement.animate(
    [
      {
        transform: "scale(0.85)",
      },
      {
        transform: "scale(1)",
      },
    ],
    {
      delay: 1200,
      duration: 600,
      easing: "cubic-bezier(0.86, 0, 0.07, 1)",
      fill: "forwards",
      pseudoElement: "::view-transition-new(root)",
    }
  );
}

export function scaleInOut() {
  document.documentElement.animate(
    [
      {
        opacity: 1,
        filter: "blur(0px)",
        transform: "translateY(0)",
      },
      {
        opacity: 0.1,
        filter: "blur(10px)",
        transform: "translateY(-30%)",
      },
    ],
    {
      duration: 1200,
      easing: "cubic-bezier(0.86, 0, 0.07, 1)",
      fill: "forwards",
      pseudoElement: "::view-transition-old(root)",
    }
  );

  document.documentElement.animate(
    [
      {
        clipPath: "inset(100% 0 0 0)",
      },
      {
        clipPath: "inset(0 0 0 0)",
      },
    ],
    {
      duration: 1200,
      easing: "cubic-bezier(0.86, 0, 0.07, 1)",
      fill: "forwards",
      pseudoElement: "::view-transition-new(root)",
    }
  );
}
