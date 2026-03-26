import { redirect } from "next/navigation";

export default async function RootPage() {
  // Redirect to the default locale
  redirect("/es");
}
