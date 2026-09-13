import DashboardCatchAllPage from "../[...slug]/page";

export default async function DashboardPage() {
  return DashboardCatchAllPage({ params: Promise.resolve({ slug: undefined }) });
}
