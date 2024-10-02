import React from "react";
import { IIconProps } from "./interface";

export default function DashboardSvg({
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
      <g clipPath="url(#clip0_344_1791)">
        <path
          d="M19 5V7H15V5H19ZM9 5V11H5V5H9ZM19 13V19H15V13H19ZM9 17V19H5V17H9ZM21 3H13V9H21V3ZM11 3H3V13H11V3ZM21 11H13V21H21V11ZM11 15H3V21H11V15Z"
          fill={fill}
        />
      </g>
      <defs>
        <clipPath id="clip0_344_1791">
          <rect width="24" height="24" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
}
