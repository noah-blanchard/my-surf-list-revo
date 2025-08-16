import { redirect } from "next/navigation";
import { MyListView } from "@/features/user-maps/components/MyListView";
import { createClient } from "@/lib/supabase/server";

export default async function MyListPage() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) redirect("/sign-in");

  return <MyListView userId={session.user.id} />;
}
