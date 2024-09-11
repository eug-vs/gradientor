"use client";
import { useMemo, useState } from "react";
import { RadialBackground, type Vector } from "./radialBackground";

const defaultProps = {
  center: [0, 1] as Vector,
  a: [0.75, -0.2] as Vector,
  b: [0.45, 1.5] as Vector,
  originalGradientSize: [0.5, 0.5] as Vector,
  initialParentAspect: 5 / 2,
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
  const [runtimeAspectCalculation, setRuntimeAspectCalculation] =
    useState(false);
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
    <main className="min-h-screen flex gap-8 p-20 bg-gradient-to-r from-green-100 to-blue-200 rounded-lg">
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
              id="aspect"
              type="checkbox"
              value={runtimeAspectCalculation.toString()}
              onChange={(e) => setRuntimeAspectCalculation(e.target.checked)}
            />
            <label htmlFor="aspect">Compute aspect ratio an runtime</label>
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
            className="mx-auto relative flex justify-center flex-col items-center col-span-2 rounded-lg border border-gray-500"
            style={{
              width: width,
              height: 200,
            }}
          >
            <RadialBackground
              className="rounded-lg"
              debug={debug}
              showHandles={showHandles}
              showGrid={showGrid}
              runtimeAspectCalculation={runtimeAspectCalculation}
              {...props}
            />
            <span className="z-10">Hello, world!</span>
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
