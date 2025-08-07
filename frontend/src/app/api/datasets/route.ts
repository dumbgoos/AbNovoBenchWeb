import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'http://backend:5000/api' 
  : 'http://localhost:5000/api';

export async function GET(request: NextRequest) {
  try {
    console.log('Frontend API proxy - requesting datasets from backend');
    
    const url = new URL(request.url);
    const searchParams = url.searchParams.toString();
    const queryString = searchParams ? `?${searchParams}` : '';
    
    const backendResponse = await fetch(`${API_BASE_URL}/datasets${queryString}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!backendResponse.ok) {
      throw new Error(`Backend responded with status: ${backendResponse.status}`);
    }

    const backendData = await backendResponse.json();
    console.log('Frontend API proxy - received datasets from backend');
    
    return NextResponse.json(backendData, {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Frontend API proxy datasets error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch datasets from backend',
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

export async function HEAD(request: NextRequest) {
  try {
    console.log('Frontend API proxy - HEAD request for datasets');
    
    const backendResponse = await fetch(`${API_BASE_URL}/datasets`, {
      method: 'HEAD',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    return new NextResponse(null, {
      status: backendResponse.status,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Frontend API proxy datasets HEAD error:', error);
    return new NextResponse(null, {
      status: 500
    });
  }
} 