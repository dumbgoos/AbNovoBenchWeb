"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trophy, TrendingUp, TrendingDown, Minus, Filter, AlertCircle, Medal, Award, Crown, Target, Zap, BarChart3 } from "lucide-react";
import { metricsAPI, efficiencyAPI } from '@/services/api';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Define backend returned metric data interface for metric_all
interface MetricAllData {
  id: number;
  model_id: number;
  model_name: string;
  architecture: string;
  aa_precision: string | number;
  aa_recall: string | number;
  pep_precision: string | number;
  pep_recall: string | number;
  ptm_precision: string | number;
  ptm_recall: string | number;
  auc: string | number;
  date?: string;
}

// Define efficiency data interface
interface EfficiencyData {
  model_id: number;
  model_name: string;
  architecture: string;
  speed_spectrums_per_second: number;
  date?: string;
}

// Define backend returned error types data interface
interface ErrorTypesData {
  id: number;
  model_id: number;
  model_name: string;
  architecture: string;
  number_of_total_predictions: number;
  number_of_total_errors: number;
  inversion_first_3_aas_percent: string | number;
  inversion_last_3_aas_percent: string | number;
  inversion_first_and_last_3_aas_percent: string | number;
  aa_1_replaced_by_1_or_2_percent: string | number;
  aa_2_replaced_by_2_percent: string | number;
  aa_3_replaced_by_3_percent: string | number;
  aa_4_replaced_by_4_percent: string | number;
  aa_5_replaced_by_5_percent: string | number;
  aa_6_replaced_by_6_percent: string | number;
  more_than_6_aas_wrong_percent: string | number;
  other_percent: string | number;
  date?: string;
}

// Define display metrics interface (simplified since we don't need to calculate averages anymore)
interface DisplayMetrics {
  model_id: number;
  model_name: string;
  architecture: string;
  aa_precision: number;
  aa_recall: number;
  pep_precision: number;
  pep_recall: number;
  ptm_precision: number;
  ptm_recall: number;
  auc: number;
  f1_score: number;
  date: string;
}

// Define display error types interface
interface DisplayErrorTypes {
  model_id: number;
  model_name: string;
  architecture: string;
  number_of_total_predictions: number;
  number_of_total_errors: number;
  inversion_first_3_aas_percent: number;
  inversion_last_3_aas_percent: number;
  inversion_first_and_last_3_aas_percent: number;
  aa_1_replaced_by_1_or_2_percent: number;
  aa_2_replaced_by_2_percent: number;
  aa_3_replaced_by_3_percent: number;
  aa_4_replaced_by_4_percent: number;
  aa_5_replaced_by_5_percent: number;
  aa_6_replaced_by_6_percent: number;
  more_than_6_aas_wrong_percent: number;
  other_percent: number;
  date: string;
}

// Define display efficiency interface
interface DisplayEfficiency {
  model_id: number;
  model_name: string;
  architecture: string;
  speed_spectrums_per_second: number;
  date: string;
}

export default function LeaderboardPage() {
  const [allMetricsEntries, setAllMetricsEntries] = useState<MetricAllData[]>([]);
  const [errorTypesEntries, setErrorTypesEntries] = useState<ErrorTypesData[]>([]);
  const [efficiencyEntries, setEfficiencyEntries] = useState<EfficiencyData[]>([]);
  const [enzymeMetricsEntries, setEnzymeMetricsEntries] = useState<any[]>([]);
  const [speciesMetricsEntries, setSpeciesMetricsEntries] = useState<any[]>([]);
  const [enzymeTypes, setEnzymeTypes] = useState<string[]>([]);
  const [speciesTypes, setSpeciesTypes] = useState<string[]>([]);
  const [selectedMetricType, setSelectedMetricType] = useState<string>('accuracy'); // New: Metric type (accuracy/error_types/efficiency)
  const [selectedIndicator, setSelectedIndicator] = useState<string>('auc'); // Changed: from selectedMetric to selectedIndicator
  const [selectedEnzyme, setSelectedEnzyme] = useState<string>('all');
  const [selectedSpecies, setSelectedSpecies] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTab, setCurrentTab] = useState('all');

  // Fetch leaderboard data
  const fetchLeaderboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all data sources
      const [allMetricsData, errorTypesData, efficiencyData, enzymeMetricsData, speciesMetricsData, enzymeTypesData, speciesTypesData] = await Promise.all([
        metricsAPI.all.getAll({ page: 1, limit: 1000 }),
        metricsAPI.errorTypes.getAll({ page: 1, limit: 1000 }),
        efficiencyAPI.getAll(),
        metricsAPI.enzyme.getAll({ page: 1, limit: 1000 }),
        metricsAPI.species.getAll({ page: 1, limit: 1000 }),
        metricsAPI.enzyme.getTypes(),
        metricsAPI.species.getTypes()
      ]);

      if (allMetricsData.success && allMetricsData.data?.metrics) {
        setAllMetricsEntries(allMetricsData.data.metrics);
      }
      if (errorTypesData.success && errorTypesData.data?.metrics) {
        setErrorTypesEntries(errorTypesData.data.metrics);
      }
      if (enzymeMetricsData.success && enzymeMetricsData.data?.metrics) {
        setEnzymeMetricsEntries(enzymeMetricsData.data.metrics);
      }
      if (speciesMetricsData.success && speciesMetricsData.data?.metrics) {
        setSpeciesMetricsEntries(speciesMetricsData.data.metrics);
      }
      if (enzymeTypesData.success && enzymeTypesData.data?.enzymes) {
        setEnzymeTypes(enzymeTypesData.data.enzymes);
      }
      if (speciesTypesData.success && speciesTypesData.data?.species) {
        setSpeciesTypes(speciesTypesData.data.species);
      }
      if (efficiencyData.success && efficiencyData.data?.efficiency) {
        setEfficiencyEntries(efficiencyData.data.efficiency);
      }
    } catch (err) {
      console.error('Failed to fetch leaderboard data:', err);
      setError('Failed to fetch leaderboard data, please try again later');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboardData();
  }, []);

  // Convert metric_all data to display format
  const convertToDisplayMetrics = (entries: MetricAllData[]): DisplayMetrics[] => {
    if (!Array.isArray(entries)) {
      return [];
    }

    return entries.map(entry => {
      const aa_precision = parseFloat(String(entry.aa_precision)) || 0;
      const aa_recall = parseFloat(String(entry.aa_recall)) || 0;
      
      // Calculate F1 score using AA metrics
      let f1_score = 0;
      if (aa_precision + aa_recall > 0) {
        f1_score = 2 * (aa_precision * aa_recall) / (aa_precision + aa_recall);
      }

      return {
        model_id: entry.model_id,
        model_name: entry.model_name,
        architecture: entry.architecture || 'N/A',
        aa_precision,
        aa_recall,
        pep_precision: parseFloat(String(entry.pep_precision)) || 0,
        pep_recall: parseFloat(String(entry.pep_recall)) || 0,
        ptm_precision: parseFloat(String(entry.ptm_precision)) || 0,
        ptm_recall: parseFloat(String(entry.ptm_recall)) || 0,
        auc: parseFloat(String(entry.auc)) || 0,
        f1_score,
        date: entry.date || new Date().toISOString()
      };
    });
  };

  // Convert error types data to display format
  const convertToDisplayErrorTypes = (entries: ErrorTypesData[]): DisplayErrorTypes[] => {
    if (!Array.isArray(entries)) {
      return [];
    }

    return entries.map(entry => ({
      model_id: entry.model_id,
      model_name: entry.model_name,
      architecture: entry.architecture || 'N/A',
      number_of_total_predictions: entry.number_of_total_predictions || 0,
      number_of_total_errors: entry.number_of_total_errors || 0,
      inversion_first_3_aas_percent: parseFloat(String(entry.inversion_first_3_aas_percent)) || 0,
      inversion_last_3_aas_percent: parseFloat(String(entry.inversion_last_3_aas_percent)) || 0,
      inversion_first_and_last_3_aas_percent: parseFloat(String(entry.inversion_first_and_last_3_aas_percent)) || 0,
      aa_1_replaced_by_1_or_2_percent: parseFloat(String(entry.aa_1_replaced_by_1_or_2_percent)) || 0,
      aa_2_replaced_by_2_percent: parseFloat(String(entry.aa_2_replaced_by_2_percent)) || 0,
      aa_3_replaced_by_3_percent: parseFloat(String(entry.aa_3_replaced_by_3_percent)) || 0,
      aa_4_replaced_by_4_percent: parseFloat(String(entry.aa_4_replaced_by_4_percent)) || 0,
      aa_5_replaced_by_5_percent: parseFloat(String(entry.aa_5_replaced_by_5_percent)) || 0,
      aa_6_replaced_by_6_percent: parseFloat(String(entry.aa_6_replaced_by_6_percent)) || 0,
      more_than_6_aas_wrong_percent: parseFloat(String(entry.more_than_6_aas_wrong_percent)) || 0,
      other_percent: parseFloat(String(entry.other_percent)) || 0,
      date: entry.date || new Date().toISOString()
    }));
  };

  // Convert enzyme metrics to display format
  const convertEnzymeMetricsToDisplay = (entries: any[]): DisplayMetrics[] => {
    if (!Array.isArray(entries)) return [];

    // Group by model and calculate averages
    const modelGroups: { [key: string]: any[] } = {};
    
    entries.forEach(entry => {
      const key = `${entry.model_id}_${entry.model_name}`;
      if (!modelGroups[key]) {
        modelGroups[key] = [];
      }
      modelGroups[key].push(entry);
    });

    return Object.values(modelGroups).map(group => {
      const firstEntry = group[0];
      
      // Filter by enzyme type if selected
      let filteredGroup = group;
      if (selectedEnzyme !== 'all') {
        filteredGroup = group.filter(entry => entry.enzyme === selectedEnzyme);
      }
      
      if (filteredGroup.length === 0) return null;

      // Calculate averages
      const avg = (field: string) => {
        const values = filteredGroup.map(entry => parseFloat(String(entry[field])) || 0);
        return values.reduce((sum, val) => sum + val, 0) / values.length;
      };

      const aa_precision = avg('aa_precision');
      const aa_recall = avg('aa_recall');
      
      // Calculate F1 score using AA metrics
      let f1_score = 0;
      if (aa_precision + aa_recall > 0) {
        f1_score = 2 * (aa_precision * aa_recall) / (aa_precision + aa_recall);
      }

      return {
        model_id: firstEntry.model_id,
        model_name: firstEntry.model_name,
        architecture: firstEntry.architecture || 'N/A',
        aa_precision,
        aa_recall,
        pep_precision: avg('pep_precision'),
        pep_recall: avg('pep_recall'),
        ptm_precision: avg('ptm_precision'),
        ptm_recall: avg('ptm_recall'),
        auc: avg('auc'),
        f1_score,
        date: firstEntry.date || new Date().toISOString()
      };
    }).filter(Boolean) as DisplayMetrics[];
  };

  // Convert species metrics to display format
  const convertSpeciesMetricsToDisplay = (entries: any[]): DisplayMetrics[] => {
    if (!Array.isArray(entries)) return [];

    // Group by model and calculate averages
    const modelGroups: { [key: string]: any[] } = {};
    
    entries.forEach(entry => {
      const key = `${entry.model_id}_${entry.model_name}`;
      if (!modelGroups[key]) {
        modelGroups[key] = [];
      }
      modelGroups[key].push(entry);
    });

    return Object.values(modelGroups).map(group => {
      const firstEntry = group[0];
      
      // Filter by species type if selected
      let filteredGroup = group;
      if (selectedSpecies !== 'all') {
        filteredGroup = group.filter(entry => entry.species === selectedSpecies);
      }
      
      if (filteredGroup.length === 0) return null;

      // Calculate averages
      const avg = (field: string) => {
        const values = filteredGroup.map(entry => parseFloat(String(entry[field])) || 0);
        return values.reduce((sum, val) => sum + val, 0) / values.length;
      };

      const aa_precision = avg('aa_precision');
      const aa_recall = avg('aa_recall');
      
      // Calculate F1 score using AA metrics
      let f1_score = 0;
      if (aa_precision + aa_recall > 0) {
        f1_score = 2 * (aa_precision * aa_recall) / (aa_precision + aa_recall);
      }

      return {
        model_id: firstEntry.model_id,
        model_name: firstEntry.model_name,
        architecture: firstEntry.architecture || 'N/A',
        aa_precision,
        aa_recall,
        pep_precision: avg('pep_precision'),
        pep_recall: avg('pep_recall'),
        ptm_precision: avg('ptm_precision'),
        ptm_recall: avg('ptm_recall'),
        auc: avg('auc'),
        f1_score,
        date: firstEntry.date || new Date().toISOString()
      };
    }).filter(Boolean) as DisplayMetrics[];
  };

  // Convert efficiency data to display format
  const convertEfficiencyToDisplay = (entries: EfficiencyData[]): DisplayEfficiency[] => {
    if (!Array.isArray(entries)) {
      return [];
    }

    return entries.map(entry => ({
      model_id: entry.model_id,
      model_name: entry.model_name,
      architecture: entry.architecture || 'N/A',
      speed_spectrums_per_second: entry.speed_spectrums_per_second,
      date: entry.date || new Date().toISOString()
    }));
  };

  // Sort function for both metrics and error types
  const sortMetrics = (metrics: DisplayMetrics[], sortBy: string): DisplayMetrics[] => {
    return [...metrics].sort((a, b) => {
      const aValue = a[sortBy as keyof DisplayMetrics] as number;
      const bValue = b[sortBy as keyof DisplayMetrics] as number;
      return bValue - aValue;
    });
  };

  const sortErrorTypes = (errorTypes: DisplayErrorTypes[], sortBy: string): DisplayErrorTypes[] => {
    return [...errorTypes].sort((a, b) => {
      const aValue = a[sortBy as keyof DisplayErrorTypes] as number;
      const bValue = b[sortBy as keyof DisplayErrorTypes] as number;
      // For error types, generally we want to sort in ascending order (lower error rates are better)
      // But for total predictions/errors, descending might make more sense
      if (sortBy === 'number_of_total_predictions' || sortBy === 'number_of_total_errors') {
        return bValue - aValue; // Descending
      }
      return aValue - bValue; // Ascending for error percentages
    });
  };

  const sortEfficiency = (efficiency: DisplayEfficiency[], sortBy: string): DisplayEfficiency[] => {
    return [...efficiency].sort((a, b) => {
      const aValue = a[sortBy as keyof DisplayEfficiency] as number;
      const bValue = b[sortBy as keyof DisplayEfficiency] as number;
      // For efficiency, higher speed is better, so sort in descending order
      return bValue - aValue;
    });
  };

  // Get rank display icons and styles
  const getRankDisplay = (rank: number) => {
    switch (rank) {
      case 1:
        return {
          icon: <Crown className="w-6 h-6 text-yellow-500" />,
          bg: 'bg-gradient-to-r from-yellow-400 to-yellow-600',
          text: 'text-white',
          badge: 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white',
          glow: 'shadow-yellow-200'
        };
      case 2:
        return {
          icon: <Trophy className="w-6 h-6 text-gray-400" />,
          bg: 'bg-gradient-to-r from-gray-300 to-gray-500',
          text: 'text-white',
          badge: 'bg-gradient-to-r from-gray-400 to-gray-600 text-white',
          glow: 'shadow-gray-200'
        };
      case 3:
        return {
          icon: <Medal className="w-6 h-6 text-amber-600" />,
          bg: 'bg-gradient-to-r from-amber-500 to-orange-600',
          text: 'text-white',
          badge: 'bg-gradient-to-r from-amber-500 to-orange-600 text-white',
          glow: 'shadow-amber-200'
        };
      default:
        return {
          icon: <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-sm font-bold text-blue-600">#{rank}</div>,
          bg: 'bg-gradient-to-r from-blue-50 to-blue-100',
          text: 'text-gray-900',
          badge: 'bg-gradient-to-r from-blue-500 to-blue-600 text-white',
          glow: 'shadow-blue-100'
        };
    }
  };

  // Format numbers
  const formatNumber = (num: number, decimals: number = 4) => {
    return isNaN(num) ? '0.0000' : num.toFixed(decimals);
  };

  // Render leaderboard table
  const renderLeaderboard = (metrics: DisplayMetrics[]) => {
    const sortedMetrics = sortMetrics(metrics, selectedIndicator);

    if (sortedMetrics.length === 0) {
      return (
        <Card className="text-center py-16 border-0 shadow-xl bg-gradient-to-br from-white to-gray-50">
          <CardContent>
            <div className="text-gray-400 text-6xl mb-4">🏆</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Leaderboard Data</h3>
            <p className="text-gray-600">No models found in the database</p>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="space-y-6">
        {sortedMetrics.map((entry, index) => {
          const rank = index + 1;
          const rankDisplay = getRankDisplay(rank);
          
          return (
            <Card 
              key={entry.model_id} 
              className={`group hover:shadow-2xl transition-all duration-500 border-0 shadow-lg ${rankDisplay.glow} hover:-translate-y-1 animate-fadeInScale`}
              style={{
                animationDelay: `${index * 100}ms`,
              }}
            >
              <div className={`${rankDisplay.bg} p-1 rounded-t-lg`}>
                <div className="bg-white rounded-t-lg">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-4">
                        {rankDisplay.icon}
                        <div>
                          <div className="flex items-center space-x-3">
                            <h3 className="text-xl font-bold text-gray-900">{entry.model_name}</h3>
                            <Badge variant="outline" className="text-sm font-medium">
                              {entry.architecture}
                            </Badge>
                          </div>
                          <p className="text-gray-600 text-sm mt-1">
                            Model ID: {entry.model_id}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={`${rankDisplay.badge} text-lg font-bold px-4 py-2`}>
                          #{rank}
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600 mb-1">
                          {formatNumber(entry.auc)}
                        </div>
                        <div className="text-sm text-blue-600 font-medium">AUC</div>
                      </div>
                      <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                        <div className="text-2xl font-bold text-green-600 mb-1">
                          {formatNumber(entry.aa_precision)}
                        </div>
                        <div className="text-sm text-green-600 font-medium">AA Precision</div>
                      </div>
                      <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600 mb-1">
                          {formatNumber(entry.pep_precision)}
                        </div>
                        <div className="text-sm text-purple-600 font-medium">Peptide Precision</div>
                      </div>
                      <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg">
                        <div className="text-2xl font-bold text-orange-600 mb-1">
                          {formatNumber(entry.ptm_precision)}
                        </div>
                        <div className="text-sm text-orange-600 font-medium">PTM Precision</div>
                      </div>
                    </div>

                    <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div className="flex items-center justify-between bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg px-3 py-2">
                        <span className="text-emerald-600 text-sm font-medium">AA Recall:</span>
                        <span className="font-bold text-emerald-700">{formatNumber(entry.aa_recall)}</span>
                      </div>
                      <div className="flex items-center justify-between bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg px-3 py-2">
                        <span className="text-indigo-600 text-sm font-medium">Pep Recall:</span>
                        <span className="font-bold text-indigo-700">{formatNumber(entry.pep_recall)}</span>
                      </div>
                      <div className="flex items-center justify-between bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg px-3 py-2">
                        <span className="text-amber-600 text-sm font-medium">PTM Recall:</span>
                        <span className="font-bold text-amber-700">{formatNumber(entry.ptm_recall)}</span>
                      </div>
                    </div>
                  </CardContent>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    );
  };

  // Render efficiency leaderboard table
  const renderEfficiencyLeaderboard = (efficiency: DisplayEfficiency[]) => {
    if (efficiency.length === 0) {
      return (
        <Card className="text-center py-16 border-0 shadow-xl bg-gradient-to-br from-white to-gray-50">
          <CardContent>
            <div className="text-gray-400 text-6xl mb-4">⚡</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Efficiency Data</h3>
            <p className="text-gray-600">No efficiency data found in the database</p>
          </CardContent>
        </Card>
      );
    }

    const sortedEfficiency = sortEfficiency(efficiency, 'speed_spectrums_per_second');

    return (
      <div className="space-y-6">
        {sortedEfficiency.map((entry, index) => {
          const rank = index + 1;
          const rankDisplay = getRankDisplay(rank);
          
          return (
            <Card 
              key={entry.model_id} 
              className={`group hover:shadow-2xl transition-all duration-500 border-0 shadow-lg ${rankDisplay.glow} hover:-translate-y-1 animate-fadeInScale`}
              style={{
                animationDelay: `${index * 100}ms`,
              }}
            >
              <div className={`${rankDisplay.bg} p-1 rounded-t-lg`}>
                <div className={`bg-white rounded-lg p-4 ${rankDisplay.text}`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        {rankDisplay.icon}
                        <span className="text-lg font-bold">#{rank}</span>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-1">{entry.model_name}</h3>
                        <div className="flex items-center gap-2">
                          <Badge className={rankDisplay.badge}>
                            Rank #{rank}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>

                  <CardContent className="p-0">
                    {/* Efficiency Display */}
                    <div className="grid grid-cols-1 gap-4">
                      <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <Zap className="w-6 h-6 text-blue-600" />
                          <span className="text-sm font-medium text-blue-600">Speed</span>
                        </div>
                        <div className="text-3xl font-bold text-blue-700 mb-1">
                          {formatNumber(entry.speed_spectrums_per_second, 2)}
                        </div>
                        <div className="text-sm text-blue-600 font-medium">spectrums/second</div>
                      </div>
                    </div>
                  </CardContent>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    );
  };

  // Render error types leaderboard table
  const renderErrorTypesLeaderboard = (errorTypes: DisplayErrorTypes[]) => {
    const sortedErrorTypes = sortErrorTypes(errorTypes, selectedIndicator);

    if (sortedErrorTypes.length === 0) {
      return (
        <Card className="text-center py-16 border-0 shadow-xl bg-gradient-to-br from-white to-gray-50">
          <CardContent>
            <div className="text-gray-400 text-6xl mb-4">📊</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Error Types Data</h3>
            <p className="text-gray-600">No error analysis data found in the database</p>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="space-y-6">
        {sortedErrorTypes.map((entry, index) => {
          const rank = index + 1;
          const rankDisplay = getRankDisplay(rank);
          
          return (
            <Card 
              key={entry.model_id} 
              className={`group hover:shadow-2xl transition-all duration-500 border-0 shadow-lg ${rankDisplay.glow} hover:-translate-y-1 animate-fadeInScale`}
              style={{
                animationDelay: `${index * 100}ms`,
              }}
            >
              <div className={`${rankDisplay.bg} p-1 rounded-t-lg`}>
                <div className={`bg-white rounded-lg p-4 ${rankDisplay.text}`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        {rankDisplay.icon}
                        <span className="text-lg font-bold">#{rank}</span>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-1">{entry.model_name}</h3>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {entry.architecture}
                          </Badge>
                          <Badge className={rankDisplay.badge}>
                            Rank #{rank}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>

                  <CardContent className="p-0">
                    {/* Key Error Types Display */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600 mb-1">
                          {formatNumber(entry.inversion_first_3_aas_percent, 2)}%
                        </div>
                        <div className="text-sm text-blue-600 font-medium">Inversion First 3</div>
                      </div>
                      <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                        <div className="text-2xl font-bold text-green-600 mb-1">
                          {formatNumber(entry.inversion_last_3_aas_percent, 2)}%
                        </div>
                        <div className="text-sm text-green-600 font-medium">Inversion Last 3</div>
                      </div>
                      <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600 mb-1">
                          {formatNumber(entry.aa_1_replaced_by_1_or_2_percent, 2)}%
                        </div>
                        <div className="text-sm text-purple-600 font-medium">1 AA Replaced</div>
                      </div>
                      <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg">
                        <div className="text-2xl font-bold text-orange-600 mb-1">
                          {formatNumber(entry.more_than_6_aas_wrong_percent, 2)}%
                        </div>
                        <div className="text-sm text-orange-600 font-medium">6+ AAs Wrong</div>
                      </div>
                    </div>

                    {/* Additional Error Types */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="flex items-center justify-between bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg px-3 py-2">
                        <span className="text-emerald-600 text-xs font-medium">2 AA Replaced:</span>
                        <span className="font-bold text-emerald-700 text-sm">{formatNumber(entry.aa_2_replaced_by_2_percent, 2)}%</span>
                      </div>
                      <div className="flex items-center justify-between bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg px-3 py-2">
                        <span className="text-indigo-600 text-xs font-medium">3 AA Replaced:</span>
                        <span className="font-bold text-indigo-700 text-sm">{formatNumber(entry.aa_3_replaced_by_3_percent, 2)}%</span>
                      </div>
                      <div className="flex items-center justify-between bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg px-3 py-2">
                        <span className="text-amber-600 text-xs font-medium">4 AA Replaced:</span>
                        <span className="font-bold text-amber-700 text-sm">{formatNumber(entry.aa_4_replaced_by_4_percent, 2)}%</span>
                      </div>
                      <div className="flex items-center justify-between bg-gradient-to-br from-pink-50 to-pink-100 rounded-lg px-3 py-2">
                        <span className="text-pink-600 text-xs font-medium">Other:</span>
                        <span className="font-bold text-pink-700 text-sm">{formatNumber(entry.other_percent, 2)}%</span>
                      </div>
                    </div>

                    {/* Summary Statistics */}
                    <div className="mt-4 grid grid-cols-2 gap-4">
                      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg px-4 py-3">
                        <div className="text-gray-600 text-sm">Total Predictions</div>
                        <div className="text-gray-900 text-lg font-bold">{entry.number_of_total_predictions.toLocaleString()}</div>
                      </div>
                      <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg px-4 py-3">
                        <div className="text-red-600 text-sm">Total Errors</div>
                        <div className="text-red-900 text-lg font-bold">{entry.number_of_total_errors.toLocaleString()}</div>
                      </div>
                    </div>
                  </CardContent>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    );
  };

  // Main component content
  const displayMetrics = convertToDisplayMetrics(allMetricsEntries);
  const displayErrorTypes = convertToDisplayErrorTypes(errorTypesEntries);
  const displayEfficiency = convertEfficiencyToDisplay(efficiencyEntries);
  const enzymeDisplayMetrics = convertEnzymeMetricsToDisplay(enzymeMetricsEntries);
  const speciesDisplayMetrics = convertSpeciesMetricsToDisplay(speciesMetricsEntries);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Trophy className="w-8 h-8 text-blue-600 animate-pulse" />
            </div>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Loading Leaderboard Data</h3>
            <p className="text-gray-600">Fetching the latest model performance data...</p>
          </div>
          <div className="flex space-x-1 justify-center">
            <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce"></div>
            <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
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
            onClick={fetchLeaderboardData} 
            className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white font-semibold px-8 py-3 rounded-lg transition-all duration-300 transform hover:scale-105"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Page title */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-4 bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500 rounded-full text-white mb-6 shadow-xl">
            <Crown className="w-10 h-10" />
          </div>
          <h1 className="text-6xl font-bold text-gray-900 mb-4 bg-gradient-to-r from-yellow-600 via-red-500 to-pink-500 bg-clip-text text-transparent">
            Model Leaderboard
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Compare model performance across different evaluation metrics
          </p>
        </div>

        {/* Filter controls */}
        <Card className="mb-8 border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <Filter className="w-6 h-6 text-blue-600" />
              Filters & Sort
            </CardTitle>
            <CardDescription>
              Customize your view with sorting and filtering options
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className={`grid gap-6 ${selectedMetricType === 'accuracy' ? 'grid-cols-1 md:grid-cols-4' : 'grid-cols-1 md:grid-cols-2'}`}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Metric
                </label>
                <Select value={selectedMetricType} onValueChange={(value) => {
                  setSelectedMetricType(value);
                  // Reset indicator when metric type changes
                  if (value === 'accuracy') {
                    setSelectedIndicator('auc');
                  } else if (value === 'error_types') {
                    setSelectedIndicator('inversion_first_3_aas_percent');
                  } else if (value === 'efficiency') {
                    setSelectedIndicator('speed_spectrums_per_second');
                  }
                  // Reset tab to "all" when switching away from accuracy
                  if (value !== 'accuracy') {
                    setCurrentTab('all');
                  }
                }}>
                  <SelectTrigger className="border-gray-200 focus:border-blue-400 focus:ring-blue-400">
                    <SelectValue placeholder="Select metric type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="accuracy">Accuracy</SelectItem>
                    <SelectItem value="error_types">Error Types</SelectItem>
                    <SelectItem value="efficiency">Efficiency</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Indicator
                </label>
                <Select value={selectedIndicator} onValueChange={setSelectedIndicator}>
                  <SelectTrigger className="border-gray-200 focus:border-blue-400 focus:ring-blue-400">
                    <SelectValue placeholder="Select indicator" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedMetricType === 'accuracy' && (
                      <>
                        <SelectItem value="auc">AUC</SelectItem>
                        <SelectItem value="aa_precision">AA Precision</SelectItem>
                        <SelectItem value="aa_recall">AA Recall</SelectItem>
                        <SelectItem value="pep_precision">Pep Precision</SelectItem>
                        <SelectItem value="pep_recall">Pep Recall</SelectItem>
                        <SelectItem value="ptm_precision">PTM Precision</SelectItem>
                        <SelectItem value="ptm_recall">PTM Recall</SelectItem>
                      </>
                    )}
                    {selectedMetricType === 'error_types' && (
                      <>
                        <SelectItem value="inversion_first_3_aas_percent">Inversion First 3 AAs (%)</SelectItem>
                        <SelectItem value="inversion_last_3_aas_percent">Inversion Last 3 AAs (%)</SelectItem>
                        <SelectItem value="inversion_first_and_last_3_aas_percent">Inversion First & Last 3 AAs (%)</SelectItem>
                        <SelectItem value="aa_1_replaced_by_1_or_2_percent">1 AA Replaced by 1-2 AAs (%)</SelectItem>
                        <SelectItem value="aa_2_replaced_by_2_percent">2 AAs Replaced by 2 AAs (%)</SelectItem>
                        <SelectItem value="aa_3_replaced_by_3_percent">3 AAs Replaced by 3 AAs (%)</SelectItem>
                        <SelectItem value="aa_4_replaced_by_4_percent">4 AAs Replaced by 4 AAs (%)</SelectItem>
                        <SelectItem value="aa_5_replaced_by_5_percent">5 AAs Replaced by 5 AAs (%)</SelectItem>
                        <SelectItem value="aa_6_replaced_by_6_percent">6 AAs Replaced by 6 AAs (%)</SelectItem>
                        <SelectItem value="more_than_6_aas_wrong_percent">More than 6 AAs Wrong (%)</SelectItem>
                        <SelectItem value="other_percent">Other (%)</SelectItem>
                      </>
                    )}
                    {selectedMetricType === 'efficiency' && (
                      <>
                        <SelectItem value="speed_spectrums_per_second">Speed (spectrums/s)</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>
              {selectedMetricType === 'accuracy' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Enzyme Type
                    </label>
                    <Select value={selectedEnzyme} onValueChange={setSelectedEnzyme}>
                      <SelectTrigger className="border-gray-200 focus:border-blue-400 focus:ring-blue-400">
                        <SelectValue placeholder="Select enzyme type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Enzymes</SelectItem>
                        {enzymeTypes.map(enzyme => (
                          <SelectItem key={enzyme} value={enzyme}>{enzyme}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Species Type
                    </label>
                    <Select value={selectedSpecies} onValueChange={setSelectedSpecies}>
                      <SelectTrigger className="border-gray-200 focus:border-blue-400 focus:ring-blue-400">
                        <SelectValue placeholder="Select species type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Species</SelectItem>
                        {speciesTypes.map(species => (
                          <SelectItem key={species} value={species}>{species}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Leaderboard tabs */}
        <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
          <TabsList className={`grid w-full h-14 p-1 bg-white/70 backdrop-blur-sm rounded-xl shadow-lg ${selectedMetricType === 'accuracy' ? 'grid-cols-3' : 'grid-cols-1'}`}>
            <TabsTrigger 
              value="all" 
              className="flex items-center gap-3 text-lg font-semibold data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white"
            >
              <BarChart3 className="w-5 h-5" />
              All Data
            </TabsTrigger>
            {selectedMetricType === 'accuracy' && (
              <>
                <TabsTrigger 
                  value="enzyme" 
                  className="flex items-center gap-3 text-lg font-semibold data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-blue-600 data-[state=active]:text-white"
                >
                  <TrendingUp className="w-5 h-5" />
                  By Enzyme
                </TabsTrigger>
                <TabsTrigger 
                  value="species" 
                  className="flex items-center gap-3 text-lg font-semibold data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-600 data-[state=active]:text-white"
                >
                  <TrendingUp className="w-5 h-5" />
                  By Species
                </TabsTrigger>
              </>
            )}
          </TabsList>
          
          <TabsContent value="all" className="mt-8">
            {selectedMetricType === 'accuracy' 
              ? renderLeaderboard(displayMetrics)
              : selectedMetricType === 'error_types'
              ? renderErrorTypesLeaderboard(displayErrorTypes)
              : renderEfficiencyLeaderboard(displayEfficiency)
            }
          </TabsContent>
          
          <TabsContent value="enzyme" className="mt-8">
            {selectedMetricType === 'accuracy' 
              ? renderLeaderboard(enzymeDisplayMetrics)
              : selectedMetricType === 'error_types'
              ? (
                <Card className="text-center py-16 border-0 shadow-xl bg-gradient-to-br from-white to-gray-50">
                  <CardContent>
                    <div className="text-gray-400 text-6xl mb-4">🚧</div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Error Types by Enzyme</h3>
                    <p className="text-gray-600">Error analysis by enzyme type is not yet available</p>
                  </CardContent>
                </Card>
              )
              : (
                <Card className="text-center py-16 border-0 shadow-xl bg-gradient-to-br from-white to-gray-50">
                  <CardContent>
                    <div className="text-gray-400 text-6xl mb-4">🚧</div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Efficiency by Enzyme</h3>
                    <p className="text-gray-600">Efficiency analysis by enzyme type is not yet available</p>
                  </CardContent>
                </Card>
              )
            }
          </TabsContent>
          
          <TabsContent value="species" className="mt-8">
            {selectedMetricType === 'accuracy' 
              ? renderLeaderboard(speciesDisplayMetrics)
              : selectedMetricType === 'error_types'
              ? (
                <Card className="text-center py-16 border-0 shadow-xl bg-gradient-to-br from-white to-gray-50">
                  <CardContent>
                    <div className="text-gray-400 text-6xl mb-4">🚧</div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Error Types by Species</h3>
                    <p className="text-gray-600">Error analysis by species type is not yet available</p>
                  </CardContent>
                </Card>
              )
              : (
                <Card className="text-center py-16 border-0 shadow-xl bg-gradient-to-br from-white to-gray-50">
                  <CardContent>
                    <div className="text-gray-400 text-6xl mb-4">🚧</div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Efficiency by Species</h3>
                    <p className="text-gray-600">Efficiency analysis by species type is not yet available</p>
                  </CardContent>
                </Card>
              )
            }
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 