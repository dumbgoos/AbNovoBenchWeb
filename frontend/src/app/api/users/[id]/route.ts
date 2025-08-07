import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'http://backend:5000/api' 
  : 'http://localhost:5000/api';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id;
    
    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: 'User ID is required'
        },
        { status: 400 }
      );
    }
    
    // Get authorization header from the request
    const authHeader = request.headers.get('authorization');

    console.log('Frontend API proxy - deleting user in backend:', userId);

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // Forward authorization header if present
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    const backendResponse = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: 'DELETE',
      headers,
    });

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text();
      console.error('Backend users delete API error:', errorText);
      throw new Error(`Backend responded with status: ${backendResponse.status}`);
    }

    const backendData = await backendResponse.json();
    console.log('Frontend API proxy - user deleted in backend');

    return NextResponse.json(backendData, {
      status: backendResponse.status,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Frontend API proxy users delete error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to delete user in backend',
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
    const userId = params.id;
    
    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: 'User ID is required'
        },
        { status: 400 }
      );
    }

    const body = await request.json();
    
    // Get authorization header from the request
    const authHeader = request.headers.get('authorization');

    console.log('Frontend API proxy - updating user in backend:', userId);

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // Forward authorization header if present
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    const backendResponse = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(body),
    });

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text();
      console.error('Backend users update API error:', errorText);
      throw new Error(`Backend responded with status: ${backendResponse.status}`);
    }

    const backendData = await backendResponse.json();
    console.log('Frontend API proxy - user updated in backend');

    return NextResponse.json(backendData, {
      status: backendResponse.status,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Frontend API proxy users update error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to update user in backend',
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
    const userId = params.id;
    
    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: 'User ID is required'
        },
        { status: 400 }
      );
    }
    
    // Get authorization header from the request
    const authHeader = request.headers.get('authorization');

    console.log('Frontend API proxy - getting user from backend:', userId);

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // Forward authorization header if present
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    const backendResponse = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: 'GET',
      headers,
    });

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text();
      console.error('Backend users get API error:', errorText);
      throw new Error(`Backend responded with status: ${backendResponse.status}`);
    }

    const backendData = await backendResponse.json();
    console.log('Frontend API proxy - user retrieved from backend');

    return NextResponse.json(backendData, {
      status: backendResponse.status,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Frontend API proxy users get error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to get user from backend',
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