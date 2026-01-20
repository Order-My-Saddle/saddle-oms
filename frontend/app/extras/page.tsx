"use client";
import dynamic from 'next/dynamic';
const Extras = dynamic(() => import('../../components/SaddleModelling/Extras'), { ssr: false });
export default function ExtrasPage() { return <Extras />; }
