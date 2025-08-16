import { createServerSupabase } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { MyListView } from "@/features/user-maps/components/MyListView";

export default async function MyListPage() {
  const supabase = await createServerSupabase();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) redirect("/sign-in");

  return <MyListView userId={session.user.id} />;
}
