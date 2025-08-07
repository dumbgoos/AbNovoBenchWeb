import { NextRequest, NextResponse } from 'next/server';

// Backend API base URL
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'http://backend:5000/api' 
  : 'http://localhost:5000/api';

export async function GET(request: NextRequest) {
  try {
    // Get query parameters from the request
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '100';
    const architecture = searchParams.get('architecture') || '';

    // Build query string for backend request
    const backendParams = new URLSearchParams();
    backendParams.append('page', page);
    backendParams.append('limit', limit);
    if (architecture) {
      backendParams.append('architecture', architecture);
    }

    console.log('Frontend API proxy - requesting models from backend:', `${API_BASE_URL}/models?${backendParams.toString()}`);

    // Forward request to backend API
    const backendResponse = await fetch(`${API_BASE_URL}/models?${backendParams.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!backendResponse.ok) {
      throw new Error(`Backend responded with status: ${backendResponse.status}`);
    }

    const backendData = await backendResponse.json();
    console.log('Frontend API proxy - received from backend:', backendData.data?.models?.length || 0, 'models');

    // Return the backend response
    return NextResponse.json(backendData, { 
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });

  } catch (error) {
    console.error('Frontend API proxy error:', error);
    
    return NextResponse.json(
      { 
        success: false,
        message: 'Failed to fetch models from backend',
        error: error instanceof Error ? error.message : 'Unknown error'
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
  try {
    const body = await request.json();
    
    // Get authorization header from the request
    const authHeader = request.headers.get('authorization');

    console.log('Frontend API proxy - creating model in backend');

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // Forward authorization header if present
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    const backendResponse = await fetch(`${API_BASE_URL}/models`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text();
      console.error('Backend models create API error:', errorText);
      throw new Error(`Backend responded with status: ${backendResponse.status}`);
    }

    const backendData = await backendResponse.json();
    console.log('Frontend API proxy - model created in backend');

    return NextResponse.json(backendData, {
      status: backendResponse.status,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Frontend API proxy models create error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to create model in backend',
        error: error instanceof Error ? error.message : 'Unknown error'
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