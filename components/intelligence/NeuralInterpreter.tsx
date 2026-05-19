"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { profile } from "@/lib/intelligence/profile";
import { toClientProfile } from "@/lib/intelligence/public-projection";
import { FloatingTrigger } from "./FloatingTrigger";

const InterpreterPanel = dynamic(
  () => import("./InterpreterPanel").then((m) => m.InterpreterPanel),
  { ssr: false },
);

const clientProfile = toClientProfile(profile);

export function NeuralInterpreter() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <FloatingTrigger onOpen={() => setOpen(true)} />
      {open ? (
        <InterpreterPanel
          profile={profile}
          clientProfile={clientProfile}
          onClose={() => setOpen(false)}
        />
      ) : null}
    </>
  );
}
