'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { assemblyAPI } from '@/services/api';

interface AssemblyTablesProps {
  selectedModels?: string[];
  selectedIndicator?: string;
}

// 数据类型定义
interface AssemblyRecord {
  Algorithm?: string;
  Antibody?: string;
  Tool?: string;
  Score?: string;
  Region?: string;
  Chain?: string;
  Coverage?: string;
  Accuracy?: string;
  Insertion?: string;
  Gap?: string;
  algorithm?: string;
  metric?: string;
  antibody?: string;
  value?: string;
}

interface PaginationData {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export default function AssemblyTables({ selectedModels = [], selectedIndicator = 'assembly_scores' }: AssemblyTablesProps) {
  const [selectedDataset, setSelectedDataset] = useState<'scores' | 'stats' | 'alps'>('scores');
  const [records, setRecords] = useState<AssemblyRecord[]>([]);
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 获取数据
  const fetchData = async (dataset: 'scores' | 'stats' | 'alps', page: number = 1) => {
    setLoading(true);
    setError(null);
    
    try {
      let response;
      switch (dataset) {
        case 'scores':
          response = await assemblyAPI.getScores(page, pagination.limit);
          break;
        case 'stats':
          response = await assemblyAPI.getStats(page, pagination.limit);
          break;
        case 'alps':
          response = await assemblyAPI.getAlps(page, pagination.limit);
          break;
      }

      if (response.success) {
        setRecords(response.data.records);
        setPagination(response.data.pagination);
      } else {
        setError(response.message || 'Failed to fetch data');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // 根据selectedIndicator设置selectedDataset
  useEffect(() => {
    if (selectedIndicator === 'assembly_scores') {
      setSelectedDataset('scores');
    } else if (selectedIndicator === 'assembly_stats') {
      setSelectedDataset('stats');
    } else if (selectedIndicator === 'assembly_alps') {
      setSelectedDataset('alps');
    }
  }, [selectedIndicator]);

  // 初始加载
  useEffect(() => {
    fetchData(selectedDataset, 1);
  }, [selectedDataset]);

  // 分页处理
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchData(selectedDataset, newPage);
    }
  };



  // 获取算法Badge样式
  const getAlgorithmBadge = (algorithm: string) => {
    const colors = {
      'CasanovoV1': 'bg-purple-50 text-purple-700 border-purple-200',
      'CasanovoV2': 'bg-indigo-50 text-indigo-700 border-indigo-200',
      'ContraNovo': 'bg-orange-50 text-orange-700 border-orange-200',
      'InstaNovo': 'bg-teal-50 text-teal-700 border-teal-200',
      'PGPointNovo': 'bg-pink-50 text-pink-700 border-pink-200',
      'PointNovo': 'bg-cyan-50 text-cyan-700 border-cyan-200',
      'pi-HelixNovo': 'bg-emerald-50 text-emerald-700 border-emerald-200',
      'pi-PrimeNovo': 'bg-amber-50 text-amber-700 border-amber-200'
    };
    const colorClass = colors[algorithm as keyof typeof colors] || 'bg-gray-50 text-gray-700 border-gray-200';
    return <Badge variant="outline" className={colorClass}>{algorithm}</Badge>;
  };

  // 获取工具Badge样式
  const getToolBadge = (tool: string) => {
    switch (tool) {
      case 'Fusion':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">{tool}</Badge>;
      case 'Stitch':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">{tool}</Badge>;
      default:
        return <Badge variant="outline">{tool}</Badge>;
    }
  };

  // 渲染表格内容
  const renderTable = () => {
    if (selectedDataset === 'scores') {
      return (
        <table className="w-full border-collapse bg-white">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="border border-gray-200 px-4 py-3 text-left font-semibold text-gray-700">Algorithm</th>
              <th className="border border-gray-200 px-4 py-3 text-left font-semibold text-gray-700">Antibody</th>
              <th className="border border-gray-200 px-4 py-3 text-left font-semibold text-gray-700">Tool</th>
              <th className="border border-gray-200 px-4 py-3 text-left font-semibold text-gray-700">Score</th>
              <th className="border border-gray-200 px-4 py-3 text-left font-semibold text-gray-700">Region</th>
            </tr>
          </thead>
          <tbody>
            {records.map((record, index) => (
              <tr key={index} className="hover:bg-gray-50 transition-colors">
                <td className="border border-gray-200 px-4 py-3">
                  {record.Algorithm && getAlgorithmBadge(record.Algorithm)}
                </td>
                <td className="border border-gray-200 px-4 py-3 font-medium text-gray-900">{record.Antibody}</td>
                <td className="border border-gray-200 px-4 py-3">
                  {record.Tool && getToolBadge(record.Tool)}
                </td>
                <td className="border border-gray-200 px-4 py-3 font-mono text-gray-700">{record.Score}</td>
                <td className="border border-gray-200 px-4 py-3 text-gray-700">{record.Region}</td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    }

    if (selectedDataset === 'stats') {
      return (
        <table className="w-full border-collapse bg-white">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="border border-gray-200 px-4 py-3 text-left font-semibold text-gray-700">Algorithm</th>
              <th className="border border-gray-200 px-4 py-3 text-left font-semibold text-gray-700">Antibody</th>
              <th className="border border-gray-200 px-4 py-3 text-left font-semibold text-gray-700">Tool</th>
              <th className="border border-gray-200 px-4 py-3 text-left font-semibold text-gray-700">Chain</th>
              <th className="border border-gray-200 px-4 py-3 text-left font-semibold text-gray-700">Region</th>
              <th className="border border-gray-200 px-4 py-3 text-left font-semibold text-gray-700">Coverage</th>
              <th className="border border-gray-200 px-4 py-3 text-left font-semibold text-gray-700">Accuracy</th>
              <th className="border border-gray-200 px-4 py-3 text-left font-semibold text-gray-700">Insertion</th>
              <th className="border border-gray-200 px-4 py-3 text-left font-semibold text-gray-700">Gap</th>
            </tr>
          </thead>
          <tbody>
            {records.map((record, index) => (
              <tr key={index} className="hover:bg-gray-50 transition-colors">
                <td className="border border-gray-200 px-4 py-3">
                  {record.Algorithm && getAlgorithmBadge(record.Algorithm)}
                </td>
                <td className="border border-gray-200 px-4 py-3 font-medium text-gray-900">{record.Antibody}</td>
                <td className="border border-gray-200 px-4 py-3">
                  {record.Tool && getToolBadge(record.Tool)}
                </td>
                <td className="border border-gray-200 px-4 py-3 text-gray-700">{record.Chain}</td>
                <td className="border border-gray-200 px-4 py-3 text-gray-700">{record.Region}</td>
                <td className="border border-gray-200 px-4 py-3 font-mono text-gray-700">{record.Coverage}</td>
                <td className="border border-gray-200 px-4 py-3 font-mono text-gray-700">{record.Accuracy}</td>
                <td className="border border-gray-200 px-4 py-3 font-mono text-gray-700">{record.Insertion}</td>
                <td className="border border-gray-200 px-4 py-3 font-mono text-gray-700">{record.Gap}</td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    }

    if (selectedDataset === 'alps') {
      return (
        <table className="w-full border-collapse bg-white">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="border border-gray-200 px-4 py-3 text-left font-semibold text-gray-700">Algorithm</th>
              <th className="border border-gray-200 px-4 py-3 text-left font-semibold text-gray-700">Metric</th>
              <th className="border border-gray-200 px-4 py-3 text-left font-semibold text-gray-700">Antibody</th>
              <th className="border border-gray-200 px-4 py-3 text-left font-semibold text-gray-700">Value</th>
            </tr>
          </thead>
          <tbody>
            {records.map((record, index) => (
              <tr key={index} className="hover:bg-gray-50 transition-colors">
                <td className="border border-gray-200 px-4 py-3">
                  {record.algorithm && getAlgorithmBadge(record.algorithm)}
                </td>
                <td className="border border-gray-200 px-4 py-3 text-gray-700">{record.metric}</td>
                <td className="border border-gray-200 px-4 py-3 font-medium text-gray-900">{record.antibody}</td>
                <td className="border border-gray-200 px-4 py-3 font-mono text-gray-700">{record.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* 错误显示 */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* 表格 */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-gray-500">Loading...</div>
              </div>
            ) : records.length > 0 ? (
              renderTable()
            ) : (
              <div className="flex items-center justify-center h-64">
                <div className="text-gray-500">No data available</div>
              </div>
            )}
          </div>

          {/* 分页控制 */}
          {pagination.totalPages > 1 && (
            <div className="border-t border-gray-200 px-4 py-3 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Page {pagination.page} of {pagination.totalPages} ({pagination.total} total records)
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={!pagination.hasPrev || loading}
                    className="gap-1"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </Button>
                  
                  <div className="flex items-center gap-1">
                    {/* 显示页码 */}
                    {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                      let pageNum;
                      if (pagination.totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (pagination.page <= 3) {
                        pageNum = i + 1;
                      } else if (pagination.page >= pagination.totalPages - 2) {
                        pageNum = pagination.totalPages - 4 + i;
                      } else {
                        pageNum = pagination.page - 2 + i;
                      }
                      
                      return (
                        <Button
                          key={pageNum}
                          variant={pageNum === pagination.page ? "default" : "outline"}
                          size="sm"
                          onClick={() => handlePageChange(pageNum)}
                          disabled={loading}
                          className="w-8 h-8 p-0"
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={!pagination.hasNext || loading}
                    className="gap-1"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}