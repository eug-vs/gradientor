import _ from "lodash";
import { CSSProperties } from "react";

type Percentage = `${number}%`;

type Vector2 = readonly [Percentage, Percentage];

type Stop = {
  color: CSSProperties["color"];
  breakpoint: Percentage;
};

interface Props {
  center: Vector2;
  a: Vector2;
  b: Vector2;
  stops: readonly Stop[];
}

function extractNumber(p: Percentage = "0%") {
  return Number(p.replace("%", ""));
}

function toPercentage(p: number): Percentage {
  return `${p}%`;
}

function zipMap(
  a: Vector2,
  b: Vector2,
  operation: (a: number, b: number) => number,
) {
  return _.zip(a, b).map((zipped) => {
    const [a, b] = zipped.map(extractNumber);
    return toPercentage(operation(a, b));
  });
}

function sub(a: Vector2, b: Vector2) {
  return zipMap(a, b, (a, b) => a - b);
}

function RadialBackground({ center, a, b, stops }: Props) {
  const normalizedStops = stops.map((stop) => ({
    color: stop.color,
    breakpoint: toPercentage(extractNumber(stop.breakpoint) / 2),
  }));

  const originalGradientCenter: Vector2 = ["50%", "50%"];
  const originalGradientSize: Vector2 = ["100%", "100%"];

  const translation = sub(center, originalGradientCenter);

  const A = sub(a, center)
    .map(extractNumber)
    .map((x) => (x / extractNumber(originalGradientSize[0])) * 2);
  const B = sub(b, center)
    .map(extractNumber)
    .map((x) => (x / extractNumber(originalGradientSize[1])) * 2);

  console.log({ translation, a });

  return (
    <>
      <div
        className="size-full top-0 left-0 -z-20 absolute overflow-hidden"
        style={{
          background: _.last(stops)?.color,
        }}
      >
        <div
          className="size-full top-0 left-0 -z-10 absolute"
          style={{
            backgroundImage: `radial-gradient(${originalGradientSize.join(" ")} at ${originalGradientCenter.join(" ")}, ${normalizedStops.map((stop) => `${stop.color} ${stop.breakpoint}`).join(", ")})`,
            transform: `translate(${translation[0]}, ${translation[1]}) matrix(${A.join(", ")}, ${B.join(", ")}, 0, 0)`,
          }}
        />
      </div>
    </>
  );
}

export default function Home() {
  const props = {
    center: ["0%", "0%"],
    a: ["100%", "0%"],
    b: ["0%", "100%"],
    stops: [
      { color: "red", breakpoint: "0%" },
      { color: "green", breakpoint: "100%" },
    ],
  } as const;
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <div className="size-40 border-2 border-slate-900 relative">
          <span>Hello, world</span>
          <RadialBackground {...props} />
        </div>
      </main>
    </div>
  );
}
