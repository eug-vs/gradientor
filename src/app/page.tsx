"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { RadialBackground, type Vector } from "./radialBackground";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import _ from "lodash";

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
      showHandles: false,
      showGrid: false,
      runtimeAspectCalculation: false,

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

  const { width, height, ...props } = form.watch();

  return (
    <main className="min-h-screen flex gap-8 p-20 bg-gradient-to-r from-green-100 to-blue-200 rounded-lg">
      <div className="flex flex-col grow gap-2">
        <Form {...form}>
          {(
            [
              "debug",
              "showHandles",
              "showGrid",
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
                      value={field.value.toString()}
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
                    onValueChange={field.onChange}
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
                    onValueChange={field.onChange}
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
                    onValueChange={field.onChange}
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
                    onValueChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>Original ellipse width %</FormLabel>
              </FormItem>
            )}
          />
        </Form>
        <div
          className="mt-20 mx-auto relative flex justify-center flex-col items-center col-span-2 rounded-lg border border-gray-500"
          style={{
            width: `${width}px`,
            height: `${height}px`,
          }}
        >
          <RadialBackground className="rounded-lg" {...props} />
          <span className="z-10">Hello, world!</span>
          <span className="z-10">
            {width} x {height}
          </span>
        </div>
      </div>
      <div>
        <pre>{JSON.stringify(props, null, 2)}</pre>
      </div>
    </main>
  );
}
