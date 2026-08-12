import { redirect } from "next/navigation";
import { getCurrentParticipant } from "@/lib/auth";

export default async function RootPage() {
  const participant = await getCurrentParticipant();
  redirect(participant ? "/program" : "/login");
}
