import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'http://backend:5000/api' 
  : 'http://localhost:5000/api';

export async function GET(request: NextRequest) {
  try {
    console.log('Frontend API proxy - requesting leaderboard data (via metrics)');
    
    // Leaderboard might be an alias for all metrics
    const backendResponse = await fetch(`${API_BASE_URL}/metrics/all?page=1&limit=1000`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!backendResponse.ok) {
      throw new Error(`Backend responded with status: ${backendResponse.status}`);
    }

    const backendData = await backendResponse.json();
    console.log('Frontend API proxy - received leaderboard data from backend');
    
    return NextResponse.json(backendData, {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Frontend API proxy leaderboard error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch leaderboard data from backend',
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
    console.log('Frontend API proxy - HEAD request for leaderboard');
    
    const backendResponse = await fetch(`${API_BASE_URL}/metrics/all?page=1&limit=1`, {
      method: 'GET',
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
    console.error('Frontend API proxy leaderboard HEAD error:', error);
    return new NextResponse(null, {
      status: 500
    });
  }
} 