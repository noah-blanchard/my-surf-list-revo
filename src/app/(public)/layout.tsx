import { Box } from "@mantine/core";
import { createServerSupabase } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function PublicLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createServerSupabase();
    const {
        data: { session },
    } = await supabase.auth.getSession();
    if (session?.user) redirect("/dashboard");

    return (
        <Box
            pos="relative"
            h="100dvh"
            w="100%"
            style={{
                backgroundImage: "url('/images/bg/surf_mesa_bg.jpg')",
                backgroundSize: "cover",
                backgroundPosition: "center",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
            }}
        >
            <Box
                pos="absolute"
                top={0}
                left={0}
                w="100%"
                h="100%"
                style={{
                    backdropFilter: "blur(12px)",
                    backgroundColor: "rgba(0, 0, 0, 0.5)",
                    pointerEvents: "none",
                }}
            />
            <Box pos="relative" style={{ zIndex: 1 }}>
                {children}
            </Box>
        </Box>

    );
}
