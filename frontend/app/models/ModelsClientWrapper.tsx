"use client";
import dynamic from "next/dynamic";
const Models = dynamic(() => import('../../components/SaddleModelling/Models'), { ssr: false });
export default function ModelsClientWrapper() {
  return <Models />;
}
