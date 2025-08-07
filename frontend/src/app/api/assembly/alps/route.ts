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
    const limit = searchParams.get('limit') || '50';

    // Build query string for backend request
    const backendParams = new URLSearchParams();
    backendParams.append('page', page);
    backendParams.append('limit', limit);

    console.log('Frontend API proxy - requesting assembly alps from backend:', `${API_BASE_URL}/assembly/alps?${backendParams.toString()}`);

    // Forward request to backend API
    const backendResponse = await fetch(`${API_BASE_URL}/assembly/alps?${backendParams.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!backendResponse.ok) {
      throw new Error(`Backend responded with status: ${backendResponse.status}`);
    }

    const backendData = await backendResponse.json();
    console.log('Frontend API proxy - received assembly alps from backend');
    
    return NextResponse.json(backendData, {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Frontend API proxy assembly alps error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch assembly alps from backend',
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