import { data } from "react-router";

export function loader() {
  throw data("Not found", { status: 404 });
}

export function meta() {
  return [{ title: "Page not found | Digital Dome" }, { name: "robots", content: "noindex, follow" }];
}

export default function NotFound() {
  return null;
}
