"use client";
import { useElementSize } from "@custom-react-hooks/use-element-size";
import _ from "lodash";
import { CSSProperties, useMemo, useState } from "react";

type PercentageString = `${number}%`;

function toPercentageString(n: number): PercentageString {
  return `${n * 100}%`;
}

type Vector2<T> = [T, T];
type Vector = Vector2<number>;

type Stop = {
  color: CSSProperties["color"];
  breakpoint: number;
};

// Very clever name isn't it? jk
function zipMap<T>(a: Vector2<T>, b: Vector2<T>, operation: (a: T, b: T) => T) {
  return _.zip(a, b).map((zipped) => {
    const [a, b] = zipped;
    if (a === undefined || b === undefined) throw new Error("WTF");
    return operation(a, b);
  }) as Vector2<T>;
}

function sub<T extends number>(a: Vector2<T>, b: Vector2<T>) {
  return zipMap(a, b, (a, b) => (a - b) as T);
}

// All vectors express a position in normalized space of the parent container's bounding box
// with the top-left being (0, 0) and bottom-right being (1, 1)
interface Props {
  // Center of the ellipse
  center: Vector;
  // Middlepoints of the sides of ellipse's bounding box
  a: Vector;
  b: Vector;

  // The smaller starting ellipse relative to bounding box, the more background around it we have to work with
  originalGradientSize: Vector;

  stops: Stop[];
  showHandles?: boolean;
  showGrid?: boolean;
  debug?: boolean;
}

function RadialBackground({
  center,
  a,
  b,
  stops,
  debug = false,
  showHandles = false,
  showGrid = false,
  originalGradientSize = [1, 1] as Vector,
}: Props) {
  // Is this the only way to get aspect ratio?
  const [ref, parentSize] = useElementSize();
  const isParentSizeAvailable =
    parentSize.width !== 0 && parentSize.height !== 0;
  const parentAspect = (parentSize.width || 1) / (parentSize.height || 1);

  // We usually start with 100% 100% at 50% 50% (ellipse inscribed into bounding box)
  const originalGradientCenter: Vector = [0.5, 0.5];

  // For whatever reason we need to remap stops to a range (0%, 50%)
  const normalizedStops = stops.map((stop) => ({
    color: stop.color,
    breakpoint: stop.breakpoint / 2,
  }));

  // Apply radial gradient which will then be manually transformed
  const backgroundImage = `radial-gradient(
    ${originalGradientSize.map(toPercentageString).join(" ")}
    at ${originalGradientCenter.map(toPercentageString).join(" ")},
    ${normalizedStops.map((stop) => `${stop.color} ${toPercentageString(stop.breakpoint)}`).join(", ")}
  )`;

  // Translate from origianl gradient center (50% 50%) to desired center point
  const translation = sub(center, originalGradientCenter);
  const translateString = `translate(${translation.map(toPercentageString).join(", ")})`;

  // Create transformation matrix
  // First, express A/B points relatively to center
  // Then we scale everything with respect to original gradient size
  const A = sub(a, center).map((x) => (x * 2) / originalGradientSize[0]);
  const B = sub(b, center).map((x) => (x * 2) / originalGradientSize[1]);

  console.log({ A, B });
  // Account for aspect ratio (don't ask me why this works)
  A[1] = A[1] / parentAspect;
  B[0] = B[0] * parentAspect;
  console.log("Transformed", { A, B });
  const matrixString = `matrix(${A.join(", ")}, ${B.join(", ")}, 0, 0)`;

  return (
    <div
      ref={ref}
      className="size-full top-0 left-0 -z-20 absolute"
      style={{
        overflow: debug ? "visible" : "hidden",
      }}
    >
      {isParentSizeAvailable && (
        <>
          <div
            className="size-full top-0 left-0 -z-10 absolute grid grid-cols-2 transition"
            style={{
              backgroundImage,
              transform: `${translateString} ${matrixString}`,
            }}
          >
            {showGrid &&
              _.times(4).map((i) => (
                <div
                  key={i}
                  className="border border-black border-collapse"
                ></div>
              ))}
          </div>
          {showHandles &&
            [center, a, b].map((point, index) => (
              <div
                key={index}
                className="size-full top-0 left-0 z-10 absolute"
                style={{
                  transform: `translate(${point.map(toPercentageString).join(", ")})`,
                }}
              >
                <div className="bg-black rounded-full size-4 translate-x-[-50%] translate-y-[-50%]"></div>
              </div>
            ))}
        </>
      )}
    </div>
  );
}

const defaultProps = {
  center: [0, 1] as Vector,
  a: [0.75, -0.2] as Vector,
  b: [0.45, 1.5] as Vector,
  originalGradientSize: [0.95, 0.75] as Vector,
  stops: [
    { color: "hsla(30, 100%, 50%, 75%)", breakpoint: 0 },
    { color: "hsla(40, 90%, 55%, 75%)", breakpoint: 0.5 },
    { color: "hsla(55, 80%, 65%, 75%)", breakpoint: 1 },
  ],
};

export default function Home() {
  const [width, setWidth] = useState(500);
  const [debug, setDebug] = useState(false);
  const [showHandles, setShowHandles] = useState(false);
  const [showGrid, setShowGrid] = useState(false);
  const [configText, setConfigText] = useState(
    JSON.stringify(defaultProps, null, 2),
  );

  const props = useMemo(() => {
    try {
      return JSON.parse(configText);
    } catch (e) {
      return null;
    }
  }, [configText]);

  return (
    <main className="min-h-screen flex gap-8 p-20">
      <div className="flex flex-col grow gap-20">
        <section>
          <div className="grid gap-1.5 w-min">
            <label htmlFor="size">Size ({width}px x 200px)</label>
            <input
              id="size"
              type="range"
              min={150}
              max={800}
              onChange={(e) => setWidth(+e.target.value)}
              value={width}
            />
          </div>
          <div className="flex gap-1.5">
            <input
              id="debug"
              type="checkbox"
              value={debug.toString()}
              onChange={(e) => {
                setDebug(e.target.checked);
              }}
            />
            <label htmlFor="debug">Debug</label>
          </div>
          <div className="flex gap-1.5">
            <input
              id="handles"
              type="checkbox"
              value={showHandles.toString()}
              onChange={(e) => setShowHandles(e.target.checked)}
            />
            <label htmlFor="handles">Show handles</label>
          </div>
          <div className="flex gap-1.5">
            <input
              id="grid"
              type="checkbox"
              value={showGrid.toString()}
              onChange={(e) => setShowGrid(e.target.checked)}
            />
            <label htmlFor="grid">Show grid</label>
          </div>
        </section>
        {props && (
          <div
            className="mx-auto relative flex justify-center flex-col items-center col-span-2"
            style={{
              width: width,
              height: 200,
            }}
          >
            <RadialBackground
              debug={debug}
              showHandles={showHandles}
              showGrid={showGrid}
              {...props}
            />
            Hello, world!
          </div>
        )}
      </div>
      <textarea
        className="font-mono"
        cols={30}
        value={configText}
        onChange={(e) => setConfigText(e.target.value)}
      />
    </main>
  );
}
