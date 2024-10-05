import React from "react";
import { IIconProps } from "./interface";

export default function ArrowDownSvg({
  width = "24",
  height = "24",
  fill = "#9095A0",
}: IIconProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M6 9L12 15L18 9"
        stroke={fill}
        stroke-width="2.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  );
}
