"use client";

import React from 'react';
import { ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-gray-200 py-6 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-600 space-y-3 md:space-y-0">
          {/* 左侧版权信息 */}
          <div className="text-center md:text-left">
            <p className="font-medium">&copy; 2025 AbNovoBench</p>
            <p className="text-xs text-gray-500 mt-1">Antibody De Novo Peptide Sequencing Benchmark</p>
          </div>
          
          {/* 右侧备案信息 */}
          <div className="flex flex-col items-center md:items-end">
            <a 
              href="https://beian.miit.gov.cn/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center space-x-1 hover:text-blue-600 transition-colors duration-200 group"
            >
              <span>闽ICP备2024077705号-2</span>
              <ExternalLink className="w-3 h-3 opacity-50 group-hover:opacity-100 transition-opacity" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}; 