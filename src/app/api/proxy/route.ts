import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url');
  const noCache = request.nextUrl.searchParams.get('nocache') === '1';

  if (!url) {
    return new NextResponse('Missing URL parameter', { status: 400 });
  }

  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const headers = new Headers();
    headers.set('Content-Type', response.headers.get('Content-Type') || 'image/png');
    headers.set('Access-Control-Allow-Origin', '*');

    // Use no-cache for export captures, cache normally for previews
    if (noCache) {
      headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    } else {
      headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    }

    return new NextResponse(blob, {
      status: 200,
      headers: headers,
    });
  } catch (error) {
    console.error('Proxy error:', error);
    return new NextResponse('Failed to fetch image', { status: 500 });
  }
}
