import { cn } from "@/lib/utils";
import React from "react";

export default function H1({
  className,
  ...props
}: React.HTMLProps<HTMLHeadingElement>) {
  return (
    <h1
      {...props}
      className={`${cn(
        "text-4xl font-extrabold tracking-tight lg:text-5xl",
        className,
      )}`}
    ></h1>
  );
}
