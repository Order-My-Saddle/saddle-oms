"use client";

import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Settings, Package, Layers, Puzzle, Star, Palette } from 'lucide-react';
import Link from 'next/link';

interface SaddleModellingSidebarSectionProps {
  isCollapsed?: boolean;
  initiallyCollapsed?: boolean;
}

export const SaddleModellingSidebarSection: React.FC<SaddleModellingSidebarSectionProps> = ({
  isCollapsed = false,
  initiallyCollapsed = true
}) => {
  const [isExpanded, setIsExpanded] = useState(!initiallyCollapsed);

  if (isCollapsed) {
    return (
      <div className="flex flex-col space-y-1">
        <div className="flex items-center justify-center p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors">
          <Settings size={20} />
        </div>
      </div>
    );
  }

  const saddleModellingItems = [
    {
      title: 'Brands',
      href: '/saddle-modelling/brands',
      icon: Package,
      description: 'Manage saddle brands'
    },
    {
      title: 'Models',
      href: '/saddle-modelling/models',
      icon: Layers,
      description: 'Configure saddle models'
    },
    {
      title: 'Leather Types',
      href: '/saddle-modelling/leathertypes',
      icon: Palette,
      description: 'Manage leather materials'
    },
    {
      title: 'Options',
      href: '/saddle-modelling/options',
      icon: Puzzle,
      description: 'Configure saddle options'
    },
    {
      title: 'Extras',
      href: '/saddle-modelling/extras',
      icon: Star,
      description: 'Manage additional features'
    },
    {
      title: 'Presets',
      href: '/saddle-modelling/presets',
      icon: Settings,
      description: 'Saved configurations'
    }
  ];

  return (
    <div className="space-y-1">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full p-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors"
        data-testid="saddle-modelling-toggle"
      >
        <div className="flex items-center space-x-2">
          <Settings size={16} />
          <span>Saddle Modelling</span>
        </div>
        {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
      </button>

      {isExpanded && (
        <div className="pl-4 space-y-1" data-testid="saddle-modelling-items">
          {saddleModellingItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center space-x-2 p-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors group"
                title={item.description}
              >
                <IconComponent size={14} />
                <span>{item.title}</span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SaddleModellingSidebarSection;