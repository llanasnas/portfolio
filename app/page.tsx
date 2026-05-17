"use client";

import { useRouter } from "next/navigation";
import HeroComponent from "@/components/heroSection/HeroComponent";

export default function Home() {
  const router = useRouter();
  return (
    <HeroComponent
      onEnterLaptop={() => router.push("/cv")}
      onEnterTablet={() => router.push("/simulations")}
    />
  );
}
