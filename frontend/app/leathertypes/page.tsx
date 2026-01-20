"use client";
import dynamic from 'next/dynamic';
const Leathertypes = dynamic(() => import('../../components/SaddleModelling/Leathertypes'), { ssr: false });
export default function LeathertypesPage() { return <Leathertypes />; }
