import 'server-only';
import { google } from '@ai-sdk/google';
import { generateText } from 'ai';
import { type NextRequest, NextResponse } from 'next/server';
import { getProductPrompt } from '@/lib/server/prompts/ai';
import { logger } from '@/lib/shared/logger';

/**
 * API Route for generating personalized model images using Google Gemini.
 * Uses GOOGLE_GENERATIVE_AI_API_KEY environment variable automatically via Vercel AI SDK.
 * This is a server-only route that handles virtual try-on image generation.
 */

async function convertImageToSupportedFormat(
  file: File,
): Promise<{ buffer: Buffer; mimeType: string }> {
  const supportedTypes = ['image/png', 'image/jpeg', 'image/webp'];

  if (supportedTypes.includes(file.type)) {
    const buffer = Buffer.from(await file.arrayBuffer());
    return {
      buffer,
      mimeType: file.type,
    };
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  return {
    buffer,
    mimeType: 'image/jpeg',
  };
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const userPhoto = formData.get('userPhoto') as File;
    const productImage = formData.get('productImage') as File;
    const productName = formData.get('productName') as string;
    const productCategory = formData.get('productCategory') as string;

    if (!userPhoto || !productImage || !productName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 },
      );
    }

    const convertedUserPhoto = await convertImageToSupportedFormat(userPhoto);

    const convertedProductImage =
      await convertImageToSupportedFormat(productImage);

    const prompt = getProductPrompt(productName, productCategory);

    const result = await generateText({
      model: google('gemini-2.5-flash-image-preview'),
      providerOptions: {
        google: {
          responseModalities: ['TEXT', 'IMAGE'],
        },
      },
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: prompt,
            },
            {
              type: 'image',
              image: convertedUserPhoto.buffer,
            },
            {
              type: 'image',
              image: convertedProductImage.buffer,
            },
          ],
        },
      ],
    });

    const imageFiles = result.files?.filter((f) =>
      f.mediaType?.startsWith('image/'),
    );

    if (!imageFiles || imageFiles.length === 0) {
      return NextResponse.json(
        { error: 'No image was generated' },
        { status: 500 },
      );
    }

    const generatedImage = imageFiles[0];

    if (!generatedImage) {
      return NextResponse.json(
        { error: 'Generated image data is invalid' },
        { status: 500 },
      );
    }

    const base64Image = `data:${generatedImage.mediaType};base64,${generatedImage.base64}`;

    return NextResponse.json({
      imageUrl: base64Image,
      productName,
      usage: result.usage,
    });
  } catch (error) {
    const { message, details, retryable } = logger.apiError(
      '/api/generate-model-image',
      error,
      500,
    );

    return NextResponse.json(
      {
        error: message,
        retryable,
        details,
      },
      {
        status:
          error instanceof Error && error.message.includes('timeout')
            ? 408
            : error instanceof Error && error.message.includes('network')
              ? 503
              : 500,
      },
    );
  }
}
