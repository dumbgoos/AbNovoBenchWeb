import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'http://backend:5000/api' 
  : 'http://localhost:5000/api';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const modelId = params.id;
    
    if (!modelId) {
      return NextResponse.json(
        {
          success: false,
          message: 'Model ID is required'
        },
        { status: 400 }
      );
    }
    
    // Get authorization header from the request
    const authHeader = request.headers.get('authorization');

    console.log('Frontend API proxy - deleting model in backend:', modelId);

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // Forward authorization header if present
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    const backendResponse = await fetch(`${API_BASE_URL}/models/${modelId}`, {
      method: 'DELETE',
      headers,
    });

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text();
      console.error('Backend models delete API error:', errorText);
      throw new Error(`Backend responded with status: ${backendResponse.status}`);
    }

    const backendData = await backendResponse.json();
    console.log('Frontend API proxy - model deleted in backend');

    return NextResponse.json(backendData, {
      status: backendResponse.status,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Frontend API proxy models delete error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to delete model in backend',
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

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const modelId = params.id;
    
    if (!modelId) {
      return NextResponse.json(
        {
          success: false,
          message: 'Model ID is required'
        },
        { status: 400 }
      );
    }

    const body = await request.json();
    
    // Get authorization header from the request
    const authHeader = request.headers.get('authorization');

    console.log('Frontend API proxy - updating model in backend:', modelId);

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // Forward authorization header if present
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    const backendResponse = await fetch(`${API_BASE_URL}/models/${modelId}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(body),
    });

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text();
      console.error('Backend models update API error:', errorText);
      throw new Error(`Backend responded with status: ${backendResponse.status}`);
    }

    const backendData = await backendResponse.json();
    console.log('Frontend API proxy - model updated in backend');

    return NextResponse.json(backendData, {
      status: backendResponse.status,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Frontend API proxy models update error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to update model in backend',
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

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const modelId = params.id;
    
    if (!modelId) {
      return NextResponse.json(
        {
          success: false,
          message: 'Model ID is required'
        },
        { status: 400 }
      );
    }
    
    // Get authorization header from the request
    const authHeader = request.headers.get('authorization');

    console.log('Frontend API proxy - getting model from backend:', modelId);

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // Forward authorization header if present
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    const backendResponse = await fetch(`${API_BASE_URL}/models/${modelId}`, {
      method: 'GET',
      headers,
    });

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text();
      console.error('Backend models get API error:', errorText);
      throw new Error(`Backend responded with status: ${backendResponse.status}`);
    }

    const backendData = await backendResponse.json();
    console.log('Frontend API proxy - model retrieved from backend');

    return NextResponse.json(backendData, {
      status: backendResponse.status,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Frontend API proxy models get error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to get model from backend',
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