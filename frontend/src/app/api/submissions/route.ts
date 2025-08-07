import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'http://backend:5000/api' 
  : 'http://localhost:5000/api';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '10';

    // Get authorization header from the request
    const authHeader = request.headers.get('authorization');

    const backendParams = new URLSearchParams();
    backendParams.append('page', page);
    backendParams.append('limit', limit);

    console.log('Frontend API proxy - requesting submissions from backend:', `${API_BASE_URL}/submissions?${backendParams.toString()}`);

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // Forward authorization header if present
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    const backendResponse = await fetch(`${API_BASE_URL}/submissions?${backendParams.toString()}`, {
      method: 'GET',
      headers,
    });

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text();
      console.error('Backend submissions API error:', errorText);
      throw new Error(`Backend responded with status: ${backendResponse.status}`);
    }

    const backendData = await backendResponse.json();
    console.log('Frontend API proxy - received submissions from backend');

    return NextResponse.json(backendData, {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Frontend API proxy submissions error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch submissions from backend',
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

    console.log('Frontend API proxy - creating submission in backend');

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // Forward authorization header if present
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    const backendResponse = await fetch(`${API_BASE_URL}/submissions`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text();
      console.error('Backend submissions create API error:', errorText);
      throw new Error(`Backend responded with status: ${backendResponse.status}`);
    }

    const backendData = await backendResponse.json();
    console.log('Frontend API proxy - submission created in backend');

    return NextResponse.json(backendData, {
      status: backendResponse.status,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Frontend API proxy submissions create error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to create submission in backend',
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