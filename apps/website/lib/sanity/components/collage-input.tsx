"use client";

import {
  type MouseEvent as ReactMouseEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { nanoid } from "nanoid";
import { Rnd } from "react-rnd";
import { Box, Button, Card, Flex, Grid, Stack, Text } from "@sanity/ui";
import { ObjectInputProps, PatchEvent, set, useClient } from "sanity";
import { urlForImage } from "@/lib/sanity/sanity.image";

type CollageImage = {
  _type: "image";
  asset: {
    _type: "reference";
    _ref: string;
  };
};

type CollageItem = {
  _key: string;
  image: CollageImage;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  aspectRatio?: number;
};

type CollageValue = {
  _type: "collage";
  items: CollageItem[];
};

const DEFAULT_ITEM_WIDTH = 22;
const DEFAULT_ITEM_HEIGHT = 22;
const COLLAGE_CANVAS_ASPECT = 25 / 9;

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

const hasAspectRatio = (value: unknown): value is number =>
  isFiniteNumber(value) && value > 0;

const getCanvasAspect = () => COLLAGE_CANVAS_ASPECT;

const getHeightFromWidth = (
  widthPercent: number,
  aspectRatio: number,
  canvasAspect: number
) => (widthPercent * canvasAspect) / aspectRatio;

const fitWidthToCanvas = (
  widthPercent: number,
  aspectRatio: number,
  canvasAspect: number
) => {
  const maxWidth = (100 * aspectRatio) / canvasAspect;
  return clamp(widthPercent, 1, Math.min(100, maxWidth));
};

const normalizeItem = (item: unknown, index: number): CollageItem | null => {
  const candidate = (item || {}) as Partial<CollageItem> & {
    image?: Partial<CollageImage>;
  };
  const assetRef = candidate.image?.asset?._ref;
  if (!assetRef) {
    return null;
  }

  const width = clamp(
    isFiniteNumber(candidate.width) ? candidate.width : DEFAULT_ITEM_WIDTH,
    1,
    100
  );
  const height = clamp(
    isFiniteNumber(candidate.height) ? candidate.height : DEFAULT_ITEM_HEIGHT,
    1,
    100
  );
  const defaultX = clamp(5 + (index % 6) * 10, 0, 100 - width);
  const defaultY = clamp(5 + (index % 4) * 10, 0, 100 - height);

  return {
    _key:
      typeof candidate._key === "string" && candidate._key.length > 0
        ? candidate._key
        : `legacy-${index}-${assetRef}`,
    image: {
      _type: "image",
      asset: {
        _type: "reference",
        _ref: assetRef,
      },
    },
    x: clamp(
      isFiniteNumber(candidate.x) ? candidate.x : defaultX,
      0,
      100 - width
    ),
    y: clamp(
      isFiniteNumber(candidate.y) ? candidate.y : defaultY,
      0,
      100 - height
    ),
    width,
    height,
    zIndex: isFiniteNumber(candidate.zIndex)
      ? Math.round(candidate.zIndex)
      : index + 1,
    aspectRatio: hasAspectRatio(candidate.aspectRatio)
      ? candidate.aspectRatio
      : undefined,
  };
};

const normalizeValue = (value: unknown): CollageValue => {
  const v = (value || {}) as Partial<CollageValue>;
  const rawItems = Array.isArray(v.items) ? v.items : [];
  return {
    _type: "collage",
    items: rawItems
      .map((item, index) => normalizeItem(item, index))
      .filter((item): item is CollageItem => item !== null),
  };
};

type RangeControlProps = {
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  disabled?: boolean;
  onChange: (next: number) => void;
};

function RangeControl({
  label,
  min,
  max,
  step,
  value,
  disabled,
  onChange,
}: RangeControlProps) {
  return (
    <Box>
      <Text size={1}>{label}</Text>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(Number(event.target.value))}
        style={{ width: "100%" }}
      />
    </Box>
  );
}

