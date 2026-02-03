'use client';

import React from 'react';
import { StepsPanel } from './StepsPanel';
import { Toolbox } from './Toolbox';

export function LeftSidebar() {
    return (
        <div className="flex h-full z-20 shadow-sm">
            {/* Steps Panel - Left Side */}
            <div className="w-64 border-r border-gray-200 bg-white h-full">
                <StepsPanel />
            </div>

            {/* Toolbox - Right Side of Steps */}
            <div className="w-64 border-r border-gray-200 bg-[#FAFAFA] h-full">
                <Toolbox />
            </div>
        </div>
    );
}
