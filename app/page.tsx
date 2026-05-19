"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import HeroComponent from "@/components/heroSection/HeroComponent";
import { NeuralInterpreter } from "@/components/intelligence/NeuralInterpreter";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.prefetch("/simulations");
    router.prefetch("/journey");
    router.prefetch("/projects");
  }, [router]);

  return (
    <>
      <HeroComponent
        onEnterLaptop={() => router.push("/journey")}
        onEnterTablet={() => {
          if (typeof window !== "undefined") {
            sessionStorage.setItem("tablet-absorption", "1");
          }
          router.push("/simulations");
        }}
        onEnterProjects={() => router.push("/projects")}
      />
      <NeuralInterpreter />
    </>
  );
}