export function CollageInput(props: ObjectInputProps) {
  const { value, onChange, readOnly } = props;
  const client = useClient({ apiVersion: "2025-01-01" });
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const replaceFileInputRef = useRef<HTMLInputElement | null>(null);
  const replaceTargetKeyRef = useRef<string | null>(null);
  const middlePanRef = useRef<{
    startX: number;
    startY: number;
    startScrollLeft: number;
    startScrollTop: number;
  } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMiddlePanning, setIsMiddlePanning] = useState(false);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    key: string;
  } | null>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 1, height: 1 });
  const canvasAspect = COLLAGE_CANVAS_ASPECT;

  const collageValue = useMemo(() => normalizeValue(value), [value]);
  const selectedItem = useMemo(
    () => collageValue.items.find((item) => item._key === selectedKey) || null,
    [collageValue.items, selectedKey]
  );

  const patchValue = useCallback(
    (next: CollageValue) => {
      onChange(PatchEvent.from([set(next)]));
    },
    [onChange]
  );

  const updateItem = useCallback(
    (key: string, updater: (item: CollageItem) => CollageItem) => {
      const next: CollageValue = {
        _type: "collage",
        items: collageValue.items.map((item) =>
          item._key === key ? updater(item) : item
        ),
      };
      patchValue(next);
    },
    [collageValue.items, patchValue]
  );

  const focusItem = useCallback(
    (key: string) => {
      const maxZ = collageValue.items.reduce(
        (max, item) => Math.max(max, item.zIndex),
        0
      );
      setSelectedKey(key);
      updateItem(key, (item) => ({
        ...item,
        zIndex: maxZ + 1,
      }));
    },
    [collageValue.items, updateItem]
  );

  const removeItem = useCallback(
    (key: string) => {
      const filtered = collageValue.items.filter((item) => item._key !== key);
      patchValue({ _type: "collage", items: filtered });
      if (selectedKey === key) {
        setSelectedKey(filtered[0]?._key ?? null);
      }
    },
    [collageValue.items, patchValue, selectedKey]
  );

  const replaceItem = useCallback(
    async (key: string, file: File) => {
      const item = collageValue.items.find((i) => i._key === key);
      if (!item || readOnly) return;

      setIsUploading(true);
      setContextMenu(null);
      try {
        const asset = await client.assets.upload("image", file, {
          filename: file.name,
        });
        const rawAspectRatio = (
          asset as { metadata?: { dimensions?: { aspectRatio?: number } } }
        ).metadata?.dimensions?.aspectRatio;
        const aspectRatio = hasAspectRatio(rawAspectRatio) ? rawAspectRatio : 1;
        const safeWidth = fitWidthToCanvas(
          item.width,
          aspectRatio,
          getCanvasAspect()
        );
        const height = getHeightFromWidth(
          safeWidth,
          aspectRatio,
          getCanvasAspect()
        );

        updateItem(key, () => ({
          ...item,
          image: {
            _type: "image",
            asset: {
              _type: "reference",
              _ref: asset._id,
            },
          },
          aspectRatio,
          width: safeWidth,
          height,
          x: clamp(item.x, 0, 100 - safeWidth),
          y: clamp(item.y, 0, 100 - height),
        }));
      } finally {
        setIsUploading(false);
        if (replaceFileInputRef.current) {
          replaceFileInputRef.current.value = "";
        }
      }
    },
    [client.assets, collageValue.items, readOnly, updateItem]
  );

  const triggerReplaceImage = useCallback((key: string) => {
    replaceTargetKeyRef.current = key;
    replaceFileInputRef.current?.click();
  }, []);

  const uploadImages = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0 || readOnly) {
        return;
      }

      setIsUploading(true);
      try {
        const uploads = await Promise.all(
          Array.from(files).map(async (file, idx) => {
            const asset = await client.assets.upload("image", file, {
              filename: file.name,
            });
            const rawAspectRatio = (
              asset as { metadata?: { dimensions?: { aspectRatio?: number } } }
            ).metadata?.dimensions?.aspectRatio;
            const aspectRatio = hasAspectRatio(rawAspectRatio)
              ? rawAspectRatio
              : 1;
            const safeWidth = fitWidthToCanvas(
              DEFAULT_ITEM_WIDTH,
              aspectRatio,
              getCanvasAspect()
            );
            const height = getHeightFromWidth(
              safeWidth,
              aspectRatio,
              getCanvasAspect()
            );

            const orderBase = collageValue.items.length + idx;
            return {
              _key: nanoid(),
              image: {
                _type: "image" as const,
                asset: {
                  _type: "reference" as const,
                  _ref: asset._id,
                },
              },
              x: clamp(5 + (orderBase % 6) * 10, 0, 100 - safeWidth),
              y: clamp(5 + (orderBase % 4) * 10, 0, 100 - height),
              width: safeWidth,
              height,
              zIndex: orderBase,
              aspectRatio,
            } satisfies CollageItem;
          })
        );

        const items = [...collageValue.items, ...uploads];
        patchValue({ _type: "collage", items });
        if (uploads[0]) {
          setSelectedKey(uploads[0]._key);
        }
      } finally {
        setIsUploading(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    },
    [canvasSize, client.assets, collageValue.items, patchValue, readOnly]
  );

  useEffect(() => {
    const missingRatioItems = collageValue.items.filter(
      (item) => !hasAspectRatio(item.aspectRatio) && item.image?.asset?._ref
    );
    if (missingRatioItems.length === 0) {
      return;
    }

    const refs = Array.from(
      new Set(missingRatioItems.map((item) => item.image.asset._ref))
    );

    let cancelled = false;
    const fetchRatios = async () => {
      const assets = await client.fetch<
        Array<{
          _id: string;
          metadata?: { dimensions?: { aspectRatio?: number } };
        }>
      >(
        `*[_type == "sanity.imageAsset" && _id in $ids]{_id, metadata{dimensions{aspectRatio}}}`,
        { ids: refs }
      );
      if (cancelled) {
        return;
      }
      const ratioById = new Map<string, number>();
      for (const asset of assets) {
        const ratio = asset.metadata?.dimensions?.aspectRatio;
        if (hasAspectRatio(ratio)) {
          ratioById.set(asset._id, ratio);
        }
      }

      const nextItems = collageValue.items.map((item) => {
        if (hasAspectRatio(item.aspectRatio)) {
          return item;
        }
        const ratio = ratioById.get(item.image.asset._ref) ?? 1;
        const safeWidth = fitWidthToCanvas(item.width, ratio, canvasAspect);
        const safeHeight = getHeightFromWidth(safeWidth, ratio, canvasAspect);
        return {
          ...item,
          aspectRatio: ratio,
          width: safeWidth,
          height: safeHeight,
          x: clamp(item.x, 0, 100 - safeWidth),
          y: clamp(item.y, 0, 100 - safeHeight),
        };
      });

      patchValue({ _type: "collage", items: nextItems });
    };

    void fetchRatios();
    return () => {
      cancelled = true;
    };
  }, [canvasAspect, client, collageValue.items, patchValue]);

  useEffect(() => {
    if (!sceneRef.current) {
      return;
    }
    const el = sceneRef.current;

    const updateSize = () => {
      const rect = el.getBoundingClientRect();
      setCanvasSize({
        width: Math.max(1, rect.width),
        height: Math.max(1, rect.height),
      });
    };

    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(el);
    window.addEventListener("resize", updateSize);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateSize);
    };
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      const fullscreen = document.fullscreenElement === canvasRef.current;
      setIsFullscreen(fullscreen);
      if (!fullscreen) {
        middlePanRef.current = null;
        setIsMiddlePanning(false);
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  useEffect(() => {
    if (!isMiddlePanning) {
      return;
    }

    const handleMove = (event: MouseEvent) => {
      const pan = middlePanRef.current;
      const viewport = canvasRef.current;
      if (!pan || !viewport) {
        return;
      }

      const dx = event.clientX - pan.startX;
      const dy = event.clientY - pan.startY;
      viewport.scrollLeft = pan.startScrollLeft - dx;
      viewport.scrollTop = pan.startScrollTop - dy;
    };

    const endPan = () => {
      middlePanRef.current = null;
      setIsMiddlePanning(false);
    };

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", endPan);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", endPan);
    };
  }, [isMiddlePanning]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Delete" && event.key !== "Backspace") {
        return;
      }
      if (!selectedKey || readOnly) {
        return;
      }
      const target = event.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }
      event.preventDefault();
      removeItem(selectedKey);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedKey, readOnly, removeItem]);

  useEffect(() => {
    if (!contextMenu) return;
    const closeMenu = () => setContextMenu(null);
    window.addEventListener("click", closeMenu);
    window.addEventListener("contextmenu", closeMenu);
    return () => {
      window.removeEventListener("click", closeMenu);
      window.removeEventListener("contextmenu", closeMenu);
    };
  }, [contextMenu]);

  const toPercentX = useCallback(
    (px: number) => clamp((px / canvasSize.width) * 100, 0, 100),
    [canvasSize.width]
  );
  const toPercentY = useCallback(
    (px: number) => clamp((px / canvasSize.height) * 100, 0, 100),
    [canvasSize.height]
  );
  const toPxX = useCallback(
    (percent: number) => (percent / 100) * canvasSize.width,
    [canvasSize.width]
  );
  const toPxY = useCallback(
    (percent: number) => (percent / 100) * canvasSize.height,
    [canvasSize.height]
  );

  const toggleFullscreen = useCallback(async () => {
    if (!canvasRef.current) {
      return;
    }

    if (document.fullscreenElement === canvasRef.current) {
      await document.exitFullscreen();
      return;
    }
    await canvasRef.current.requestFullscreen();
  }, []);

  const setSelectedField = useCallback(
    (
      field: keyof Pick<CollageItem, "x" | "y" | "width" | "zIndex">,
      value: number
    ) => {
      if (!selectedKey) {
        return;
      }
      updateItem(selectedKey, (item) => {
        if (field === "width") {
          const ratio = hasAspectRatio(item.aspectRatio) ? item.aspectRatio : 1;
          const width = fitWidthToCanvas(value, ratio, canvasAspect);
          const height = getHeightFromWidth(width, ratio, canvasAspect);
          return {
            ...item,
            aspectRatio: ratio,
            width,
            height,
            x: clamp(item.x, 0, 100 - width),
            y: clamp(item.y, 0, 100 - height),
          };
        }
        if (field === "x") {
          return {
            ...item,
            x: clamp(value, 0, 100 - item.width),
          };
        }
        if (field === "y") {
          return {
            ...item,
            y: clamp(value, 0, 100 - item.height),
          };
        }
        return {
          ...item,
          zIndex: Math.round(value),
        };
      });
    },
    [canvasAspect, selectedKey, updateItem]
  );

  return (
    <>
      <Stack space={4}>
        <Flex gap={2} wrap="wrap">
          <Button
            mode="ghost"
            tone="primary"
            text={isUploading ? "Uploading..." : "Upload Images"}
            disabled={isUploading || readOnly}
            onClick={() => fileInputRef.current?.click()}
          />
          <Button
            mode="ghost"
            text={isFullscreen ? "Exit Fullscreen" : "Fullscreen Canvas"}
            onClick={toggleFullscreen}
            disabled={readOnly}
          />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            hidden
            onChange={(event) => void uploadImages(event.target.files)}
          />
          <input
            ref={replaceFileInputRef}
            type="file"
            accept="image/*"
            hidden
            onChange={(event) => {
              const file = event.target.files?.[0];
              const key = replaceTargetKeyRef.current;
              if (file && key) {
                replaceTargetKeyRef.current = null;
                void replaceItem(key, file);
              }
            }}
          />
        </Flex>

        <Card
          ref={canvasRef}
          radius={2}
          shadow={1}
          onMouseDown={(event) => {
            if (!isFullscreen || event.button !== 1 || !canvasRef.current) {
              return;
            }
            event.preventDefault();
            middlePanRef.current = {
              startX: event.clientX,
              startY: event.clientY,
              startScrollLeft: canvasRef.current.scrollLeft,
              startScrollTop: canvasRef.current.scrollTop,
            };
            setIsMiddlePanning(true);
          }}
          onAuxClick={(event) => {
            if (isFullscreen && event.button === 1) {
              event.preventDefault();
            }
          }}
          style={{
            width: isFullscreen ? "100vw" : "100%",
            height: isFullscreen ? "100vh" : undefined,
            aspectRatio: isFullscreen ? undefined : "25 / 9",
            display: isFullscreen ? "flex" : "block",
            alignItems: isFullscreen ? "center" : undefined,
            justifyContent: isFullscreen ? "center" : undefined,
            background: "#111111",
            overflow: isFullscreen ? "auto" : "hidden",
            cursor: isFullscreen
              ? isMiddlePanning
                ? "grabbing"
                : "grab"
              : "default",
          }}
        >
          <div
            ref={sceneRef}
            style={{
              width: isFullscreen ? "min(100vw, calc(100vh * 25 / 9))" : "100%",
              height: isFullscreen
                ? "min(100vh, calc(100vw * 9 / 25))"
                : "100%",
              background: "#1d1f23",
              aspectRatio: "25 / 9",
              position: "relative",
              flex: "0 0 auto",
            }}
          >
            {collageValue.items.length === 0 ? (
              <Flex
                align="center"
                justify="center"
                style={{ position: "absolute", inset: 0 }}
              >
                <Text muted>
                  Upload multiple images and drag them into position.
                </Text>
              </Flex>
            ) : null}

            {collageValue.items.map((item) =>
              (() => {
                const ratio = hasAspectRatio(item.aspectRatio)
                  ? item.aspectRatio
                  : 1;
                const safeWidth = fitWidthToCanvas(
                  item.width,
                  ratio,
                  canvasAspect
                );
                const safeHeight = getHeightFromWidth(
                  safeWidth,
                  ratio,
                  canvasAspect
                );
                return (
                  <Rnd
                    key={item._key}
                    bounds="parent"
                    disableDragging={readOnly}
                    enableResizing={!readOnly}
                    lockAspectRatio={ratio}
                    size={{
                      width: toPxX(safeWidth),
                      height: toPxY(safeHeight),
                    }}
                    position={{
                      x: toPxX(item.x),
                      y: toPxY(item.y),
                    }}
                    onDragStart={() => {
                      if (!readOnly) {
                        focusItem(item._key);
                      }
                    }}
                    onDragStop={(_, data) => {
                      updateItem(item._key, (current) => ({
                        ...current,
                        x: clamp(toPercentX(data.x), 0, 100 - safeWidth),
                        y: clamp(toPercentY(data.y), 0, 100 - safeHeight),
                      }));
                    }}
                    onResizeStart={() => {
                      if (!readOnly) {
                        focusItem(item._key);
                      }
                    }}
                    onResizeStop={(_, __, ref, ___, position) => {
                      const nextWidth = fitWidthToCanvas(
                        toPercentX(ref.offsetWidth),
                        ratio,
                        canvasAspect
                      );
                      const nextHeight = getHeightFromWidth(
                        nextWidth,
                        ratio,
                        canvasAspect
                      );

                      updateItem(item._key, (current) => ({
                        ...current,
                        aspectRatio: ratio,
                        x: clamp(toPercentX(position.x), 0, 100 - nextWidth),
                        y: clamp(toPercentY(position.y), 0, 100 - nextHeight),
                        width: nextWidth,
                        height: nextHeight,
                      }));
                    }}
                    onMouseDown={() => setSelectedKey(item._key)}
                    onContextMenu={(e: ReactMouseEvent<HTMLElement>) => {
                      if (readOnly) return;
                      e.preventDefault();
                      e.stopPropagation();
                      setSelectedKey(item._key);
                      setContextMenu({
                        x: e.clientX,
                        y: e.clientY,
                        key: item._key,
                      });
                    }}
                    style={{
                      zIndex: item.zIndex,
                    }}
                  >
                    <Card
                      padding={0}
                      radius={1}
                      style={{
                        width: "100%",
                        height: "100%",
                        border:
                          selectedKey === item._key
                            ? "2px solid #3b82f6"
                            : "1px solid #333",
                        overflow: "hidden",
                        cursor: readOnly ? "default" : "move",
                        userSelect: "none",
                        background: "#111",
                      }}
                    >
                      <img
                        src={urlForImage(item.image)
                          ?.width(1200)
                          .fit("max")
                          .url()}
                        alt=""
                        draggable={false}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    </Card>
                  </Rnd>
                );
              })()
            )}
          </div>
        </Card>

        <Grid columns={[1, 2]} gap={4}>
          <Card padding={3} radius={2} tone="transparent" border>
            <Stack space={3}>
              <Text weight="semibold">Layer Settings</Text>
              {!selectedItem ? (
                <Text muted>
                  Select an image to edit its position and size.
                </Text>
              ) : (
                <>
                  <RangeControl
                    label={`X: ${selectedItem.x.toFixed(1)}%`}
                    min={0}
                    max={100}
                    step={0.1}
                    value={selectedItem.x}
                    disabled={readOnly}
                    onChange={(next) => setSelectedField("x", next)}
                  />
                  <RangeControl
                    label={`Y: ${selectedItem.y.toFixed(1)}%`}
                    min={0}
                    max={100}
                    step={0.1}
                    value={selectedItem.y}
                    disabled={readOnly}
                    onChange={(next) => setSelectedField("y", next)}
                  />
                  <RangeControl
                    label={`Width: ${selectedItem.width.toFixed(1)}%`}
                    min={5}
                    max={100}
                    step={0.1}
                    value={selectedItem.width}
                    disabled={readOnly}
                    onChange={(next) => setSelectedField("width", next)}
                  />
                  <Text size={1} muted>
                    Aspect Ratio:{" "}
                    {(hasAspectRatio(selectedItem.aspectRatio)
                      ? selectedItem.aspectRatio
                      : 1
                    ).toFixed(3)}
                  </Text>
                  <RangeControl
                    label={`Z-index: ${selectedItem.zIndex}`}
                    min={0}
                    max={Math.max(20, collageValue.items.length * 2)}
                    step={1}
                    value={selectedItem.zIndex}
                    disabled={readOnly}
                    onChange={(next) => setSelectedField("zIndex", next)}
                  />
                  <Button
                    tone="critical"
                    mode="ghost"
                    text="Remove Selected Image"
                    onClick={() => removeItem(selectedItem._key)}
                    disabled={readOnly}
                  />
                </>
              )}
            </Stack>
          </Card>

          <Card padding={3} radius={2} tone="transparent" border>
            <Stack space={3}>
              <Text weight="semibold">Layers</Text>
              {collageValue.items.length === 0 ? (
                <Text muted>No layers yet.</Text>
              ) : (
                collageValue.items
                  .slice()
                  .sort((a, b) => b.zIndex - a.zIndex)
                  .map((item, idx) => (
                    <Card
                      key={item._key}
                      padding={2}
                      radius={2}
                      tone={
                        selectedKey === item._key ? "primary" : "transparent"
                      }
                      border
                      onClick={() => setSelectedKey(item._key)}
                      style={{ cursor: "pointer" }}
                    >
                      <Text size={1}>
                        Layer {collageValue.items.length - idx} (z:{" "}
                        {item.zIndex})
                      </Text>
                    </Card>
                  ))
              )}
            </Stack>
          </Card>
        </Grid>
      </Stack>

      {contextMenu &&
        createPortal(
          <Card
            padding={0}
            radius={2}
            shadow={2}
            style={{
              position: "fixed",
              left: contextMenu.x,
              top: contextMenu.y,
              zIndex: 10000,
              minWidth: 180,
              overflow: "hidden",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <Stack padding={0}>
              <Box
                padding={2}
                style={{
                  cursor: readOnly ? "default" : "pointer",
                  background: "transparent",
                }}
                onClick={() => {
                  if (!readOnly) {
                    setContextMenu(null);
                    triggerReplaceImage(contextMenu.key);
                  }
                }}
              >
                <Text size={1}>Replace image</Text>
              </Box>
            </Stack>
          </Card>,
          document.body
        )}
    </>
  );
}
