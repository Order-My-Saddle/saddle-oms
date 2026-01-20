"use client";
import dynamic from 'next/dynamic';
const Brands = dynamic(() => import('../../components/SaddleModelling/Brands'), { ssr: false });
export default function BrandsPage() { return <Brands />; }
