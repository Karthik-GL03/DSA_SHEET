import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const size = {
  width: 32,
  height: 32,
};
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #06b6d4 100%)',
          borderRadius: '8px',
          color: '#ffffff',
          fontWeight: 900,
          fontSize: '18px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
        }}
      >
        {"</>"}
      </div>
    ),
    {
      ...size,
    }
  );
}
