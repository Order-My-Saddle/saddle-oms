"use client";
import dynamic from 'next/dynamic';
const Presets = dynamic(() => import('../../components/SaddleModelling/Presets'), { ssr: false });
export default function PresetsPage() { return <Presets />; }
