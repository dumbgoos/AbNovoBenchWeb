"use client";

import { useState, useEffect, useCallback } from 'react';
import { datasetsAPI, dataRequestAPI } from '@/services/api';
import { Search, FileText, Activity, X, Filter, BarChart3, Zap, ChevronDown, Maximize2, Sparkles, TrendingUp, Globe, RefreshCw, AlertCircle, Send, Eye, Database, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { DataApplicationModal } from '@/components/ui/DataApplicationModal';

// Types
interface MGFDataset {
  id: string;
  name: string;
  category: string;
  description: string;
  file_size: string;
  file_path: string;
}

interface MGFPreview {
  spectra_preview: Array<{
    title?: string;
    pepmass?: string;
    charge?: string;
    sequence?: string;
    peaks: Array<{
      mz: number;
      intensity: number;
    }>;
  }>;
  raw_content: string;
}

// Antibody Information data from CSV
const antibodyData = [
  { antibody: "mAb1", species: "Homo sapiens" },
  { antibody: "mAb2", species: "Homo sapiens" },
  { antibody: "mAb3", species: "Homo sapiens" },
  { antibody: "20230210-mAb4", species: "Mus musculus" },
  { antibody: "20230324-mAb5", species: "Rattus norvegicus" },
  { antibody: "20230424-mAb6", species: "Rattus norvegicus" },
  { antibody: "20230602-mAb7", species: "Rattus norvegicus" },
  { antibody: "20230602-mAb8", species: "Rattus norvegicus" },
  { antibody: "20230602-mAb9", species: "Rattus norvegicus" },
  { antibody: "20230602-mAb10", species: "Mus musculus" },
  { antibody: "20230629-mAb11", species: "Mus musculus" },
  { antibody: "20230703-mAb12", species: "Mus musculus" },
  { antibody: "20230707-mAb13", species: "Mus musculus" },
  { antibody: "20230718-mAb14", species: "Mus musculus" },
  { antibody: "20230724-mAb15", species: "Mus musculus" },
  { antibody: "20230724-mAb16", species: "Mus musculus" },
  { antibody: "20230724-mAb17", species: "Mus musculus" },
  { antibody: "20230828-mAb18", species: "Mus musculus" },
  { antibody: "20230828-mAb19", species: "Mus musculus" },
  { antibody: "20230905-mAb20", species: "Mus musculus" },
  { antibody: "20231005-mAb21", species: "Homo sapiens" },
  { antibody: "20231017-mAb22", species: "Mus musculus" },
  { antibody: "20231017-mAb23", species: "Mus musculus" },
  { antibody: "20231024-mAb24", species: "Homo sapiens" },
  { antibody: "20231030-mAb25", species: "Mus musculus" },
  { antibody: "20231110-mAb26", species: "Mus musculus" },
  { antibody: "20231114-mAb27", species: "Mus musculus" },
  { antibody: "20231114-mAb28", species: "Mus musculus" },
  { antibody: "20231127-mAb29", species: "Mus musculus" },
  { antibody: "20231203-mAb30", species: "Homo sapiens" },
  { antibody: "20231213-mAb31", species: "Mus musculus" },
  { antibody: "20231219-mAb32", species: "Mus musculus" },
  { antibody: "20231221-mAb33", species: "Homo sapiens" },
  { antibody: "20240110-mAb34", species: "Mus musculus" },
  { antibody: "20240117-mAb35", species: "Rattus norvegicus" },
  { antibody: "20240208-mAb36", species: "Mus musculus" },
  { antibody: "20240213-mAb37", species: "Mus musculus" },
  { antibody: "20240223-mAb38", species: "Mus musculus" },
  { antibody: "20240223-mAb39", species: "Mus musculus" },
  { antibody: "20240315-mAb40", species: "Rattus norvegicus" },
  { antibody: "20240320-mAb41", species: "Mus musculus" },
  { antibody: "20240320-mAb42", species: "Rattus norvegicus" },
  { antibody: "20240405-mAb43", species: "Mus musculus" },
  { antibody: "20240408-mAb44", species: "Mus musculus" },
  { antibody: "20240408-mAb45", species: "Mus musculus" },
  { antibody: "20240408-mAb46", species: "Mus musculus" },
  { antibody: "20240408-mAb47", species: "Mus musculus" },
  { antibody: "20240408-mAb48", species: "Rattus norvegicus" },
  { antibody: "20240408-mAb49", species: "Mus musculus" },
  { antibody: "20240420-mAb50", species: "Rattus norvegicus" },
  { antibody: "20240420-mAb51", species: "Rattus norvegicus" },
  { antibody: "20240420-mAb52", species: "Mus musculus" },
  { antibody: "20240428-mAb53", species: "Mus musculus" },
  { antibody: "20240428-mAb54", species: "Mus musculus" },
  { antibody: "20240506-mAb55", species: "Rattus norvegicus" },
  { antibody: "20240519-mAb56", species: "Mus musculus" },
  { antibody: "20240519-mAb57", species: "Mus musculus" },
  { antibody: "20240519-mAb58", species: "Mus musculus" },
  { antibody: "20240527-mAb59", species: "Mus musculus" },
  { antibody: "20240527-mAb60", species: "Mus musculus" },
  { antibody: "20240527-mAb61", species: "Mus musculus" },
  { antibody: "20240611-mAb62", species: "Rattus norvegicus" },
  { antibody: "20240611-mAb63", species: "Cricetinae gen. sp." },
  { antibody: "20240611-mAb64", species: "Rattus norvegicus" },
  { antibody: "20240611-mAb65", species: "Rattus norvegicus" },
  { antibody: "20240611-mAb66", species: "Rattus norvegicus" },
  { antibody: "20240619-mAb67", species: "Mus musculus" },
  { antibody: "20240619-mAb68", species: "Mus musculus" },
  { antibody: "20240619-mAb69", species: "Mus musculus" },
  { antibody: "20240702-mAb70", species: "Bos taurus" },
  { antibody: "20240703-mAb71", species: "Mus musculus" },
  { antibody: "20240703-mAb72", species: "Mus musculus" },
  { antibody: "20240723-mAb73", species: "Mus musculus" },
  { antibody: "20240805-mAb74", species: "Oryctolagus cuniculus" },
  { antibody: "20240805-mAb75", species: "Oryctolagus cuniculus" },
  { antibody: "20240810-mAb76", species: "Mus musculus" },
  { antibody: "20240810-mAb77", species: "Mus musculus" },
  { antibody: "20240815-mAb78", species: "Mus musculus" },
  { antibody: "20240827-mAb79", species: "Mus musculus" },
  { antibody: "20240828-mAb80", species: "Mus musculus" },
  { antibody: "20240902-mAb81", species: "Mus musculus" },
  { antibody: "20240902-mAb82", species: "Mus musculus" },
  { antibody: "20240902-mAb83", species: "Mus musculus" },
  { antibody: "20240907-mAb84", species: "Rattus norvegicus" },
  { antibody: "20240907-mAb85", species: "Rattus norvegicus" },
  { antibody: "20240910-mAb86", species: "Mus musculus" },
  { antibody: "20240919_mAb87", species: "Mus musculus" },
  { antibody: "20240924-mAb88", species: "Mus musculus" },
  { antibody: "20240924-mAb89", species: "Mus musculus" },
  { antibody: "20240926-mAb90", species: "Mus musculus" },
  { antibody: "20240929-mAb91", species: "Mus musculus" },
  { antibody: "20240930-mAb92", species: "Mus musculus" },
  { antibody: "20241001-mAb93", species: "Mus musculus" },
  { antibody: "20241004-mAb94", species: "Rattus norvegicus" },
  { antibody: "20241004-mAb95", species: "Rattus norvegicus" },
  { antibody: "20241004-mAb96", species: "Rattus norvegicus" },
  { antibody: "20241006-mAb97", species: "Mus musculus" },
  { antibody: "20241011-mAb98", species: "Rattus norvegicus" },
  { antibody: "20241015-mAb99", species: "Rattus norvegicus" },
  { antibody: "20241017-mAb100", species: "Mus musculus" },
  { antibody: "20241017-mAb101", species: "Mus musculus" },
  { antibody: "20241017-mAb102", species: "Mus musculus" },
  { antibody: "20241017-mAb103", species: "Mus musculus" },
  { antibody: "20241018-mAb104", species: "Mus musculus" },
  { antibody: "20241020-mAb105", species: "Mus musculus" },
  { antibody: "20241021-mAb106", species: "Mus musculus" },
  { antibody: "20241021-mAb107", species: "Bos taurus" },
  { antibody: "20241022-mAb108", species: "Bos taurus" },
  { antibody: "20241025-mAb109", species: "Bos taurus" },
  { antibody: "20241025-mAb110", species: "Bos taurus" },
  { antibody: "20241029-mAb111", species: "Bos taurus" },
  { antibody: "20241030-mAb112", species: "Bos taurus" },
  { antibody: "20241031-mAb113", species: "Bos taurus" },
  { antibody: "20241103-mAb114", species: "Bos taurus" },
  { antibody: "20241104-mAb115", species: "Bos taurus" },
  { antibody: "20241123-mAb116", species: "Mus musculus" },
  { antibody: "20241123-mAb117", species: "Mus musculus" },
  { antibody: "20241212-mAb118", species: "Oryctolagus cuniculus" },
  { antibody: "20241227-mAb119", species: "Mus musculus" },
  { antibody: "20241228-mAb120", species: "Mus musculus" },
  { antibody: "20241230-mAb121", species: "Mus musculus" },
  { antibody: "20241230-mAb122", species: "Mus musculus" },
  { antibody: "20241231-mAb123", species: "Mus musculus" },
  { antibody: "20250107-mAb124", species: "Mus musculus" },
  { antibody: "20250107-mAb125", species: "Mus musculus" },
  { antibody: "20250120-mAb126", species: "Mus musculus" },
  { antibody: "20250122-mAb127", species: "Mus musculus" },
  { antibody: "20250123-mAb128", species: "Mus musculus" },
  { antibody: "20250123-mAb129", species: "Mus musculus" },
  { antibody: "20250208-mAb130", species: "Mus musculus" },
  { antibody: "20250210-mAb131", species: "Mus musculus" }
];

// Get species badge style
const getSpeciesBadgeStyle = (species: string) => {
  switch (species) {
    case "Homo sapiens":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "Mus musculus":
      return "bg-green-50 text-green-700 border-green-200";
    case "Rattus norvegicus":
      return "bg-orange-50 text-orange-700 border-orange-200";
    case "Bos taurus":
      return "bg-purple-50 text-purple-700 border-purple-200";
    case "Oryctolagus cuniculus":
      return "bg-pink-50 text-pink-700 border-pink-200";
    case "Cricetinae gen. sp.":
      return "bg-yellow-50 text-yellow-700 border-yellow-200";
    default:
      return "bg-gray-50 text-gray-700 border-gray-200";
  }
};

// Format species name for display
const formatSpeciesName = (species: string) => {
  const shortNames: { [key: string]: string } = {
    "Homo sapiens": "Human",
    "Mus musculus": "Mouse",
    "Rattus norvegicus": "Rat",
    "Bos taurus": "Bovine",
    "Oryctolagus cuniculus": "Rabbit",
    "Cricetinae gen. sp.": "Hamster"
  };
  return shortNames[species] || species;
};

// Antibody Information Table Component
const AntibodyInformationTable = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  
  const totalPages = Math.ceil(antibodyData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = antibodyData.slice(startIndex, endIndex);
  
  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };
  
  return (
    <Card className="mb-8 bg-white/80 backdrop-blur-sm border-0 shadow-xl">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg">
        <CardTitle className="flex items-center gap-3 text-xl">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
            <Database className="w-4 h-4 text-white" />
          </div>
          Antibody Information
        </CardTitle>
        <CardDescription className="text-gray-600">
          Complete collection of {antibodyData.length} monoclonal antibodies with species information
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div className="overflow-x-auto mb-4">
          <table className="w-full border-collapse bg-white rounded-lg overflow-hidden shadow-sm">
            <thead>
              <tr className="bg-gradient-to-r from-gray-50 to-gray-100">
                <th className="border border-gray-200 px-4 py-3 text-left font-semibold text-gray-700">Antibody ID</th>
                <th className="border border-gray-200 px-4 py-3 text-left font-semibold text-gray-700">Species</th>
              </tr>
            </thead>
            <tbody>
              {currentData.map((item, index) => (
                <tr key={item.antibody} className="hover:bg-gray-50 transition-colors">
                  <td className="border border-gray-200 px-4 py-3 font-medium text-gray-900">
                    {item.antibody}
                  </td>
                  <td className="border border-gray-200 px-4 py-3">
                    <Badge variant="outline" className={getSpeciesBadgeStyle(item.species)}>
                      {formatSpeciesName(item.species)}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="flex items-center justify-between px-2">
          <div className="text-sm text-gray-500">
            Showing {startIndex + 1} to {Math.min(endIndex, antibodyData.length)} of {antibodyData.length} antibodies
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            {/* Page numbers */}
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => goToPage(pageNum)}
                    className="h-8 w-8 p-0 text-xs"
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Enhanced Smart Modal Component
interface SmartModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

const SmartModal: React.FC<SmartModalProps> = ({ isOpen, onClose, title, subtitle, children }) => {
  const [scrollY, setScrollY] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(0);
  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Get current scroll position and viewport height
      const updatePosition = () => {
        setScrollY(window.scrollY);
        setViewportHeight(window.innerHeight);
      };

      updatePosition();
      
      // Listen for scroll and resize events
      window.addEventListener('scroll', updatePosition);
      window.addEventListener('resize', updatePosition);
      
      // Prevent background scrolling
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      
      // ESC key to close
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };
      document.addEventListener('keydown', handleEscape);
      
      return () => {
        document.body.style.overflow = originalOverflow;
        window.removeEventListener('scroll', updatePosition);
        window.removeEventListener('resize', updatePosition);
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Calculate modal position - relative to current viewport position
  const modalTop = scrollY + viewportHeight * 0.02; // 2% from viewport top
  const modalWidth = isMaximized ? '95vw' : 'min(90vw, 1200px)';
  const modalHeight = isMaximized ? `${viewportHeight * 0.96}px` : `${viewportHeight * 0.85}px`;

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="absolute left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-xl overflow-hidden flex flex-col"
        style={{ 
          top: modalTop,
          width: modalWidth,
          height: modalHeight,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <FileText className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
                {subtitle && (
                  <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMaximized(!isMaximized)}
                className="h-8 w-8"
              >
                <Maximize2 className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
        
        {/* Modal Content */}
        <div className="flex-1 bg-white overflow-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

export default function DatasetsPage() {
  const [datasets, setDatasets] = useState<MGFDataset[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [previewData, setPreviewData] = useState<MGFPreview | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [currentDataset, setCurrentDataset] = useState<MGFDataset | null>(null);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [applicationDataset, setApplicationDataset] = useState<MGFDataset | null>(null);

  // Fetch datasets
  useEffect(() => {
    const fetchDatasets = async () => {
      try {
        setLoading(true);
        const response = await datasetsAPI.getMGFFiles();
        if (response.success && response.data && response.data.datasets) {
          setDatasets(response.data.datasets);
        } else {
          console.error('Invalid response structure:', response);
          setDatasets([]);
        }
      } catch (error) {
        console.error('Failed to fetch datasets:', error);
        setDatasets([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDatasets();
  }, []);

  // Filter datasets
  const filteredDatasets = (Array.isArray(datasets) ? datasets : []).filter(dataset => {
    const matchesSearch = dataset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         dataset.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || dataset.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Statistics
  const datasetsArray = Array.isArray(datasets) ? datasets : [];
  const proteaseCount = datasetsArray.filter(d => d.category === 'Protease' || d.category === 'protease').length;
  const speciesCount = datasetsArray.filter(d => d.category === 'Species' || d.category === 'species').length;
  const categories = ['all', ...Array.from(new Set(datasetsArray.map(d => d.category)))];

  // Handle preview
  const handlePreview = useCallback(async (dataset: MGFDataset) => {
    try {
      setCurrentDataset(dataset);
      setShowModal(true);
      setPreviewLoading(true);
      setPreviewData(null);
      
      const response = await datasetsAPI.getMGFFilePreview(dataset.id);
      if (response.success) {
        setPreviewData(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch preview:', error);
    } finally {
      setPreviewLoading(false);
    }
  }, []);

  // Handle apply for dataset access
  const handleApply = useCallback((dataset: MGFDataset) => {
    setApplicationDataset(dataset);
    setShowApplicationModal(true);
  }, []);

  // Handle application submission
  const handleApplicationSubmit = useCallback(async (applicationData: {
    dataName: string;
    purpose: string;
    organization: string;
    contactEmail: string;
    additionalInfo: string;
  }) => {
    try {
      await dataRequestAPI.createRequest(applicationData);
      console.log('Application submitted successfully');
    } catch (error) {
      console.error('Application submission failed:', error);
      throw error;
    }
  }, []);

  // Close modal
  const closeModal = useCallback(() => {
    setShowModal(false);
    setPreviewData(null);
    setCurrentDataset(null);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
          <div className="absolute top-40 left-1/2 w-80 h-80 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-500"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
              <p className="text-gray-600">Loading MGF datasets...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute top-40 left-1/2 w-80 h-80 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-6 shadow-lg">
            <Database className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent mb-6">
            MGF Dataset Hub
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed text-center">
            Discover and access high-quality MGF datasets tailored for monoclonal antibody de novo sequencing research.
          </p>
          
          {/* Stats */}
          <div className="flex items-center justify-center gap-4 mt-8 flex-wrap">
            <div className="flex items-center gap-2 px-4 py-2 bg-white/50 backdrop-blur-sm rounded-full border border-gray-200 shadow-sm">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <span className="text-gray-700 font-semibold text-sm">131 mAbs' PSMs</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white/50 backdrop-blur-sm rounded-full border border-gray-200 shadow-sm">
              <Database className="w-4 h-4 text-blue-600" />
              <span className="text-gray-700 font-semibold text-sm">8 assembly mAbs</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white/50 backdrop-blur-sm rounded-full border border-gray-200 shadow-sm">
              <Zap className="w-4 h-4 text-green-600" />
              <span className="text-gray-700 font-semibold text-sm">11 Protease</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white/50 backdrop-blur-sm rounded-full border border-gray-200 shadow-sm">
              <Globe className="w-4 h-4 text-purple-600" />
              <span className="text-gray-700 font-semibold text-sm">6 Species</span>
            </div>
          </div>
        </div>

        {/* 8 mAbs Antibody Information Table */}
        <Card className="mb-8 bg-white/80 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-t-lg">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                <Database className="w-4 h-4 text-white" />
              </div>
              8 mAbs Antibody Information
            </CardTitle>
            <CardDescription className="text-gray-600">
              Assembly validation set with fully annotated monoclonal antibody sequences
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse bg-white rounded-lg overflow-hidden shadow-sm">
                <thead>
                  <tr className="bg-gradient-to-r from-gray-50 to-gray-100">
                    <th className="border border-gray-200 px-4 py-3 text-left font-semibold text-gray-700">mAb ID</th>
                    <th className="border border-gray-200 px-4 py-3 text-left font-semibold text-gray-700">LC (Light Chain)</th>
                    <th className="border border-gray-200 px-4 py-3 text-left font-semibold text-gray-700">HC (Heavy Chain)</th>
                    <th className="border border-gray-200 px-4 py-3 text-left font-semibold text-gray-700">Species</th>
                    <th className="border border-gray-200 px-4 py-3 text-left font-semibold text-gray-700">Protease Used</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="border border-gray-200 px-4 py-3 font-medium text-gray-900">mAb1</td>
                    <td className="border border-gray-200 px-4 py-3 text-gray-700">217 AA</td>
                    <td className="border border-gray-200 px-4 py-3 text-gray-700">447 AA</td>
                    <td className="border border-gray-200 px-4 py-3">
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Homo</Badge>
                    </td>
                    <td className="border border-gray-200 px-4 py-3 text-sm text-gray-600">Asp-N, Chymotrypsin, Elastase, Pepsin, Trypsin</td>
                  </tr>
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="border border-gray-200 px-4 py-3 font-medium text-gray-900">mAb2</td>
                    <td className="border border-gray-200 px-4 py-3 text-gray-700">217 AA</td>
                    <td className="border border-gray-200 px-4 py-3 text-gray-700">447 AA</td>
                    <td className="border border-gray-200 px-4 py-3">
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Homo</Badge>
                    </td>
                    <td className="border border-gray-200 px-4 py-3 text-sm text-gray-600">Asp-N, Chymotrypsin, Elastase, Pepsin, Trypsin</td>
                  </tr>
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="border border-gray-200 px-4 py-3 font-medium text-gray-900">mAb3</td>
                    <td className="border border-gray-200 px-4 py-3 text-gray-700">217 AA</td>
                    <td className="border border-gray-200 px-4 py-3 text-gray-700">447 AA</td>
                    <td className="border border-gray-200 px-4 py-3">
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Homo</Badge>
                    </td>
                    <td className="border border-gray-200 px-4 py-3 text-sm text-gray-600">Asp-N, Chymotrypsin, Elastase, Pepsin, Trypsin</td>
                  </tr>
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="border border-gray-200 px-4 py-3 font-medium text-gray-900">mAb4</td>
                    <td className="border border-gray-200 px-4 py-3 text-gray-700">214 AA</td>
                    <td className="border border-gray-200 px-4 py-3 text-gray-700">440 AA</td>
                    <td className="border border-gray-200 px-4 py-3">
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Mus</Badge>
                    </td>
                    <td className="border border-gray-200 px-4 py-3 text-sm text-gray-600">Asp-N, Chymotrypsin, Elastase, Pepsin, Trypsin</td>
                  </tr>
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="border border-gray-200 px-4 py-3 font-medium text-gray-900">mAb5</td>
                    <td className="border border-gray-200 px-4 py-3 text-gray-700">214 AA</td>
                    <td className="border border-gray-200 px-4 py-3 text-gray-700">446 AA</td>
                    <td className="border border-gray-200 px-4 py-3">
                      <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">Mus + Homo</Badge>
                    </td>
                    <td className="border border-gray-200 px-4 py-3 text-sm text-gray-600">Asp-N, Chymotrypsin, Elastase, Pepsin, Trypsin</td>
                  </tr>
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="border border-gray-200 px-4 py-3 font-medium text-gray-900">mAb6</td>
                    <td className="border border-gray-200 px-4 py-3 text-gray-700">214 AA</td>
                    <td className="border border-gray-200 px-4 py-3 text-gray-700">455 AA</td>
                    <td className="border border-gray-200 px-4 py-3">
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Homo</Badge>
                    </td>
                    <td className="border border-gray-200 px-4 py-3 text-sm text-gray-600">Asp-N, Chymotrypsin, Elastase, Pepsin, Trypsin</td>
                  </tr>
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="border border-gray-200 px-4 py-3 font-medium text-gray-900">mAb7</td>
                    <td className="border border-gray-200 px-4 py-3 text-gray-700">215 AA</td>
                    <td className="border border-gray-200 px-4 py-3 text-gray-700">455 AA</td>
                    <td className="border border-gray-200 px-4 py-3">
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Homo</Badge>
                    </td>
                    <td className="border border-gray-200 px-4 py-3 text-sm text-gray-600">Asp-N, Chymotrypsin, Elastase, Pepsin, Trypsin</td>
                  </tr>
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="border border-gray-200 px-4 py-3 font-medium text-gray-900">mAb8</td>
                    <td className="border border-gray-200 px-4 py-3 text-gray-700">216 AA</td>
                    <td className="border border-gray-200 px-4 py-3 text-gray-700">450 AA</td>
                    <td className="border border-gray-200 px-4 py-3">
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Homo</Badge>
                    </td>
                    <td className="border border-gray-200 px-4 py-3 text-sm text-gray-600">Asp-N, Chymotrypsin, Elastase, Pepsin, Trypsin</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Antibody Information Table (from CSV) */}
        <AntibodyInformationTable />

        {/* Search and Filter */}
        <Card className="mb-8 bg-white/80 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-t-lg">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Filter className="w-4 h-4 text-white" />
              </div>
              Dataset Filters
            </CardTitle>
            <CardDescription className="text-gray-600">
              Search and filter MGF datasets by category and content
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-700">
                  🔍 Search Datasets
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search datasets by name or description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-10 border-2 border-gray-200 focus:border-blue-500 rounded-lg"
                  />
                </div>
              </div>
              
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-700">
                  📂 Category Filter
                </label>
                <div className="flex flex-wrap gap-2">
                  {categories.map(category => (
                    <Button
                      key={category}
                      variant={selectedCategory === category ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedCategory(category)}
                      className={`
                        px-4 py-2 rounded-lg transition-all duration-200
                        ${selectedCategory === category 
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' 
                          : 'border-gray-200 hover:bg-gray-50'
                        }
                      `}
                    >
                      {category === 'all' ? 'All' : category}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between text-gray-600 bg-gray-50 rounded-lg p-3 mt-6">
              <span className="font-medium">
                Showing {filteredDatasets.length} of {datasetsArray.length} datasets
              </span>
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-emerald-600" />
                <span className="text-sm">High Quality Data</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dataset Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredDatasets.map((dataset) => (
            <Card 
              key={dataset.id} 
              className="bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-shadow duration-300"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-semibold text-gray-900 mb-2">
                      {dataset.name}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${
                          dataset.category === 'protease' || dataset.category === 'Protease'
                            ? 'text-emerald-600 border-emerald-200' 
                            : 'text-purple-600 border-purple-200'
                        }`}
                      >
                        {dataset.category}
                      </Badge>
                    </div>
                  </div>
                  <div className={`p-2 rounded-lg ${
                    dataset.category === 'protease' || dataset.category === 'Protease'
                      ? 'bg-emerald-100' 
                      : 'bg-purple-100'
                  }`}>
                    {dataset.category === 'protease' || dataset.category === 'Protease' 
                      ? <Zap className="w-4 h-4 text-emerald-600" />
                      : <Activity className="w-4 h-4 text-purple-600" />
                    }
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <p className="text-gray-600 text-sm leading-relaxed mb-3">
                  {dataset.description}
                </p>
                
                <div className="flex items-center text-gray-500 mb-4 bg-gray-50 rounded-md p-2">
                  <span className="flex items-center gap-2 text-xs">
                    <FileText className="w-3 h-3" />
                    {dataset.file_size}
                  </span>
                </div>
                
                <div className="flex gap-3">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handlePreview(dataset)}
                    className="flex-1"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Preview
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleApply(dataset)}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Apply for Access
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredDatasets.length === 0 && (
          <Card className="text-center py-12 bg-white/80 backdrop-blur-sm border-0 shadow-xl">
            <CardContent>
              <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Database className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-lg font-medium mb-2 text-gray-700">No datasets found</p>
                <p className="text-sm text-center max-w-md leading-relaxed mb-4">
                  No datasets match your current search criteria. Try adjusting your filters or search terms.
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('all');
                  }}
                  className="px-6 py-2"
                >
                  Clear Filters
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Enhanced Smart Modal */}
      <SmartModal
        isOpen={showModal}
        onClose={closeModal}
        title={currentDataset?.name || ''}
        subtitle={currentDataset?.description}
      >
        {previewLoading ? (
          <div className="flex items-center justify-center py-32">
            <div className="text-center">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
              <p className="text-gray-600">Loading file preview...</p>
            </div>
          </div>
        ) : previewData && previewData.raw_content ? (
          <div className="h-full p-6">
            <div className="bg-gray-900 text-gray-100 rounded-lg p-6 overflow-auto h-full">
              <pre className="text-sm whitespace-pre-wrap font-mono leading-relaxed">
                {previewData.raw_content}
              </pre>
            </div>
          </div>
        ) : (
          <div className="text-center py-32">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Content Loading Failed</h3>
            <p className="text-gray-600 mb-6">Unable to load file preview</p>
            <Button 
              onClick={closeModal}
              variant="outline"
            >
              Close
            </Button>
          </div>
        )}
      </SmartModal>

      {/* Data Application Modal */}
      <DataApplicationModal
        isOpen={showApplicationModal}
        onClose={() => {
          setShowApplicationModal(false);
          setApplicationDataset(null);
        }}
        datasetName={applicationDataset?.name || ''}
        onSubmit={handleApplicationSubmit}
      />
    </div>
  );
} 