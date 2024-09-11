import { useElementSize } from "@custom-react-hooks/use-element-size";
import _ from "lodash";
import { CSSProperties } from "react";
type PercentageString = `${number}%`;

function toPercentageString(n: number): PercentageString {
  return `${n * 100}%`;
}

type Vector2<T> = [T, T];
export type Vector = Vector2<number>;

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
type Props = {
  // Center of the ellipse
  center: Vector;
  // Middlepoints of the sides of ellipse's bounding box
  a: Vector;
  b: Vector;

  // The smaller starting ellipse relative to bounding box, the more background around it we have to work with
  originalGradientSize: Vector;

  className?: string;

  initialParentAspect?: number;
  runtimeAspectCalculation?: boolean;

  stops: Stop[];
  showHandles?: boolean;
  showGrid?: boolean;
  debug?: boolean;
} & (
  | {
      initialParentAspect: number;
    }
  | {
      initialParentAspect?: number;
      runtimeAspectCalculation: true;
    }
);

export function RadialBackground({
  center,
  a,
  b,
  stops,
  debug = false,
  showHandles = false,
  showGrid = false,
  originalGradientSize = [1, 1] as Vector,
  initialParentAspect = 1,
  runtimeAspectCalculation = false,
  className,
}: Props) {
  // Is this the only way to get aspect ratio?
  const [ref, parentSize] = useElementSize();

  const parentAspect = runtimeAspectCalculation
    ? parentSize.width && parentSize.height
      ? parentSize.width / parentSize.height
      : initialParentAspect
    : initialParentAspect;

  const isParentSizeAvailable = Number.isFinite(parentAspect);

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
      ref={runtimeAspectCalculation ? ref : null}
      className={`size-full top-0 left-0 absolute pointer-events-none ${className}`}
      style={{
        overflow: debug ? "visible" : "hidden",
      }}
    >
      <div
        className="size-full top-0 left-0 absolute grid grid-cols-2"
        style={
          isParentSizeAvailable
            ? {
                backgroundImage,
                transform: `${translateString} ${matrixString}`,
              }
            : {
                backgroundColor: _.last(stops)?.color,
              }
        }
      >
        {showGrid &&
          _.times(4).map((i) => (
            <div key={i} className="border border-black border-collapse"></div>
          ))}
      </div>
      {showHandles &&
        [center, a, b].map((point, index) => (
          <div
            key={index}
            className="size-full top-0 left-0 z-50 absolute animate-in zoom-in"
            style={{
              transform: `translate(${point.map(toPercentageString).join(", ")})`,
            }}
          >
            <div className="bg-black rounded-full size-4 translate-x-[-50%] translate-y-[-50%]"></div>
          </div>
        ))}
    </div>
  );
}
