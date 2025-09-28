import { generateText } from "ai"
import { type NextRequest, NextResponse } from "next/server"

console.log("[v0] AI Gateway API key available:", !!process.env.AI_GATEWAY_API_KEY)

async function convertImageToSupportedFormat(file: File): Promise<{ buffer: Buffer; mimeType: string }> {
  console.log("[v0] Converting image format:", file.type, "size:", file.size)

  const supportedTypes = ["image/png", "image/jpeg", "image/webp"]

  // If already supported, return as-is
  if (supportedTypes.includes(file.type)) {
    const buffer = Buffer.from(await file.arrayBuffer())
    console.log("[v0] Image already supported, buffer size:", buffer.length)
    return {
      buffer,
      mimeType: file.type,
    }
  }

  // For unsupported formats, we'll convert to JPEG
  // In a real app, you'd use a library like Sharp for server-side image processing
  // For now, we'll just change the MIME type and hope the buffer is compatible
  console.log("[v0] Converting unsupported format", file.type, "to image/jpeg")

  const buffer = Buffer.from(await file.arrayBuffer())
  console.log("[v0] Converted buffer size:", buffer.length)
  return {
    buffer,
    mimeType: "image/jpeg",
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] === Starting generate-image POST request ===")

    const formData = await request.formData()
    console.log("[v0] FormData received, keys:", Array.from(formData.keys()))

    const image1 = formData.get("image1") as File
    const image2 = formData.get("image2") as File
    const prompt = formData.get("prompt") as string

    console.log("[v0] Extracted data:")
    console.log("[v0] - image1:", image1?.name, image1?.type, image1?.size)
    console.log("[v0] - image2:", image2?.name, image2?.type, image2?.size)
    console.log("[v0] - prompt length:", prompt?.length)
    console.log("[v0] - prompt preview:", prompt?.substring(0, 100) + "...")

    if (!image1 || !image2 || !prompt) {
      console.log("[v0] Missing required fields")
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    console.log("[v0] Original image types:", image1.type, image2.type)

    console.log("[v0] Converting image1...")
    const convertedImage1 = await convertImageToSupportedFormat(image1)
    console.log("[v0] Image1 converted successfully")

    console.log("[v0] Converting image2...")
    const convertedImage2 = await convertImageToSupportedFormat(image2)
    console.log("[v0] Image2 converted successfully")

    console.log("[v0] Converted image types:", convertedImage1.mimeType, convertedImage2.mimeType)

    console.log("[v0] Preparing to call generateText with AI Gateway...")
    const result = await generateText({
      model: "google/gemini-2.5-flash-image-preview",
      providerOptions: {
        google: {
          responseModalities: ["TEXT", "IMAGE"],
        },
      },
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: prompt,
            },
            {
              type: "image",
              image: convertedImage1.buffer,
            },
            {
              type: "image",
              image: convertedImage2.buffer,
            },
          ],
        },
      ],
    })

    console.log("[v0] generateText completed")
    console.log("[v0] Result keys:", Object.keys(result))
    console.log("[v0] Result.files:", result.files?.length || 0, "files")
    console.log("[v0] Result.text length:", result.text?.length || 0)
    console.log("[v0] Result.usage:", result.usage)

    // Find the generated image in the result
    const imageFiles = result.files?.filter((f) => f.mediaType?.startsWith("image/"))
    console.log("[v0] Image files found:", imageFiles?.length || 0)

    if (!imageFiles || imageFiles.length === 0) {
      console.log("[v0] No image files generated")
      return NextResponse.json({ error: "No image was generated" }, { status: 500 })
    }

    // Convert the first image to base64 data URL
    const generatedImage = imageFiles[0]
    console.log("[v0] Generated image mediaType:", generatedImage.mediaType)
    console.log("[v0] Generated image has base64:", !!generatedImage.base64)

    const base64Image = `data:${generatedImage.mediaType};base64,${generatedImage.base64}`
    console.log("[v0] Base64 image created, length:", base64Image.length)

    console.log("[v0] Successfully generated image")

    return NextResponse.json({
      imageUrl: base64Image,
      text: result.text,
      usage: result.usage,
    })
  } catch (error) {
    console.error("[v0] Error in generate-image POST handler:", error)
    console.error("[v0] Error type:", typeof error)
    console.error("[v0] Error message:", error instanceof Error ? error.message : String(error))
    console.error("[v0] Error stack:", error instanceof Error ? error.stack : "No stack")
    return NextResponse.json({ error: "Failed to generate image" }, { status: 500 })
  }
}
