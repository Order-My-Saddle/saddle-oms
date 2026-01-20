"use client";
import dynamic from 'next/dynamic';
const Options = dynamic(() => import('../../components/SaddleModelling/Options'), { ssr: false });
export default function OptionsPage() { return <Options />; }
