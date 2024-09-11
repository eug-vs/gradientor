import { useElementSize } from "@custom-react-hooks/use-element-size";
import _ from "lodash";
import { CSSProperties, useMemo } from "react";
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
  showGrid?: boolean;
  debug?: boolean;

  onStyleCalculated?: (style: string) => void;
} & (
  | {
      initialParentAspect: number;
    }
  | {
      initialParentAspect?: number;
      runtimeAspectCalculation: true;
    }
);

// We usually start with 100% 100% at 50% 50% (ellipse inscribed into bounding box)
const originalGradientCenter: Vector = [0.5, 0.5];

export function RadialBackground({
  center,
  a,
  b,
  stops,
  debug = false,
  showGrid = false,
  originalGradientSize = [1, 1] as Vector,
  initialParentAspect = 1,
  runtimeAspectCalculation = false,
  className,
  onStyleCalculated: onStyleCalculated,
}: Props) {
  // Is this the only way to get aspect ratio?
  const [ref, parentSize] = useElementSize();

  const parentAspect = runtimeAspectCalculation
    ? parentSize.width && parentSize.height
      ? parentSize.width / parentSize.height
      : initialParentAspect
    : initialParentAspect;

  // For whatever reason we need to remap stops to a range (0%, 50%)
  const normalizedStops = stops.map((stop) => ({
    color: stop.color,
    breakpoint: stop.breakpoint / 2,
  }));

  const style = useMemo(() => {
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

    // Account for aspect ratio (don't ask me why this works)
    A[1] = A[1] / parentAspect;
    B[0] = B[0] * parentAspect;
    const matrixString = `matrix(${A.join(", ")}, ${B.join(", ")}, 0, 0)`;

    const style = {
      backgroundImage,
      transform: `${translateString} ${matrixString}`,
    };

    onStyleCalculated?.(
      `background-image: ${style.backgroundImage};\ntransform: ${style.transform};`,
    );

    return style;
  }, [
    a,
    b,
    center,
    normalizedStops,
    originalGradientSize,
    parentAspect,
    onStyleCalculated,
  ]);

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
        style={style}
      >
        {showGrid &&
          _.times(4).map((i) => (
            <div
              key={i}
              className="border border-black/30 animate-in zoom-in"
            ></div>
          ))}
      </div>
    </div>
  );
}
