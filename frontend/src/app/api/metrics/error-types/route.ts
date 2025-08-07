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

    // Build query string for backend request
    const backendParams = new URLSearchParams();
    backendParams.append('page', page);
    backendParams.append('limit', limit);

    console.log('Frontend API proxy - requesting error types metrics from backend:', `${API_BASE_URL}/metrics/error-types?${backendParams.toString()}`);

    // Forward request to backend API
    const backendResponse = await fetch(`${API_BASE_URL}/metrics/error-types?${backendParams.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!backendResponse.ok) {
      throw new Error(`Backend responded with status: ${backendResponse.status}`);
    }

    const backendData = await backendResponse.json();
    console.log('Frontend API proxy - received error types metrics from backend:', backendData.data?.metrics?.length || 0, 'metrics');

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
        message: 'Failed to fetch error types metrics from backend',
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
    
    console.log('Frontend API proxy - creating error types metric in backend');

    // Forward request to backend API
    const backendResponse = await fetch(`${API_BASE_URL}/metrics/error-types`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!backendResponse.ok) {
      throw new Error(`Backend responded with status: ${backendResponse.status}`);
    }

    const backendData = await backendResponse.json();
    console.log('Frontend API proxy - error types metric created in backend');

    return NextResponse.json(backendData, { 
      status: 201,
      headers: {
        'Content-Type': 'application/json'
      }
    });

  } catch (error) {
    console.error('Frontend API proxy error:', error);
    
    return NextResponse.json(
      { 
        success: false,
        message: 'Failed to create error types metric in backend',
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