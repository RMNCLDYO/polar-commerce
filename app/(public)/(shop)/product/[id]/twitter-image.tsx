import { fetchQuery } from 'convex/nextjs';
import { ImageResponse } from 'next/og';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';

export const runtime = 'edge';

async function getProductForOG(id: string) {
  try {
    return await fetchQuery(api.catalog.catalog.getProduct, {
      id: id as Id<'catalog'>,
    });
  } catch {
    return null;
  }
}

export const alt = 'Product Image';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default async function Image(props: PageProps<'/product/[id]'>) {
  const { id } = await props.params;
  const product = await getProductForOG(id);

  if (!product) {
    return new ImageResponse(
      (
        <div
          style={{
            fontSize: 128,
            background: 'black',
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
          }}
        >
          Product Not Found
        </div>
      ),
      {
        ...size,
      }
    );
  }

  const imageUrl =
    typeof product.image === 'string' ? product.image : (product.image as { src: string }).src;

  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(to bottom right, #000000, #1a1a1a)',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '80px',
          color: 'white',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            height: '100%',
            flex: 1,
            paddingRight: '60px',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
            }}
          >
            <div
              style={{
                fontSize: 24,
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.2em',
                color: '#888888',
              }}
            >
              {product.category}
            </div>
            <div
              style={{
                fontSize: 72,
                fontWeight: 700,
                lineHeight: 1.1,
                maxWidth: '600px',
              }}
            >
              {product.name}
            </div>
            <div
              style={{
                fontSize: 32,
                color: '#cccccc',
                maxWidth: '600px',
                lineHeight: 1.4,
              }}
            >
              {product.description}
            </div>
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '30px',
            }}
          >
            <div
              style={{
                fontSize: 56,
                fontWeight: 700,
              }}
            >
              {product.price}
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                fontSize: 24,
                color: product.inStock ? '#22c55e' : '#ef4444',
              }}
            >
              <div
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: '50%',
                  background: product.inStock ? '#22c55e' : '#ef4444',
                }}
              />
              {product.inStock ? 'In Stock' : 'Out of Stock'}
            </div>
          </div>
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '400px',
            height: '533px',
            borderRadius: '12px',
            overflow: 'hidden',
            background: 'white',
          }}
        >
          <img
            src={imageUrl}
            alt={product.name}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
