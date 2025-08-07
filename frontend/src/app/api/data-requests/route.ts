import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'http://backend:5000/api' 
  : 'http://localhost:5000/api';

export async function POST(request: NextRequest) {
  try {
    console.log('Frontend API proxy - creating data request');
    
    const authHeader = request.headers.get('authorization');
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }
    
    const body = await request.json();
    
    const backendResponse = await fetch(`${API_BASE_URL}/data-requests`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    const backendData = await backendResponse.json();
    
    console.log('Frontend API proxy - data request response status:', backendResponse.status);
    
    return NextResponse.json(backendData, {
      status: backendResponse.status,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Frontend API proxy data request error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to create data request',
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

export async function GET(request: NextRequest) {
  try {
    console.log('Frontend API proxy - getting data requests');
    
    const authHeader = request.headers.get('authorization');
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }
    
    const url = new URL(request.url);
    const searchParams = url.searchParams.toString();
    const queryString = searchParams ? `?${searchParams}` : '';
    
    const backendResponse = await fetch(`${API_BASE_URL}/data-requests${queryString}`, {
      method: 'GET',
      headers,
    });

    const backendData = await backendResponse.json();
    
    console.log('Frontend API proxy - data requests response status:', backendResponse.status);
    
    return NextResponse.json(backendData, {
      status: backendResponse.status,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Frontend API proxy data requests error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to get data requests',
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