"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { RadialBackground, type Vector } from "./radialBackground";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import _ from "lodash";
import Draggable from "react-draggable";
import { cn } from "@/lib/utils";

const vectorSchema = z.tuple([z.number(), z.number()]);

export default function Home() {
  const form = useForm({
    resolver: zodResolver(
      z.object({
        width: z.number(),
        height: z.number(),
        debug: z.boolean(),
        showHandles: z.boolean(),
        showGrid: z.boolean(),
        runtimeAspectCalculation: z.boolean(),
        initialParentAspect: z.number(),
        originalGradientSize: vectorSchema,

        center: vectorSchema,
        a: vectorSchema,
        b: vectorSchema,

        stops: z
          .object({
            color: z.string(),
            breakpoint: z.number(),
          })
          .array(),
      }),
    ),
    defaultValues: {
      width: 500,
      height: 200,
      initialParentAspect: 5 / 2,

      debug: false,
      showHandles: true,
      showGrid: false,
      runtimeAspectCalculation: true,

      originalGradientSize: [0.5, 0.5] as Vector,

      center: [0, 1] as Vector,
      a: [0.75, -0.2] as Vector,
      b: [0.45, 1.5] as Vector,
      stops: [
        { color: "hsla(30, 100%, 50%, 75%)", breakpoint: 0 },
        { color: "hsla(40, 90%, 55%, 75%)", breakpoint: 0.5 },
        { color: "hsla(55, 80%, 65%, 75%)", breakpoint: 1 },
      ],
    },
  });

  const { width, height, showHandles, ...props } = form.watch();

  return (
    <main className="min-h-screen flex gap-8 p-20 bg-gradient-to-r from-green-100 to-blue-200 rounded-lg">
      <div className="flex flex-col grow gap-2">
        <Form {...form}>
          {(
            [
              "debug",
              "showGrid",
              "showHandles",
              "runtimeAspectCalculation",
            ] as const
          ).map((name) => (
            <FormField
              key={name}
              control={form.control}
              name={name}
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      defaultChecked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel>{_.startCase(name)}</FormLabel>
                </FormItem>
              )}
            />
          ))}
          <FormField
            control={form.control}
            name="width"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Slider
                    className="max-w-52"
                    min={150}
                    max={800}
                    value={[field.value]}
                    onValueChange={(v) => field.onChange(v[0])}
                  />
                </FormControl>
                <FormLabel>Width</FormLabel>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="height"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Slider
                    className="max-w-52"
                    min={150}
                    max={800}
                    value={[field.value]}
                    onValueChange={(v) => field.onChange(v[0])}
                  />
                </FormControl>
                <FormLabel>Height</FormLabel>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="originalGradientSize.0"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Slider
                    className="max-w-52"
                    min={0.1}
                    max={1.5}
                    step={0.01}
                    value={[field.value]}
                    onValueChange={(v) => field.onChange(v[0])}
                  />
                </FormControl>
                <FormLabel>Original ellipse width %</FormLabel>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="originalGradientSize.1"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Slider
                    className="max-w-52"
                    min={0.1}
                    max={1.5}
                    step={0.01}
                    value={[field.value]}
                    onValueChange={(v) => field.onChange(v[0])}
                  />
                </FormControl>
                <FormLabel>Original ellipse width %</FormLabel>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="initialParentAspect"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Slider
                    className="max-w-52"
                    min={0.2}
                    max={5}
                    step={0.01}
                    value={[field.value]}
                    onValueChange={(v) => field.onChange(v[0])}
                  />
                </FormControl>
                <FormLabel>Initial parent aspect ratio</FormLabel>
              </FormItem>
            )}
          />
        </Form>
        <div
          className="mt-20 mx-auto relative flex justify-center flex-col items-center col-span-2 rounded-lg border border-gray-500"
          style={{
            width,
            height,
          }}
        >
          <RadialBackground className="rounded-lg" {...props} />
          <span className="z-10">Hello, world!</span>
          <span className="z-10">
            {width} x {height}
          </span>
          {showHandles &&
            (["center", "a", "b"] as const).map((name, index) => (
              <div className="absolute" key={index}>
                <Controller
                  name={name}
                  control={form.control}
                  render={({ field }) => (
                    <Draggable
                      positionOffset={{
                        x: -width / 2,
                        y: -height / 2,
                      }}
                      position={{
                        x: field.value[0] * width,
                        y: field.value[1] * height,
                      }}
                      onDrag={(_e, data) => {
                        field.onChange([data.x / width, data.y / height]);
                      }}
                    >
                      <div className="cursor-move z-50">
                        <div
                          className={cn(`rounded-full size-4`, {
                            "bg-black": index === 0,
                            "bg-red-500": index === 1,
                            "bg-blue-500": index === 2,
                          })}
                        />
                      </div>
                    </Draggable>
                  )}
                ></Controller>
              </div>
            ))}
        </div>
      </div>
      <div>
        <pre>{JSON.stringify(props, null, 2)}</pre>
      </div>
    </main>
  );
}
