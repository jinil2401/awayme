export function capitalizeFirstLetter(string: string): string {
    return string
      ?.toLowerCase()
      ?.split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }