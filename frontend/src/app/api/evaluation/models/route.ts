import { NextRequest, NextResponse } from 'next/server';

// Define status types
type ModelStatus = 'active' | 'inactive';

// Backend API base URL - use backend service name for Docker container communication
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'http://backend:5000/api'
  : 'http://localhost:5000/api';

// Define backend response data types
interface BackendModel {
  id: number;
  name: string;
  architecture: string;
  date: string;
  info?: string;
  url?: string;
  is_delete: boolean;
}

interface BackendMetricAll {
  id: number;
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
}

// Utility function: Transform backend data to frontend expected format
function transformModelData(models: BackendModel[], allMetrics: BackendMetricAll[]): any[] {
  return models.map(model => {
    // Find the summary metrics data for this model
    const modelMetric = allMetrics.find(metric => metric.model_id === model.id);
    
    if (!modelMetric) {
      // If no metrics data, return default values
      return {
        id: model.id.toString(),
        name: model.name,
        aa_precision: 0,
        aa_recall: 0,
        peptide_precision: 0,
        peptide_recall: 0,
        ptm_precision: 0,
        ptm_recall: 0,
        auc: 0,
        category: getCategoryFromArchitecture(model.architecture),
        submission_date: model.date || new Date().toISOString().split('T')[0],
        status: 'active' as ModelStatus
      };
    }

    return {
      id: model.id.toString(),
      name: model.name,
      aa_precision: parseFloat(modelMetric.aa_precision.toString()) || 0,
      aa_recall: parseFloat(modelMetric.aa_recall.toString()) || 0,
      peptide_precision: parseFloat(modelMetric.pep_precision.toString()) || 0,
      peptide_recall: parseFloat(modelMetric.pep_recall.toString()) || 0,
      ptm_precision: parseFloat(modelMetric.ptm_precision.toString()) || 0,
      ptm_recall: parseFloat(modelMetric.ptm_recall.toString()) || 0,
      auc: parseFloat(modelMetric.auc.toString()) || 0,
      category: getCategoryFromArchitecture(model.architecture),
      submission_date: model.date || new Date().toISOString().split('T')[0],
      status: 'active' as ModelStatus
    };
  });
}

// 根据架构推断分类
function getCategoryFromArchitecture(architecture: string): string {
  if (!architecture) return 'Other';
  
  const arch = architecture.toLowerCase();
  if (arch.includes('transformer')) return 'Transformer';
  if (arch.includes('cnn') || arch.includes('conv')) return 'CNN';
  if (arch.includes('rnn') || arch.includes('lstm') || arch.includes('gru')) return 'RNN';
  if (arch.includes('graph') || arch.includes('gnn')) return 'Graph';
  if (arch.includes('hybrid')) return 'Hybrid';
  
  return 'Other';
}

export async function GET(request: NextRequest) {
  try {
    console.log('Fetching evaluation data from backend...');

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const status = searchParams.get('status') as ModelStatus | null;
    const minAuc = searchParams.get('minAuc');

    // Get model data, summary metrics data and enzyme data in parallel
    const [modelsResponse, allMetricsResponse, enzymeResponse] = await Promise.all([
      fetch(`${API_BASE_URL}/models?limit=1000`, {
        headers: {
          'Content-Type': 'application/json',
        },
      }),
      fetch(`${API_BASE_URL}/metrics/all?limit=1000`, {
        headers: {
          'Content-Type': 'application/json',
        },
      }),
      fetch(`${API_BASE_URL}/metrics/enzyme?limit=1000`, {
        headers: {
          'Content-Type': 'application/json',
        },
      })
    ]);

    let models: BackendModel[] = [];
    let allMetrics: BackendMetricAll[] = [];
    let enzymeMetrics: any[] = [];

    // Process model data
    if (modelsResponse.ok) {
      const modelsData = await modelsResponse.json();
      if (modelsData.success && modelsData.data?.models) {
        models = modelsData.data.models.filter((model: BackendModel) => !model.is_delete);
      }
    }

    // Process summary metrics data
    if (allMetricsResponse.ok) {
      const metricsData = await allMetricsResponse.json();
      if (metricsData.success && metricsData.data?.metrics) {
        allMetrics = metricsData.data.metrics;
      }
    }

    // Process enzyme data
    if (enzymeResponse.ok) {
      const enzymeData = await enzymeResponse.json();
      if (enzymeData.success && enzymeData.data?.metrics) {
        enzymeMetrics = enzymeData.data.metrics;
      }
    }

    // Transform data format
    let transformedModels = transformModelData(models, allMetrics);

    // Apply frontend filters
    if (category) {
      transformedModels = transformedModels.filter(model => 
        model.category.toLowerCase() === category.toLowerCase()
      );
    }

    if (status && (status === 'active' || status === 'inactive')) {
      transformedModels = transformedModels.filter(model => 
        model.status === status
      );
    }

    if (minAuc) {
      const minAucValue = parseFloat(minAuc);
      transformedModels = transformedModels.filter(model => 
        model.auc >= minAucValue
      );
    }

    // Sort by AUC
    transformedModels.sort((a, b) => b.auc - a.auc);

    // Get enzyme types as datasets (for compatibility)
    const enzymeTypesResponse = await fetch(`${API_BASE_URL}/metrics/enzyme/types`);
    let datasets = ['Dataset A', 'Dataset B', 'Dataset C']; // Default values
    
    if (enzymeTypesResponse.ok) {
      const enzymeTypesData = await enzymeTypesResponse.json();
      if (enzymeTypesData.success && enzymeTypesData.data?.enzymes) {
        datasets = enzymeTypesData.data.enzymes;
      }
    }

    const response = {
      models: transformedModels,
      datasets: datasets,
      metrics: [
        'aa_precision',
        'aa_recall', 
        'peptide_precision',
        'peptide_recall',
        'ptm_precision',
        'ptm_recall',
        'auc'
      ],
      enzymeData: enzymeMetrics, // Add enzyme data to response
      last_updated: new Date().toISOString(),
      total_models: transformedModels.length,
      categories: [...new Set(transformedModels.map(m => m.category))],
      status_counts: {
        active: transformedModels.filter(m => m.status === 'active').length,
        inactive: transformedModels.filter(m => m.status === 'inactive').length
      }
    };

    console.log(`Successfully fetched ${transformedModels.length} models and ${enzymeMetrics.length} enzyme metrics from backend`);

    return NextResponse.json(response, { 
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        'Content-Type': 'application/json'
      }
    });

  } catch (error) {
    console.error('Error fetching evaluation data from backend:', error);
    
    // If backend API fails, return error but don't use mock data
    return NextResponse.json(
      { 
        error: 'Failed to fetch evaluation data from backend',
        message: error instanceof Error ? error.message : 'Backend connection failed',
        models: [],
        datasets: [],
        metrics: [],
        enzymeData: [], // Add empty enzyme data
        last_updated: new Date().toISOString()
      },
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
}

export async function POST(request: NextRequest) {
  // Handle evaluation request submission
  try {
    const body = await request.json();
    
    // You can process the evaluation request here
    // This can handle more complex evaluation requests
    
    return NextResponse.json({
      success: true,
      message: 'Evaluation request received',
      data: body
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to process evaluation request' },
      { status: 500 }
    );
  }
} 