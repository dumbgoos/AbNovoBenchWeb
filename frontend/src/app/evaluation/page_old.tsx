'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Database } from 'lucide-react';
import AssemblyTables from '@/components/assembly/AssemblyTables';
// 删除了recharts imports - 只保留Assembly表格功能

// Interfaces
interface ModelMetrics {
  id: string;
  name: string;
  category: string;
  aa_precision: number;
  aa_recall: number;
  peptide_precision: number;
  peptide_recall: number;
  ptm_precision: number;
  ptm_recall: number;
  auc: number;
  status: 'active' | 'inactive';
}

interface ModelErrorTypes {
  id: string;
  name: string;
  category: string;
  inversion_first_3_aas_percent: number;
  inversion_last_3_aas_percent: number;
  inversion_first_and_last_3_aas_percent: number;
  aa_1_replaced_by_1_or_2_percent: number;
  aa_2_replaced_by_2_percent: number;
  more_than_6_aas_wrong_percent: number;
  other_percent: number;
  number_of_total_errors: number;
  number_of_total_predictions: number;
  status: 'active' | 'inactive';
}

interface DepthData {
  antibody: string;
  chain: string;
  positions: number[];
  regions: string[];
  regionBoundaries: Array<{
    region: string;
    start: number;
    end: number;
    type: string;
  }>;
  models: Record<string, number[]>;
  filename: string;
}

interface RobustnessData {
  noise_factor?: number;
  missing_cleavages?: number;
  peptide_length?: number;
  peptide_recall: number;
  aa_recall: number;
  aa_precision?: number;
  total_peptides?: number;
  correct_predictions?: number;
  incorrect_predictions?: number;
  peptides_no_missing_cleavages?: number;
}

interface RobustnessIndicator {
  key: string;
  name: string;
  description: string;
  type: 'heatmap' | 'line';
  xAxis?: string;
  yAxis?: string;
}

interface RobustnessIndicatorData {
  indicator: RobustnessIndicator;
  data: Record<string, RobustnessData[]>;
}

interface EvaluationData {
  models: ModelMetrics[];
  errorTypes: ModelErrorTypes[];
  depthData: DepthData[];
  robustnessData: Record<string, RobustnessIndicatorData>;
  robustnessIndicators: RobustnessIndicator[];
  datasets: string[];
  metrics: string[];
  last_updated: string;
}

