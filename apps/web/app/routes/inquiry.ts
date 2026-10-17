// POST /inquiry: forwards the contact form to the API, which saves it for the dashboard.
import { data } from "react-router";
import type { Route } from "./+types/inquiry";
import { api } from "~/lib/api.server";

export async function action({ request }: Route.ActionArgs) {
  const form = await request.formData();
  const field = (k: string) => String(form.get(k) ?? "");
  const ip = request.headers.get("x-forwarded-for") || undefined;
  try {
    const { status, data: body } = await api.sendInquiry({
      name: field("name"), email: field("email"), org: field("org"), interest: field("interest"),
      message: field("message"), page: field("page"), website: field("website"),
    }, ip);
    if (status === 201) return { ok: true };
    return data(body.errors ? { errors: body.errors } : { error: body.error || "Something went wrong. Please try again." }, { status });
  } catch {
    return data({ error: "We couldn’t send your message right now. Please try again shortly." }, { status: 503 });
  }
}

export function loader() {
  throw data("Not found", { status: 404 });
}
