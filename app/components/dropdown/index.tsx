import React from "react";
import { IDropdownProps } from "./interface";
import ArrowDownSvg from "../svg/ArrowDown";

export default function Dropdown(props: IDropdownProps) {
  const {
    id,
    label,
    onClick,
    options,
    selectedOption,
    hasError,
    error,
    isDisabled,
  } = props;
  return (
    <div className="py-2 relative">
      <label
        htmlFor={id}
        className="block text-sm text-heading mb-2 font-inter"
      >
        {label}
      </label>
      <div className="absolute top-[45px] right-[10px] z-10">
          <ArrowDownSvg width="20" height="20" fill="#BCC1CA" />
        </div>
      <select
        id={id}
        className={`w-full pl-4 pr-8 py-2 mb-2 outline-none bg-white border placeholder:text-sm placeholder:text-grey rounded-md appearance-none relative ${
          hasError ? "border-error" : "border-stroke/50"
        }`}
        disabled={isDisabled}
        value={selectedOption?.name || "select an option"}
        onChange={(event) => {
          const selectedOption = options?.find(
            (option) =>
              option.name.toLowerCase() === event.target.value.toLowerCase()
          ) || {
            id: "",
            name: "",
          };
          onClick?.(selectedOption);
        }}
      >
        {options?.map((option) => (
          <option
            key={option.id}
            value={option.name}
            className={`text-sm leading-4 ${
              option.name.toLowerCase() === selectedOption?.name.toLowerCase()
                ? "text-accent font-medium"
                : "text-heading"
            }`}
          >
            {option.name}
          </option>
        ))}
      </select>
      {hasError ? (
        <p className="text-error text-sm font-medium">{error}</p>
      ) : null}
    </div>
  );
}