export default function EvaluationPage() {
  const [data, setData] = useState<EvaluationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMetricType, setSelectedMetricType] = useState('accuracy');
  const [selectedMetric, setSelectedMetric] = useState('aa_precision');
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('radar');
  const [minScore, setMinScore] = useState([0]);
  const [selectedAntibody, setSelectedAntibody] = useState('mAb1');
  const [selectedChain, setSelectedChain] = useState('Heavy Chain');
  const [selectedTool, setSelectedTool] = useState('');
  const [selectedIndicator, setSelectedIndicator] = useState('noise_and_cleavages');

  // Fetch evaluation data
  const fetchEvaluationData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [evaluationResponse, errorTypesResponse, depthResponse, robustnessResponse, indicatorsResponse] = await Promise.all([
        fetch('/api/evaluation/models'),
        fetch('/api/metrics/error-types'),
        fetch('/api/depth'),
        fetch('/api/robustness'),
        fetch('/api/robustness/indicators')
      ]);

      if (!evaluationResponse.ok) {
        throw new Error(`HTTP error! status: ${evaluationResponse.status}`);
      }

      const evaluationResult = await evaluationResponse.json();
      
      if (evaluationResult.error) {
        throw new Error(evaluationResult.message || 'Backend API error');
      }

      let errorTypesData: ModelErrorTypes[] = [];
      if (errorTypesResponse.ok) {
        const errorTypesResult = await errorTypesResponse.json();
        if (errorTypesResult.success && errorTypesResult.data?.metrics) {
          // 转换后端数据格式为前端需要的格式
          errorTypesData = errorTypesResult.data.metrics.map((item: any) => ({
            id: item.model_id.toString(),
            name: item.model_name || `Model ${item.model_id}`,
            category: item.architecture || 'N/A',
            inversion_first_3_aas_percent: parseFloat(item.inversion_first_3_aas_percent) || 0,
            inversion_last_3_aas_percent: parseFloat(item.inversion_last_3_aas_percent) || 0,
            inversion_first_and_last_3_aas_percent: parseFloat(item.inversion_first_and_last_3_aas_percent) || 0,
            aa_1_replaced_by_1_or_2_percent: parseFloat(item.aa_1_replaced_by_1_or_2_percent) || 0,
            aa_2_replaced_by_2_percent: parseFloat(item.aa_2_replaced_by_2_percent) || 0,
            more_than_6_aas_wrong_percent: parseFloat(item.more_than_6_aas_wrong_percent) || 0,
            other_percent: parseFloat(item.other_percent) || 0,
            number_of_total_errors: item.number_of_total_errors || 0,
            number_of_total_predictions: item.number_of_total_predictions || 0,
            status: 'active' as const
          }));
        }
      }

      let depthData: DepthData[] = [];
      if (depthResponse.ok) {
        const depthResult = await depthResponse.json();
        if (depthResult.success && depthResult.data?.datasets) {
          depthData = depthResult.data.datasets;
        }
      }

      let robustnessData: Record<string, RobustnessIndicatorData> = {};
      let robustnessIndicators: RobustnessIndicator[] = [];
      
      if (robustnessResponse.ok && indicatorsResponse.ok) {
        const [robustnessResult, indicatorsResult] = await Promise.all([
          robustnessResponse.json(),
          indicatorsResponse.json()
        ]);
        
        if (robustnessResult.success && robustnessResult.data?.indicators) {
          robustnessData = robustnessResult.data.indicators;
        }
        
        if (indicatorsResult.success && indicatorsResult.data?.indicators) {
          robustnessIndicators = indicatorsResult.data.indicators;
        }
      }
      
      const combinedData: EvaluationData = {
        models: evaluationResult.models || [],
        datasets: evaluationResult.datasets || [],
        metrics: evaluationResult.metrics || [],
        last_updated: evaluationResult.last_updated || new Date().toISOString(),
        errorTypes: errorTypesData,
        depthData: depthData,
        robustnessData: robustnessData,
        robustnessIndicators: robustnessIndicators
      };

      setData(combinedData);
      
      // 默认选择所有模型（accuracy模式下全选，其他模式选择前3个）
      if (combinedData.models.length > 0) {
        if (selectedMetricType === 'accuracy') {
          // Accuracy模式下默认全选
          setSelectedModels(combinedData.models.map(m => m.id));
        } else {
          // 其他模式选择前3个
          const firstThreeModels = combinedData.models.slice(0, 3).map(m => m.id);
          setSelectedModels(firstThreeModels);
        }
      }

      setData(combinedData);
      
      // 确保selectedMetric和selectedTool存在于robustness数据中
      if (combinedData.robustnessData && Object.keys(combinedData.robustnessData).length > 0) {
        // 设置默认工具选择
        const noiseAndCleavagesData = combinedData.robustnessData['noise_and_cleavages'];
        if (noiseAndCleavagesData && noiseAndCleavagesData.data) {
          const availableTools = Object.keys(noiseAndCleavagesData.data);
          if (availableTools.length > 0 && !selectedTool) {
            setSelectedTool(availableTools[0]);
          }
        }
        
        // 设置默认indicator（当选择robustness指标时）
        if (selectedMetricType === 'robustness' && selectedMetric) {
          const currentIndicatorData = combinedData.robustnessData[selectedMetric];
          if (currentIndicatorData && currentIndicatorData.data) {
            const availableTools = Object.keys(currentIndicatorData.data);
            if (!selectedTool || !availableTools.includes(selectedTool)) {
              setSelectedTool(availableTools[0] || '');
            }
          }
        }
      }
    } catch (err) {
      console.error('Failed to fetch evaluation data:', err);
      setError(
        err instanceof Error 
          ? `Failed to load evaluation data: ${err.message}` 
          : 'Failed to load evaluation data. Please check if the backend server is running.'
      );
      
      setData({
        models: [],
        errorTypes: [],
        depthData: [],
        robustnessData: {},
        robustnessIndicators: [],
        datasets: [],
        metrics: ['aa_precision', 'aa_recall', 'peptide_precision', 'peptide_recall', 'ptm_precision', 'ptm_recall', 'auc'],
        last_updated: new Date().toISOString()
      });
      setSelectedModels([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvaluationData();
  }, []);

  // Color mapping
  const getModelColor = (index: number) => {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#FFB6C1', '#20B2AA'];
    return colors[index % colors.length];
  };

  // Prepare coverage depth data
  const prepareCoverageDepthData = () => {
    if (!data || selectedMetricType !== 'coverage_depth' || !data.depthData) {
      return null;
    }
    
    const currentDataset = data.depthData.find(d => 
      d.antibody === selectedAntibody && d.chain === selectedChain
    );
    
    if (!currentDataset) return null;
    
    const colors = [
      '#1f77b4','#aec7e8','#ff7f0e','#ffbb78',
      '#2ca02c','#98df8a','#d62728','#ff9896',
      '#9467bd','#c5b0d5','#8c564b','#c49c94','#e377c2'
    ];
    
    const lineData = currentDataset.positions.map((pos, index) => {
      const dataPoint: any = { position: pos };
      Object.keys(currentDataset.models).forEach((modelName) => {
        dataPoint[modelName] = currentDataset.models[modelName][index] || 0;
      });
      return dataPoint;
    });
    
    return {
      lineData,
      models: Object.keys(currentDataset.models),
      colors,
      regionBoundaries: currentDataset.regionBoundaries || []
    };
  };

  // Prepare robustness visualization data
  const prepareRobustnessData = () => {
    if (!data || selectedMetricType !== 'robustness' || !data.robustnessData || !selectedMetric) {
      return null;
    }
    
    const indicatorData = data.robustnessData[selectedMetric];
    if (!indicatorData || !indicatorData.data) {
      return null;
    }
    
    const indicator = indicatorData.indicator;
    
    // Handle different indicator types
    if (indicator.type === 'heatmap') {
      if (indicator.xAxis === 'noise_factor' && indicator.yAxis === 'missing_cleavages') {
        // 2D heatmap for noise factor vs missing cleavages (original)
        if (!selectedTool || !indicatorData.data[selectedTool]) {
          return null;
        }
        
        const toolData = indicatorData.data[selectedTool];
        const noiseFactors = Array.from(new Set(toolData.map(d => d.noise_factor).filter(x => x !== undefined))).sort((a, b) => a - b);
        const missingCleavages = Array.from(new Set(toolData.map(d => d.missing_cleavages).filter(x => x !== undefined))).sort((a, b) => a - b);
        
        const heatmapData = [];
        
        for (const mc of missingCleavages) {
          const row: any = { missing_cleavages: mc };
          for (const nf of noiseFactors) {
            const dataPoint = toolData.find(d => d.noise_factor === nf && d.missing_cleavages === mc);
            const noiseLabel = `${nf-1}-${nf+1}`;
            row[noiseLabel] = dataPoint ? dataPoint.peptide_recall : 0;
          }
          heatmapData.push(row);
        }
        
        return {
          type: 'heatmap',
          heatmapData,
          noiseFactors,
          missingCleavages,
          toolColor: getToolColor(selectedTool),
          maxValue: Math.max(...toolData.map(d => d.peptide_recall)),
          indicator
        };
      }
    } else if (indicator.type === 'line') {
      // Multi-tool line chart
      const xAxisField = indicator.xAxis as keyof RobustnessData;
      const allTools = Object.keys(indicatorData.data);
      const allDataPoints = Object.values(indicatorData.data).flat();
      const xValues = Array.from(new Set(allDataPoints.map(d => d[xAxisField] as number).filter(x => x !== undefined))).sort((a, b) => a - b);
      
      const lineData = [];
      
      for (const xVal of xValues) {
        const dataPoint: any = { [`${xAxisField}`]: xVal };
        
        for (const tool of allTools) {
          const toolSpecificData = indicatorData.data[tool];
          const point = toolSpecificData.find(d => d[xAxisField] === xVal);
          dataPoint[tool] = point ? point.peptide_recall * 100 : 0; // 转为百分比，只显示Peptide Recall
        }
        lineData.push(dataPoint);
      }
      
      return {
        type: 'multi_tool_line',
        lineData,
        tools: allTools,
        xAxisField,
        maxValue: Math.max(...allDataPoints.map(d => d.peptide_recall * 100)),
        indicator
      };
    }
    
    return null;
  };

  // Get tool color helper function
  const getToolColor = (toolName: string): string => {
    const toolColors: Record<string, string> = {
      "AdaNovo": "#CCEBC5", "CasanovoV1": "#B2DF8A", "CasanovoV2": "#33A02C", 
      "ContraNovo": "#B3CDE3", "DeepNovo": "#377EB8", "InstaNovo": "#313695",
      "PepNet": "#984EA3", "PGPointNovo": "#CAB2D6", "pi-HelixNovo": "#F781BF", 
      "pi-PrimeNovo": "#E41A1C", "pNovo3": "#FF7F00", "PointNovo": "#FDBF6F", 
      "SMSNet": "#A65628"
    };
    
    return toolColors[toolName] || "#984EA3";
  };

  // Prepare radar chart data
  const prepareRadarData = () => {
    if (!data) return [];
    
    if (selectedMetricType === 'accuracy') {
      const filteredModels = data.models.filter(model => 
        selectedModels.includes(model.id) && 
        (model[selectedMetric as keyof ModelMetrics] as number) >= minScore[0]
      );
      
      return filteredModels.map(model => ({
        model: model.name,
        value: model[selectedMetric as keyof ModelMetrics] as number,
        fullMark: 1.0,
        category: model.category
      }));
    } else {
      const filteredModels = data.errorTypes.filter(model => 
        selectedModels.includes(model.id) && 
        (model[selectedMetric as keyof ModelErrorTypes] as number) >= minScore[0]
      );
      
      return filteredModels.map(model => ({
        model: model.name,
        value: model[selectedMetric as keyof ModelErrorTypes] as number,
        fullMark: 100,
        category: model.category
      }));
    }
  };

  // Prepare bar chart data
  const prepareBarChartData = () => {
    if (!data) return [];
    
    if (selectedMetricType === 'accuracy') {
      const selectedModelsData = data.models.filter(model => selectedModels.includes(model.id));
      
      return selectedModelsData.map((model, index) => ({
        name: model.name,
        aa_precision: model.aa_precision * 100,
        aa_recall: model.aa_recall * 100,
        peptide_precision: model.peptide_precision * 100,
        peptide_recall: model.peptide_recall * 100,
        ptm_precision: model.ptm_precision * 100,
        ptm_recall: model.ptm_recall * 100,
        auc: model.auc * 100,
        color: getModelColor(index)
      }));
    } else {
      const selectedModelsData = data.errorTypes.filter(model => selectedModels.includes(model.id));
      
      return selectedModelsData.map((model, index) => ({
        name: model.name,
        inversion_first_3: model.inversion_first_3_aas_percent,
        inversion_last_3: model.inversion_last_3_aas_percent,
        inversion_both: model.inversion_first_and_last_3_aas_percent,
        aa_1_replaced: model.aa_1_replaced_by_1_or_2_percent,
        aa_2_replaced: model.aa_2_replaced_by_2_percent,
        more_than_6_wrong: model.more_than_6_aas_wrong_percent,
        other_errors: model.other_percent,
        color: getModelColor(index)
      }));
    }
    
    return [];
  };

  const handleModelToggle = (modelId: string) => {
    setSelectedModels(prev => 
      prev.includes(modelId) 
        ? prev.filter(id => id !== modelId)
        : [...prev, modelId]
    );
  };



  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-xl text-gray-600">Loading Evaluation Data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={fetchEvaluationData} variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const coverageDepthData = prepareCoverageDepthData();
  const robustnessData = prepareRobustnessData();
  const radarData = prepareRadarData();
  const barChartData = prepareBarChartData();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute top-40 left-1/2 w-80 h-80 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-6 shadow-lg">
            <Target className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent mb-6">
            Model Performance Evaluation
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed text-center">
            Comprehensive analysis and comparison of de novo sequencing tools 
            <br />
            for monoclonal antibody with <span className="font-semibold text-blue-600">advanced visualization</span> and 
            <span className="font-semibold text-purple-600"> real-time insights</span>
          </p>
        </div>

        {/* Controls */}
        <Card className="mb-8 bg-white/80 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-t-lg">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Settings className="w-4 h-4 text-white" />
              </div>
              Evaluation Settings
            </CardTitle>
            <CardDescription className="text-gray-600">
              Customize your analysis parameters and visualization preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {/* Metric Type Selection */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  📋 Metric Type
                </label>
                <Select value={selectedMetricType} onValueChange={(value) => {
                  setSelectedMetricType(value);
                  if (value === 'accuracy') {
                    setSelectedMetric('aa_precision');
                  } else if (value === 'error_types') {
                    setSelectedMetric('inversion_first_3_aas_percent');
                  } else if (value === 'coverage_depth') {
                    setSelectedMetric('coverage_depth');
                  } else if (value === 'robustness') {
                    setSelectedMetric('noise_and_cleavages');
                    // 设置默认工具选择
                    if (data?.robustnessData?.['noise_and_cleavages']?.data) {
                      const availableTools = Object.keys(data.robustnessData['noise_and_cleavages'].data);
                      if (availableTools.length > 0) {
                        setSelectedTool(availableTools[0]);
                      }
                    }
                  }
                }}>
                  <SelectTrigger className="h-12 border-2 border-gray-200 focus:border-blue-500 transition-all duration-200 hover:border-gray-300">
                    <SelectValue placeholder="Choose metric type" />
                  </SelectTrigger>
                  <SelectContent className="bg-white/95 backdrop-blur-sm">
                    <SelectItem value="accuracy" className="hover:bg-blue-50">
                      ✅ Accuracy Metrics
                    </SelectItem>
                    <SelectItem value="error_types" className="hover:bg-red-50">
                      🔍 Error Analysis
                    </SelectItem>
                    <SelectItem value="coverage_depth" className="hover:bg-green-50">
                      📈 Coverage Depth
                    </SelectItem>
                    <SelectItem value="robustness" className="hover:bg-purple-50">
                      🛡️ Robustness Analysis
                    </SelectItem>
                    <SelectItem value="assembly" className="hover:bg-orange-50">
                      🧬 Assembly Metrics
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Indicator Selection */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  📊 Select Indicator
                </label>
                <Select value={selectedMetric} onValueChange={(value) => {
                  setSelectedMetric(value);
                  // 如果切换到noise_and_cleavages指标，设置默认工具
                  if (value === 'noise_and_cleavages' && data?.robustnessData?.['noise_and_cleavages']?.data) {
                    const availableTools = Object.keys(data.robustnessData['noise_and_cleavages'].data);
                    if (availableTools.length > 0) {
                      setSelectedTool(availableTools[0]);
                    }
                  }
                }}>
                  <SelectTrigger className="h-12 border-2 border-gray-200 focus:border-blue-500 transition-all duration-200 hover:border-gray-300">
                    <SelectValue placeholder="Choose indicator" />
                  </SelectTrigger>
                  <SelectContent className="bg-white/95 backdrop-blur-sm">
                    {selectedMetricType === 'accuracy' && (
                      <>
                        <SelectItem value="aa_precision">Amino Acid Precision</SelectItem>
                        <SelectItem value="aa_recall">Amino Acid Recall</SelectItem>
                        <SelectItem value="peptide_precision">Peptide Precision</SelectItem>
                        <SelectItem value="peptide_recall">Peptide Recall</SelectItem>
                        <SelectItem value="ptm_precision">PTM Precision</SelectItem>
                        <SelectItem value="ptm_recall">PTM Recall</SelectItem>
                        <SelectItem value="auc">AUC Score</SelectItem>
                      </>
                    )}
                    {selectedMetricType === 'error_types' && (
                      <>
                        <SelectItem value="inversion_first_3_aas_percent">Inversion First 3 AAs %</SelectItem>
                        <SelectItem value="inversion_last_3_aas_percent">Inversion Last 3 AAs %</SelectItem>
                        <SelectItem value="inversion_first_and_last_3_aas_percent">Inversion Both Ends %</SelectItem>
                        <SelectItem value="aa_1_replaced_by_1_or_2_percent">1 AA Replaced %</SelectItem>
                        <SelectItem value="aa_2_replaced_by_2_percent">2 AAs Replaced %</SelectItem>
                        <SelectItem value="more_than_6_aas_wrong_percent">More Than 6 AAs Wrong %</SelectItem>
                        <SelectItem value="other_percent">Other Errors %</SelectItem>
                      </>
                    )}
                    {selectedMetricType === 'coverage_depth' && (
                      <SelectItem value="coverage_depth">Coverage Depth</SelectItem>
                    )}
                    {selectedMetricType === 'robustness' && data.robustnessIndicators && data.robustnessIndicators.map(indicator => (
                      <SelectItem key={indicator.key} value={indicator.key} className="hover:bg-purple-50">
                        <div className="flex flex-col">
                          <span className="font-medium">{indicator.name}</span>
                          <span className="text-xs text-gray-500">{indicator.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Controls for different metric types */}
              {selectedMetricType === 'coverage_depth' ? (
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    🧬 Antibody
                  </label>
                  <Select value={selectedAntibody} onValueChange={setSelectedAntibody}>
                    <SelectTrigger className="h-12 border-2 border-gray-200 focus:border-blue-500 transition-all duration-200 hover:border-gray-300">
                      <SelectValue placeholder="Choose antibody" />
                    </SelectTrigger>
                    <SelectContent className="bg-white/95 backdrop-blur-sm">
                      {data.depthData && Array.from(new Set(data.depthData.map(d => d.antibody))).map(antibody => (
                        <SelectItem key={antibody} value={antibody} className="hover:bg-green-50">
                          {antibody}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : selectedMetricType === 'robustness' ? (
                <div className="space-y-3">
                  {/* Only show tool selection for heatmap type (noise_and_cleavages) */}
                  {selectedMetric === 'noise_and_cleavages' ? (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          🔧 Tool Selection
                        </label>
                        <Select value={selectedTool} onValueChange={setSelectedTool}>
                          <SelectTrigger className="h-12 border-2 border-gray-200 focus:border-blue-500 transition-all duration-200 hover:border-gray-300">
                            <SelectValue placeholder="Choose a tool for heatmap" />
                          </SelectTrigger>
                          <SelectContent className="bg-white/95 backdrop-blur-sm">
                            {data?.robustnessData[selectedMetric]?.data && Object.keys(data.robustnessData[selectedMetric].data).map(tool => (
                              <SelectItem key={tool} value={tool} className="hover:bg-purple-50">
                                {tool}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg border border-blue-200">
                      <span className="font-medium">Multi-Tool Line Chart</span>
                      <br />
                      Comparing all tools across different conditions using Peptide Recall as the metric.
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    🎯 Quality Threshold: <span className="text-blue-600 font-bold">{minScore[0].toFixed(2)}</span>
                  </label>
                  <div className="px-3">
                    <Slider
                      value={minScore}
                      onValueChange={setMinScore}
                      max={1}
                      min={0}
                      step={0.01}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-2">
                      <span>0.00</span>
                      <span>0.50</span>
                      <span>1.00</span>
                    </div>
                  </div>
                </div>
              )}

      {/* Second control for specific metric types */}
      {selectedMetricType === 'coverage_depth' && (
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            🔗 Chain Type
          </label>
          <Select value={selectedChain} onValueChange={setSelectedChain}>
            <SelectTrigger className="h-12 border-2 border-gray-200 focus:border-blue-500 transition-all duration-200 hover:border-gray-300">
              <SelectValue placeholder="Choose chain" />
            </SelectTrigger>
            <SelectContent className="bg-white/95 backdrop-blur-sm">
              {data.depthData && Array.from(new Set(data.depthData.filter(d => d.antibody === selectedAntibody).map(d => d.chain))).map(chain => (
                <SelectItem key={chain} value={chain} className="hover:bg-green-50">
                  {chain}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
            </div>
          </CardContent>
        </Card>

        {/* Coverage Depth Chart */}
        {selectedMetricType === 'coverage_depth' && coverageDepthData && (
          <Card className="mb-8 bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 group">
            <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 rounded-t-lg">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                  <TrendingUp className="w-4 h-4 text-white" />
                </div>
                Coverage Depth Analysis
                <div className="ml-auto w-3 h-3 bg-gradient-to-r from-green-400 to-blue-400 rounded-full animate-pulse"></div>
              </CardTitle>
              <CardDescription className="text-gray-600">
                {selectedAntibody} - {selectedChain} coverage depth across positions
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-green-100/50 to-blue-100/50 rounded-lg -z-10"></div>
                <ResponsiveContainer width="100%" height={500}>
                  <LineChart data={coverageDepthData.lineData} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis 
                      dataKey="position" 
                      tick={{ fontSize: 12, fill: '#374151' }}
                      label={{ value: 'Position', position: 'insideBottom', offset: -10 }}
                    />
                    <YAxis 
                      tick={{ fontSize: 12, fill: '#374151' }}
                      label={{ value: 'Depth', angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                        border: 'none', 
                        borderRadius: '8px', 
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)' 
                      }}
                      formatter={(value: number, name: string, props: any) => {
                        const position = props.payload?.position;
                        let cdrInfo = '';
                        if (coverageDepthData.regionBoundaries && position) {
                          const boundary = coverageDepthData.regionBoundaries.find(b => 
                            position >= b.start && position <= b.end
                          );
                          if (boundary) {
                            cdrInfo = ` (${boundary.region})`;
                          }
                        }
                        return [`${value}${cdrInfo}`, name];
                      }}
                      labelFormatter={(position) => `Position: ${position}`}
                    />
                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                    
                    {/* CDR区域标记线 */}
                    {coverageDepthData.regionBoundaries && coverageDepthData.regionBoundaries.map((boundary, index) => (
                      <React.Fragment key={`cdr-region-${index}`}>
                        <ReferenceLine 
                          x={boundary.start} 
                          stroke="#ef4444" 
                          strokeDasharray="5 5"
                          strokeWidth={2}
                          strokeOpacity={0.8}
                        />
                        <ReferenceLine 
                          x={boundary.end} 
                          stroke="#22c55e" 
                          strokeDasharray="5 5"
                          strokeWidth={2}
                          strokeOpacity={0.8}
                        />
                      </React.Fragment>
                    ))}
                    
                    {coverageDepthData.models.map((modelName, index) => (
                      <Line
                        key={modelName}
                        type="monotone"
                        dataKey={modelName}
                        stroke={coverageDepthData.colors[index]}
                        strokeWidth={1.2}
                        strokeOpacity={0.7}
                        dot={false}
                        name={modelName}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Robustness Visualization Chart */}
        {selectedMetricType === 'robustness' && robustnessData && (
          <Card className="mb-8 bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 group">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-t-lg">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                  🛡️
                </div>
                {robustnessData.indicator?.name || 'Robustness Analysis'} - {selectedTool}
                <div className="ml-auto w-3 h-3 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-pulse"></div>
              </CardTitle>
              <CardDescription className="text-gray-600">
                {robustnessData.indicator?.description || 'Robustness analysis visualization'}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-100/50 to-pink-100/50 rounded-lg -z-10"></div>
                
                {/* Render different chart types based on indicator type */}
                {robustnessData.type === 'heatmap' && robustnessData.heatmapData && (
                  <div className="space-y-4">
                    {/* Header with noise factor labels */}
                    <div className="grid gap-1 text-xs font-semibold text-gray-600" style={{ gridTemplateColumns: `repeat(${robustnessData.noiseFactors.length + 1}, minmax(0, 1fr))` }}>
                      <div className="text-center p-2">MC\\NF</div>
                      {robustnessData.noiseFactors.map(nf => (
                        <div key={nf} className="text-center p-2">
                          {nf-1}-{nf+1}
                        </div>
                      ))}
                    </div>
                    
                    {/* Heatmap rows */}
                    {robustnessData.heatmapData.map((row, rowIndex) => (
                      <div key={row.missing_cleavages} className="grid gap-1" style={{ gridTemplateColumns: `repeat(${robustnessData.noiseFactors.length + 1}, minmax(0, 1fr))` }}>
                        <div className="text-xs font-semibold text-gray-600 p-2 text-center">
                          {row.missing_cleavages}
                        </div>
                        {robustnessData.noiseFactors.map(nf => {
                          const noiseLabel = `${nf-1}-${nf+1}`;
                          const value = row[noiseLabel] || 0;
                          const intensity = robustnessData.maxValue > 0 ? value / robustnessData.maxValue : 0;
                          const backgroundColor = `rgba(${parseInt(robustnessData.toolColor.slice(1, 3), 16)}, ${parseInt(robustnessData.toolColor.slice(3, 5), 16)}, ${parseInt(robustnessData.toolColor.slice(5, 7), 16)}, ${0.2 + intensity * 0.8})`;
                          
                          return (
                            <div
                              key={noiseLabel}
                              className="aspect-square flex items-center justify-center text-xs font-medium border border-gray-200 rounded transition-all duration-200 hover:scale-105 hover:shadow-md cursor-pointer"
                              style={{ backgroundColor }}
                              title={`Noise Factor: ${noiseLabel}, Missing Cleavages: ${row.missing_cleavages}, Peptide Recall: ${(value * 100).toFixed(2)}%`}
                            >
                              {(value * 100).toFixed(1)}
                            </div>
                          );
                        })}
                      </div>
                    ))}
                    
                    {/* Legend */}
                    <div className="flex items-center justify-center mt-6 space-x-4">
                      <span className="text-sm text-gray-600">Peptide Recall (%)</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border border-gray-300 rounded" style={{ backgroundColor: `rgba(${parseInt(robustnessData.toolColor.slice(1, 3), 16)}, ${parseInt(robustnessData.toolColor.slice(3, 5), 16)}, ${parseInt(robustnessData.toolColor.slice(5, 7), 16)}, 0.2)` }}></div>
                        <span className="text-xs text-gray-500">Low</span>
                        <div className="w-4 h-4 border border-gray-300 rounded" style={{ backgroundColor: robustnessData.toolColor }}></div>
                        <span className="text-xs text-gray-500">High</span>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Multi-tool heatmap */}
                {robustnessData.type === 'multi_tool_heatmap' && robustnessData.heatmapData && (
                  <div className="space-y-4">
                    {/* Header with x-axis values */}
                    <div className="grid gap-1 text-xs font-semibold text-gray-600" style={{ gridTemplateColumns: `120px repeat(${robustnessData.xValues.length}, minmax(0, 1fr))` }}>
                      <div className="text-center p-2 font-bold">Tool \\ {robustnessData.xAxisField?.replace('_', ' ').toUpperCase()}</div>
                      {robustnessData.xValues.map(xVal => (
                        <div key={xVal} className="text-center p-2">
                          {xVal}
                        </div>
                      ))}
                    </div>
                    
                    {/* Heatmap rows */}
                    {robustnessData.heatmapData.map((row, rowIndex) => (
                      <div key={row.tool} className="grid gap-1" style={{ gridTemplateColumns: `120px repeat(${robustnessData.xValues.length}, minmax(0, 1fr))` }}>
                        <div className="text-xs font-semibold text-gray-600 p-2 text-left truncate" title={row.tool}>
                          {row.tool}
                        </div>
                        {robustnessData.xValues.map(xVal => {
                          const value = row[xVal] || 0;
                          const intensity = robustnessData.maxValue > 0 ? value / robustnessData.maxValue : 0;
                          const toolColor = getToolColor(row.tool);
                          const backgroundColor = `rgba(${parseInt(toolColor.slice(1, 3), 16)}, ${parseInt(toolColor.slice(3, 5), 16)}, ${parseInt(toolColor.slice(5, 7), 16)}, ${0.2 + intensity * 0.8})`;
                          
                          return (
                            <div
                              key={xVal}
                              className="aspect-square flex items-center justify-center text-xs font-medium border border-gray-200 rounded transition-all duration-200 hover:scale-105 hover:shadow-md cursor-pointer"
                              style={{ backgroundColor }}
                              title={`Tool: ${row.tool}, ${robustnessData.xAxisField}: ${xVal}, Peptide Recall: ${(value * 100).toFixed(2)}%`}
                            >
                              {(value * 100).toFixed(1)}
                            </div>
                          );
                        })}
                      </div>
                    ))}
                    
                    {/* Legend */}
                    <div className="flex items-center justify-center mt-6 space-x-4">
                      <span className="text-sm text-gray-600">Peptide Recall (%)</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border border-gray-300 rounded" style={{ backgroundColor: 'rgba(148, 78, 163, 0.2)' }}></div>
                        <span className="text-xs text-gray-500">Low</span>
                        <div className="w-4 h-4 border border-gray-300 rounded" style={{ backgroundColor: '#984EA3' }}></div>
                        <span className="text-xs text-gray-500">High</span>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Multi-tool line chart */}
                {robustnessData.type === 'multi_tool_line' && robustnessData.lineData && (
                  <div className="h-96">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={robustnessData.lineData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                        <XAxis 
                          dataKey={robustnessData.xAxisField}
                          tick={{ fontSize: 12, fill: '#374151' }}
                          label={{ value: robustnessData.xAxisField?.replace('_', ' ').toUpperCase(), position: 'insideBottom', offset: -10 }}
                        />
                        <YAxis 
                          tick={{ fontSize: 12, fill: '#374151' }}
                          label={{ value: 'Peptide Recall (%)', angle: -90, position: 'insideLeft' }}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                          }}
                          formatter={(value: any, name: string) => [`${parseFloat(value).toFixed(2)}%`, name]}
                          labelFormatter={(label) => `${robustnessData.xAxisField?.replace('_', ' ')}: ${label}`}
                        />
                        <Legend 
                          verticalAlign="top" 
                          height={36}
                          wrapperStyle={{ paddingBottom: '20px' }}
                        />
                        {robustnessData.tools.map((tool, index) => (
                          <Line 
                            key={tool}
                            type="monotone"
                            dataKey={tool}
                            stroke={getToolColor(tool)}
                            strokeWidth={2}
                            dot={{ fill: getToolColor(tool), strokeWidth: 2, r: 4 }}
                            activeDot={{ r: 6, stroke: getToolColor(tool), strokeWidth: 2 }}
                            name={tool}
                          />
                        ))}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
                
                {/* Line chart for single dimension indicators */}
                {robustnessData.type === 'line' && robustnessData.lineData && (
                  <div className="h-96">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={robustnessData.lineData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                        <XAxis 
                          dataKey={robustnessData.indicator.xAxis}
                          stroke="#666"
                          fontSize={12}
                          label={{ 
                            value: robustnessData.indicator.xAxis?.replace('_', ' ').toUpperCase(), 
                            position: 'insideBottom', 
                            offset: -10 
                          }}
                        />
                        <YAxis 
                          stroke="#666"
                          fontSize={12}
                          label={{ 
                            value: 'Peptide Recall (%)', 
                            angle: -90, 
                            position: 'insideLeft' 
                          }}
                          tickFormatter={(value) => `${(value * 100).toFixed(1)}%`}
                        />
                        <Tooltip 
                          formatter={(value: number) => [`${(value * 100).toFixed(2)}%`, 'Peptide Recall']}
                          labelFormatter={(label) => `${robustnessData.indicator.xAxis?.replace('_', ' ')}: ${label}`}
                          contentStyle={{
                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                            border: '1px solid #e0e0e0',
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                          }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="peptide_recall" 
                          stroke={robustnessData.toolColor}
                          strokeWidth={3}
                          dot={{ fill: robustnessData.toolColor, strokeWidth: 2, r: 4 }}
                          activeDot={{ r: 6, stroke: robustnessData.toolColor, strokeWidth: 2 }}
                        />
                        {robustnessData.lineData[0]?.aa_recall !== undefined && (
                          <Line 
                            type="monotone" 
                            dataKey="aa_recall" 
                            stroke={robustnessData.toolColor + '80'}
                            strokeWidth={2}
                            strokeDasharray="5 5"
                            dot={{ fill: robustnessData.toolColor + '80', strokeWidth: 1, r: 3 }}
                          />
                        )}
                        <Legend 
                          verticalAlign="top" 
                          height={36}
                          formatter={(value) => value === 'peptide_recall' ? 'Peptide Recall' : 'AA Recall'}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Model Selection for non-coverage depth and non-robustness metrics */}
        {selectedMetricType !== 'coverage_depth' && selectedMetricType !== 'robustness' && (
          <Card className="mb-8 bg-white/80 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 rounded-t-lg">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <Award className="w-4 h-4 text-white" />
                </div>
                Model Selection Dashboard
              </CardTitle>
              <CardDescription className="text-gray-600">
                Choose models for comparison analysis 
                <span className="inline-flex items-center ml-2 px-2 py-1 bg-blue-100 rounded-full text-xs font-medium text-blue-800">
                  {selectedModels.length} selected
                </span>
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex flex-wrap gap-3">
                {(selectedMetricType === 'accuracy' ? data.models : data.errorTypes).map((model, index) => (
                  <Badge
                    key={model.id}
                    variant={selectedModels.includes(model.id) ? "default" : "outline"}
                    className="cursor-pointer px-4 py-2 text-sm font-medium transition-all duration-200 hover:scale-105 hover:shadow-lg"
                    style={{
                      backgroundColor: selectedModels.includes(model.id) ? getModelColor(index) : 'transparent',
                      borderColor: getModelColor(index),
                      borderWidth: '2px',
                      color: selectedModels.includes(model.id) ? 'white' : getModelColor(index),
                      boxShadow: selectedModels.includes(model.id) ? `0 4px 12px ${getModelColor(index)}40` : 'none'
                    }}
                    onClick={() => handleModelToggle(model.id)}
                  >
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: selectedModels.includes(model.id) ? 'white' : getModelColor(index) }}
                      />
                      {model.name}
                    </div>
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Radar Chart for non-coverage depth and non-robustness metrics */}
        {selectedMetricType !== 'coverage_depth' && selectedMetricType !== 'robustness' && (
          <Card className="mb-8 bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 group">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-t-lg">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                  <Target className="w-4 h-4 text-white" />
                </div>
                Performance Radar
                <div className="ml-auto w-3 h-3 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-pulse"></div>
              </CardTitle>
              <CardDescription className="text-gray-600">
                {selectedMetricType === 'accuracy' 
                  ? `Multi-dimensional model comparison on ${selectedMetric.replace('_', ' ')}`
                  : `Error analysis comparison on ${selectedMetric.replace('_', ' ').replace('percent', '%')}`
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {radarData.length > 0 ? (
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-100/50 to-pink-100/50 rounded-lg -z-10"></div>
                  <ResponsiveContainer width="100%" height={400}>
                    <RadarChart data={radarData} margin={{ top: 20, right: 80, bottom: 20, left: 80 }}>
                      <PolarGrid gridType="polygon" className="opacity-30" />
                      <PolarAngleAxis dataKey="model" tick={{ fontSize: 12, fill: '#374151' }} />
                      <PolarRadiusAxis 
                        angle={90} 
                        domain={selectedMetricType === 'accuracy' ? [0, 1] : [0, 'dataMax + 5']} 
                        tick={{ fontSize: 10, fill: '#6B7280' }}
                        tickCount={5}
                        className="opacity-70"
                      />
                      <Radar
                        name={selectedMetric.replace('_', ' ')}
                        dataKey="value"
                        stroke="#8B5CF6"
                        fill="#8B5CF6"
                        fillOpacity={0.3}
                        strokeWidth={3}
                        dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 4 }}
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          backdropFilter: 'blur(10px)',
                          border: 'none',
                          borderRadius: '12px',
                          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
                        }}
                        formatter={(value: number) => [
                          selectedMetricType === 'accuracy' ? `${(value * 100).toFixed(1)}%` : `${value.toFixed(1)}%`,
                          selectedMetric.replace('_', ' ')
                        ]}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-96 text-gray-500 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mb-4">
                    <Target className="w-10 h-10 text-purple-400 opacity-50" />
                  </div>
                  <p className="text-lg font-medium mb-2 text-gray-700">No Data to Display</p>
                  <p className="text-sm text-center max-w-xs leading-relaxed">
                    {selectedModels.length === 0 
                      ? "Please select at least one model to see the radar visualization."
                      : "No models meet the current criteria. Try lowering the quality threshold."
                    }
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Bar Chart for non-coverage depth and non-robustness metrics */}
        {selectedMetricType !== 'coverage_depth' && selectedMetricType !== 'robustness' && (
          <Card className="mb-8 bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 group">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-t-lg">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                  <BarChart3 className="w-4 h-4 text-white" />
                </div>
                Comprehensive Metrics Comparison
                <div className="ml-auto flex gap-2">
                  <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full animate-pulse"></div>
                  <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full animate-pulse delay-200"></div>
                  <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full animate-pulse delay-300"></div>
                </div>
              </CardTitle>
              <CardDescription className="text-gray-600">
                Side-by-side comparison of all performance metrics across selected models
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {barChartData.length > 0 ? (
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-cyan-50/50 rounded-lg -z-10"></div>
                  <ResponsiveContainer width="100%" height={500}>
                    <BarChart data={barChartData} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis 
                        dataKey="name" 
                        angle={-45} 
                        textAnchor="end" 
                        height={80}
                        tick={{ fontSize: 12, fill: '#374151' }}
                      />
                      <YAxis 
                        label={{ value: 'Performance (%)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#374151' } }}
                        tick={{ fontSize: 12, fill: '#6B7280' }}
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          backdropFilter: 'blur(10px)',
                          border: 'none',
                          borderRadius: '12px',
                          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
                        }}
                        formatter={(value: number, name: string) => [`${value.toFixed(1)}%`, name.replace('_', ' ')]}
                      />
                      <Legend wrapperStyle={{ paddingTop: '20px' }} />
                      {selectedMetricType === 'accuracy' ? (
                        <>
                          <Bar dataKey="aa_precision" name="AA Precision" fill="#FF6B6B" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="aa_recall" name="AA Recall" fill="#4ECDC4" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="peptide_precision" name="Peptide Precision" fill="#45B7D1" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="peptide_recall" name="Peptide Recall" fill="#96CEB4" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="ptm_precision" name="PTM Precision" fill="#FFEAA7" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="ptm_recall" name="PTM Recall" fill="#DDA0DD" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="auc" name="AUC" fill="#FFB6C1" radius={[4, 4, 0, 0]} />
                        </>
                      ) : (
                        <>
                          <Bar dataKey="inversion_first_3" name="Inversion First 3" fill="#ef4444" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="inversion_last_3" name="Inversion Last 3" fill="#f97316" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="inversion_both" name="Inversion Both" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="aa_1_replaced" name="1 AA Replaced" fill="#eab308" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="aa_2_replaced" name="2 AAs Replaced" fill="#84cc16" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="more_than_6_wrong" name="6+ AAs Wrong" fill="#dc2626" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="other_errors" name="Other Errors" fill="#6b7280" radius={[4, 4, 0, 0]} />
                        </>
                      )}
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-96 text-gray-500 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full flex items-center justify-center mb-4">
                    <BarChart3 className="w-10 h-10 text-blue-400 opacity-50" />
                  </div>
                  <p className="text-lg font-medium mb-2 text-gray-700">No Metrics Data</p>
                  <p className="text-sm text-center max-w-xs leading-relaxed">
                    Select models to see comprehensive metrics comparison
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Assembly Metrics */}
        {selectedMetricType === 'assembly' && (
          <AssemblyTables selectedModels={selectedModels} />
        )}

      </div>
    </div>
  );
} 