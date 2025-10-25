import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'Polar Commerce - E-commerce Platform';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(to bottom right, #000000, #1a1a1a)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '80px',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '32px',
          }}
        >
          <div
            style={{
              fontSize: 72,
              fontWeight: 'bold',
              color: 'white',
              letterSpacing: '-0.05em',
            }}
          >
            Polar Commerce
          </div>
          <div
            style={{
              fontSize: 32,
              color: '#a3a3a3',
              textAlign: 'center',
              maxWidth: '800px',
            }}
          >
            Experimental e-commerce platform built with Next.js 16, Convex,
            Better Auth, and Polar
          </div>
          <div
            style={{
              display: 'flex',
              gap: '16px',
              fontSize: 20,
              color: '#737373',
            }}
          >
            <span>Next.js 16</span>
            <span>•</span>
            <span>React 19.2</span>
            <span>•</span>
            <span>Convex</span>
            <span>•</span>
            <span>Better Auth</span>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
