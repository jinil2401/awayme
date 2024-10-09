import { Suspense } from "react";
import CustomErrorPage from "./error";

// This component passed as a fallback to the Suspense boundary
// will be rendered in place of the search bar in the initial HTML.
// When the value is available during React hydration the fallback
// will be replaced with the `<SearchBar>` component.
function SearchBarFallback() {
  return <p>placeholder</p>;
}

export default function Page() {
  return (
    <>
      <Suspense fallback={<SearchBarFallback />}>
        <CustomErrorPage />
      </Suspense>
    </>
  );
}
