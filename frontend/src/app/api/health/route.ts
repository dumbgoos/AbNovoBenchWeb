import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'http://backend:5000/api' 
  : 'http://localhost:5000/api';

export async function GET(request: NextRequest) {
  try {
    console.log('Frontend API proxy - health check request');
    
    const backendResponse = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const backendData = await backendResponse.json();
    
    console.log('Frontend API proxy - health check response status:', backendResponse.status);
    
    return NextResponse.json(backendData, {
      status: backendResponse.status,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Frontend API proxy health check error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Backend health check failed',
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