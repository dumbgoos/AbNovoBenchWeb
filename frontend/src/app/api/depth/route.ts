import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const backendUrl = process.env.NODE_ENV === 'production' 
      ? 'http://backend:5000/api/depth'
      : 'http://localhost:5000/api/depth';
    
    console.log('Frontend API proxy - requesting depth data from backend:', backendUrl);
    
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('Backend response error:', response.status, response.statusText);
      return NextResponse.json(
        { error: 'Failed to fetch from backend' },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('Frontend API proxy - received depth data from backend:', data.data?.datasets?.length || 0, 'datasets');
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Frontend API proxy error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 