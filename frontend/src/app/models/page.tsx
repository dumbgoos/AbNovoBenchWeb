"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  Brain, 
  Download, 
  Eye, 
  Code, 
  Database, 
  Calendar, 
  ExternalLink, 
  GitBranch, 
  Grid, 
  List,
  Activity,
  Filter,
  Wifi,
  WifiOff,
  Loader2,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { modelsAPI } from '@/services/api';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Define Model interface
interface Model {
  id: number;
  name: string;
  architecture: string;
  code_path: string;
  checkpoint_path: string;
  log_path: string;
  url: string;
  date: string;
  is_delete: boolean;
}

// Test network connectivity (simplified implementation)
const testNetworkConnectivity = async (): Promise<boolean> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    await fetch('/api/health', {
      method: 'GET',
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    return true;
  } catch (error) {
    console.warn('Network connectivity test failed:', error);
    return false;
  }
};

export default function ModelsPage() {
  const [models, setModels] = useState<Model[]>([]);
  const [filteredModels, setFilteredModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedArchitecture, setSelectedArchitecture] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isConnected, setIsConnected] = useState(true);
  const [downloadingModels, setDownloadingModels] = useState<Set<string>>(new Set());

  // Fetch models data
  const fetchModels = async () => {
    try {
      setLoading(true);
      setError(null);

      // Test network connectivity first
      const isNetworkAvailable = await testNetworkConnectivity();
      setIsConnected(isNetworkAvailable);

      if (!isNetworkAvailable) {
        throw new Error('Network connection failed. Please check your connection.');
      }

      console.log('Fetching models data...');
      const response = await modelsAPI.getAllModels({ limit: 1000 });
      console.log('Models API response:', response);

      if (response.success && response.data?.models) {
        setModels(response.data.models);
        setFilteredModels(response.data.models);
        console.log('Successfully loaded models:', response.data.models.length);
      } else {
        throw new Error(response.message || 'Failed to load models data');
      }
    } catch (err) {
      console.error('Failed to fetch models:', err);
      setError(err instanceof Error ? err.message : 'Failed to load models data');
      setIsConnected(false);
    } finally {
      setLoading(false);
    }
  };

  // Handle download for code and redirect for checkpoint
  const handleDownload = async (modelId: number, type: 'code' | 'checkpoint', modelName: string) => {
    const downloadKey = `${modelId}-${type}`;
    
    try {
      setDownloadingModels(prev => new Set(prev).add(downloadKey));
      
      if (type === 'code') {
        await modelsAPI.downloadModelCode(modelId.toString(), modelName);
        console.log(`Code downloaded successfully for model: ${modelName}`);
      } else {
        // For checkpoint, redirect to the checkpoint_path URL
        const model = models.find(m => m.id === modelId);
        if (model?.checkpoint_path) {
          window.open(model.checkpoint_path, '_blank');
          console.log(`Redirected to checkpoint URL for model: ${modelName}`);
        } else {
          throw new Error('Checkpoint URL not available');
        }
      }
      
    } catch (error) {
      console.error(`${type === 'code' ? 'Download' : 'Redirect'} ${type} failed:`, error);
      alert(`Failed to ${type === 'code' ? 'download code' : 'access checkpoint'} file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setDownloadingModels(prev => {
        const newSet = new Set(prev);
        newSet.delete(downloadKey);
        return newSet;
      });
    }
  };

  useEffect(() => {
    fetchModels();
  }, []);

  // Filter models based on search and architecture
  useEffect(() => {
    let filtered = models;

    if (searchTerm) {
      filtered = filtered.filter(model =>
        model.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (model.architecture && model.architecture.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (selectedArchitecture !== 'all') {
      filtered = filtered.filter(model => model.architecture === selectedArchitecture);
    }

    setFilteredModels(filtered);
  }, [models, searchTerm, selectedArchitecture]);

  // Get unique architectures
  const getArchitectures = () => {
    const architectures = [...new Set(models.map(model => model.architecture).filter(Boolean))];
    return architectures.sort();
  };

  // Format date
  const formatDate = (dateString: string) => {
    if (!dateString) return 'Unknown Date';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'Invalid Date';
    }
  };

  // Get color for architecture badge
  const getArchitectureColor = (architecture: string) => {
    // Handle null, undefined, or empty architecture
    if (!architecture || architecture === 'null' || architecture.trim() === '') {
      return 'bg-gray-100 text-gray-800';
    }
    
    const colors = [
      'bg-blue-100 text-blue-800',
      'bg-green-100 text-green-800',
      'bg-purple-100 text-purple-800',
      'bg-red-100 text-red-800',
      'bg-yellow-100 text-yellow-800',
      'bg-indigo-100 text-indigo-800',
      'bg-pink-100 text-pink-800',
      'bg-gray-100 text-gray-800'
    ];
    
    let hash = 0;
    for (let i = 0; i < architecture.length; i++) {
      hash = ((hash << 5) - hash + architecture.charCodeAt(i)) & 0xffffffff;
    }
    
    return colors[Math.abs(hash) % colors.length];
  };

  // Render grid view
  const renderGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredModels.map((model, index) => (
        <Card 
          key={model.id} 
          className="group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-0 shadow-md bg-gradient-to-br from-white to-gray-50"
          style={{
            animationName: 'fadeInUp',
            animationDuration: '0.6s',
            animationTimingFunction: 'ease-out',
            animationFillMode: 'forwards',
            animationDelay: `${index * 100}ms`
          }}
        >
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg text-white">
                  <Brain className="w-5 h-5" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {model.name}
                  </CardTitle>
                  <CardDescription className="text-sm text-gray-500">
                    Model #{model.id}
                  </CardDescription>
                </div>
              </div>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-blue-100">
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div>
              <Badge className={`${getArchitectureColor(model.architecture)} font-medium`}>
                <GitBranch className="w-3 h-3 mr-1" />
                {model.architecture || 'Unknown Architecture'}
              </Badge>
            </div>
            
            <div className="space-y-4">
              {/* Download Buttons Section */}
              <div className="grid grid-cols-1 gap-3">
                {/* Code Download */}
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                  <div className="flex items-center space-x-2">
                    <Code className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">Source Code</span>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDownload(model.id, 'code', model.name)}
                    disabled={downloadingModels.has(`${model.id}-code`) || !model.code_path}
                    className="h-7 px-3 text-xs border-blue-300 text-blue-700 hover:bg-blue-200"
                  >
                    {downloadingModels.has(`${model.id}-code`) ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <>
                        <Download className="w-3 h-3 mr-1" />
                        Download
                      </>
                    )}
                  </Button>
                </div>

                {/* Checkpoint Download */}
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border border-green-200">
                  <div className="flex items-center space-x-2">
                    <Database className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-green-800">Model Weights</span>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDownload(model.id, 'checkpoint', model.name)}
                    disabled={downloadingModels.has(`${model.id}-checkpoint`) || !model.checkpoint_path}
                    className="h-7 px-3 text-xs border-green-300 text-green-700 hover:bg-green-200"
                  >
                    {downloadingModels.has(`${model.id}-checkpoint`) ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <>
                        <ExternalLink className="w-3 h-3 mr-1" />
                        Download
                      </>
                    )}
                  </Button>
                </div>
              </div>
              

            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  // Render list view
  const renderListView = () => (
    <div className="space-y-4">
      {filteredModels.map((model, index) => (
        <Card 
          key={model.id} 
          className="group hover:shadow-lg transition-all duration-300 border-0 shadow-sm"
          style={{
            animationName: 'fadeInRight',
            animationDuration: '0.5s',
            animationTimingFunction: 'ease-out',
            animationFillMode: 'forwards',
            animationDelay: `${index * 50}ms`
          }}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 flex-1">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl text-white">
                  <Brain className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {model.name}
                  </h3>
                  <div className="flex items-center space-x-4 mt-2">
                    <Badge className={`${getArchitectureColor(model.architecture)} font-medium`}>
                      <GitBranch className="w-3 h-3 mr-1" />
                      {model.architecture || 'Unknown Architecture'}
                    </Badge>

                    <span className="text-sm text-gray-500">Model #{model.id}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-gray-100">
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            {/* Download Section for List View */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-100">
              {/* Code Download */}
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                <div className="flex items-center space-x-3">
                  <Code className="w-5 h-5 text-blue-600" />
                  <div>
                    <span className="font-medium text-blue-800 block">Source Code</span>
                    <span className="text-xs text-blue-600">
                      {model.code_path ? 'Available for download' : 'Not available'}
                    </span>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDownload(model.id, 'code', model.name)}
                  disabled={downloadingModels.has(`${model.id}-code`) || !model.code_path}
                  className="border-blue-300 text-blue-700 hover:bg-blue-200"
                >
                  {downloadingModels.has(`${model.id}-code`) ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-1" />
                      Download
                    </>
                  )}
                </Button>
              </div>
              
              {/* Checkpoint Download */}
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border border-green-200">
                <div className="flex items-center space-x-3">
                  <Database className="w-5 h-5 text-green-600" />
                  <div>
                    <span className="font-medium text-green-800 block">Model Weights</span>
                    <span className="text-xs text-green-600">
                      {model.checkpoint_path ? 'Available for download' : 'Not available'}
                    </span>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDownload(model.id, 'checkpoint', model.name)}
                  disabled={downloadingModels.has(`${model.id}-checkpoint`) || !model.checkpoint_path}
                  className="border-green-300 text-green-700 hover:bg-green-200"
                >
                  {downloadingModels.has(`${model.id}-checkpoint`) ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                                          <>
                        <ExternalLink className="w-4 h-4 mr-1" />
                        Download
                      </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Brain className="w-6 h-6 text-blue-600 animate-pulse" />
            </div>
          </div>
          <p className="text-gray-600 font-medium">Loading models data...</p>
          <div className="flex space-x-1 justify-center">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-red-50 flex items-center justify-center">
        <div className="text-center space-y-6 max-w-md">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Loading Failed</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button 
            onClick={fetchModels} 
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-8 py-3 rounded-lg transition-all duration-300 transform hover:scale-105"
          >
            <Activity className="w-4 h-4 mr-2" />
            Retry Loading
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-4 bg-gradient-to-r from-blue-500 via-purple-600 to-pink-500 rounded-full text-white mb-6 shadow-xl">
            <Brain className="w-10 h-10" />
          </div>
          <h1 className="text-6xl font-bold text-gray-900 mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Model Repository
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Explore and manage AI models in the ABNovoBench framework
          </p>
        </div>



        {/* Search and Filter Controls */}
        <Card className="mb-8 border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <Search className="w-6 h-6 text-blue-600" />
              Search and Filter
            </CardTitle>
            <CardDescription>
              Find models by name, architecture, or other attributes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Models
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search by name or architecture..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 border-gray-200 focus:border-blue-400 focus:ring-blue-400"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Architecture Filter
                </label>
                <Select value={selectedArchitecture} onValueChange={setSelectedArchitecture}>
                  <SelectTrigger className="border-gray-200 focus:border-blue-400 focus:ring-blue-400">
                    <SelectValue placeholder="Select architecture" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Architectures</SelectItem>
                    {getArchitectures().map((arch) => (
                      <SelectItem key={arch} value={arch}>{arch}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  View Mode
                </label>
                <div className="flex space-x-2">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="flex-1"
                  >
                    <Grid className="w-4 h-4 mr-2" />
                    Grid
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="flex-1"
                  >
                    <List className="w-4 h-4 mr-2" />
                    List
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Models Display */}
        <div className="space-y-6">
          {filteredModels.length === 0 ? (
            <Card className="text-center py-16 border-0 shadow-xl bg-gradient-to-br from-white to-gray-50">
              <CardContent>
                <div className="text-gray-400 text-6xl mb-4">🤖</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Models Found</h3>
                <p className="text-gray-600">Try adjusting your search or filter criteria</p>
              </CardContent>
            </Card>
          ) : (
            viewMode === 'grid' ? renderGridView() : renderListView()
          )}
        </div>
      </div>

      {/* Add animations */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeInRight {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
} 