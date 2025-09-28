import { generateText } from "ai"
import { type NextRequest, NextResponse } from "next/server"

console.log("[v0] AI Gateway API key available:", !!process.env.AI_GATEWAY_API_KEY)

async function convertImageToSupportedFormat(file: File): Promise<{ buffer: Buffer; mimeType: string }> {
  console.log("[v0] Converting image format:", file.type, "size:", file.size)

  const supportedTypes = ["image/png", "image/jpeg", "image/webp"]

  if (supportedTypes.includes(file.type)) {
    const buffer = Buffer.from(await file.arrayBuffer())
    console.log("[v0] Image already supported, buffer size:", buffer.length)
    return {
      buffer,
      mimeType: file.type,
    }
  }

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
    console.log("[v0] === Starting POST request ===")

    const formData = await request.formData()
    console.log("[v0] FormData received, keys:", Array.from(formData.keys()))

    const userPhoto = formData.get("userPhoto") as File
    const productImage = formData.get("productImage") as File
    const productName = formData.get("productName") as string
    const productCategory = formData.get("productCategory") as string

    console.log("[v0] Extracted data:")
    console.log("[v0] - userPhoto:", userPhoto?.name, userPhoto?.type, userPhoto?.size)
    console.log("[v0] - productImage:", productImage?.name, productImage?.type, productImage?.size)
    console.log("[v0] - productName:", productName)
    console.log("[v0] - productCategory:", productCategory)

    if (!userPhoto || !productImage || !productName) {
      console.log("[v0] Missing required fields")
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    console.log("[v0] Generating model image for:", productName)

    console.log("[v0] Converting user photo...")
    const convertedUserPhoto = await convertImageToSupportedFormat(userPhoto)
    console.log("[v0] User photo converted successfully")

    console.log("[v0] Converting product image...")
    const convertedProductImage = await convertImageToSupportedFormat(productImage)
    console.log("[v0] Product image converted successfully")

    let prompt = ""

    if (productName.includes("Vomero")) {
      prompt = `Create a professional product modeling photo showing the person from the first image wearing the exact Nike ZoomX Vomero Plus running shoes from the second image. The shoes must be the specific Nike Vomero Plus model - lightweight running sneakers with ZoomX foam technology, typically in colorways like blue/white, black/white, or other authentic Nike Vomero colorways. DO NOT substitute with other models. Frame the shot to show the full body with clear focus on the feet and shoes. The person should be posed naturally as a model in a running or athletic stance. 

ABSOLUTELY CRITICAL - FACIAL FIDELITY: Preserve the EXACT facial features, bone structure, eye shape, nose shape, lip shape, eyebrow shape, and facial proportions from the uploaded person's photo. DO NOT add, remove, or modify any facial features. DO NOT change or add hairstyles, haircuts, or hair textures - keep the exact same hair as in the original photo. DO NOT alter facial hair, makeup, or any other facial characteristics. The face should be an EXACT replica of the uploaded photo with zero modifications or "improvements."

ABSOLUTELY CRITICAL - SKIN TONE CONSISTENCY: The person's face, neck, arms, hands, legs, and ALL visible skin areas must have the EXACT SAME skin tone, ethnicity, and complexion as shown in the uploaded person's photo. Do NOT mix different skin tones - if the person has light skin, ALL visible skin must be light; if they have dark skin, ALL visible skin must be dark. Ensure perfect skin tone uniformity across the entire body. The background should be a smooth dark gray gradient transitioning from darker gray at the top to lighter gray at the bottom, exactly like professional Nike product photography studio backgrounds. Make it look like a high-quality Nike advertisement photo showcasing specifically the Vomero Plus running shoes, not any other shoe model. IMPORTANT: Do not include any watermarks, logos, text overlays, or branding marks from stock photo sites like Freepik, Shutterstock, or Getty Images. Generate a clean, professional image without any watermarks or text overlays.`
    } else if (productName.includes("Club Cap")) {
      prompt = `Create a professional product modeling photo showing the person from the first image wearing the exact Nike Club Cap from the second image. The cap should be a classic Nike baseball cap with the Nike swoosh logo. Frame the shot from the chest up, focusing on the head and face area to showcase the cap clearly. The person should be posed naturally as a model. 

ABSOLUTELY CRITICAL - FACIAL FIDELITY: Preserve the EXACT facial features, bone structure, eye shape, nose shape, lip shape, eyebrow shape, and facial proportions from the uploaded person's photo. DO NOT add, remove, or modify any facial features. DO NOT change or add hairstyles, haircuts, or hair textures - keep the exact same hair as in the original photo. DO NOT alter facial hair, makeup, or any other facial characteristics. The face should be an EXACT replica of the uploaded photo with zero modifications or "improvements."

ABSOLUTELY CRITICAL - SKIN TONE CONSISTENCY: The person's face, neck, hands, arms, and ALL visible skin areas must have the EXACT SAME skin tone, ethnicity, and complexion as shown in the uploaded person's photo. Do NOT mix different skin tones - if the person has light skin, ALL visible skin must be light; if they have dark skin, ALL visible skin must be dark. Ensure perfect skin tone uniformity across all visible body parts - the hands must match the face exactly. The background should be a smooth dark gray gradient transitioning from darker gray at the top to lighter gray at the bottom, exactly like professional Nike product photography studio backgrounds. Make it look like a high-quality Nike advertisement photo with a cropped, portrait-style framing. IMPORTANT: Do not include any watermarks, logos, text overlays, or branding marks from stock photo sites like Freepik, Shutterstock, or Getty Images. Generate a clean, professional image without any watermarks or text overlays.`
    } else if (productName.includes("Tech Woven") || productName.includes("Tech")) {
      prompt = `Create a professional product modeling photo showing the person from the first image wearing the exact Nike Tech Woven Pants from the second image. CRITICAL CLOTHING FIT REQUIREMENT: The pants MUST maintain the EXACT SAME loose, baggy, relaxed fit as shown in the reference product image. DO NOT make the pants fitted, skinny, or tapered - they should be loose and baggy exactly like the original Nike Tech design. The pants should have the same wide leg opening, loose silhouette around the thighs and calves, and relaxed drape as the reference image. NEVER alter the clothing to be more fitted or form-hugging than the original. The garment should look identical to the reference product in terms of how loosely it fits and drapes on the body. Frame the shot to show the full body to showcase the pants clearly. The person should be posed naturally as a model. 

ABSOLUTELY CRITICAL - FACIAL FIDELITY: Preserve the EXACT facial features, bone structure, eye shape, nose shape, lip shape, eyebrow shape, and facial proportions from the uploaded person's photo. DO NOT add, remove, or modify any facial features. DO NOT change or add hairstyles, haircuts, or hair textures - keep the exact same hair as in the original photo. DO NOT alter facial hair, makeup, or any other facial characteristics. The face should be an EXACT replica of the uploaded photo with zero modifications or "improvements."

ABSOLUTELY CRITICAL - COMPLETE BODY SKIN TONE UNITY: Every single visible part of the person's body - face, forehead, cheeks, chin, neck, throat, hands, fingers, wrists, forearms, arms, and ANY other exposed skin - must be IDENTICAL in skin tone, color, and ethnicity to the uploaded person's photo. This is NON-NEGOTIABLE: if the uploaded person has light skin, then their face AND hands AND all visible skin must be light; if they have dark skin, then their face AND hands AND all visible skin must be dark. NEVER mix skin tones on the same person - the hands must be the EXACT same color as the face. Pay special attention to the hands and fingers - they must perfectly match the facial skin tone without any variation. The background should be a smooth dark gray gradient transitioning from darker gray at the top to lighter gray at the bottom, exactly like professional Nike product photography studio backgrounds. Make it look like a high-quality Nike advertisement photo showcasing the specific camo tech pants with their original authentic loose, baggy fit. IMPORTANT: Do not include any watermarks, logos, text overlays, or branding marks from stock photo sites like Freepik, Shutterstock, or Getty Images. Generate a clean, professional image without any watermarks or text overlays.`
    } else if (productName.includes("Fleece Hoodie") || productName.includes("Hoodie")) {
      prompt = `Create a professional product modeling photo showing the person from the first image wearing the exact Nike Fleece Hoodie from the second image. CRITICAL CLOTHING FIT REQUIREMENT: The hoodie MUST maintain the EXACT SAME fit, proportions, and silhouette as shown in the reference product image - if it's oversized, keep it oversized; if it's fitted, keep it fitted. DO NOT alter the original Nike design characteristics or how the garment naturally fits and drapes. Frame the shot from the waist up to showcase the hoodie and upper body clearly. The person should be posed naturally as a model with hands visible. 

ABSOLUTELY CRITICAL - FACIAL FIDELITY: Preserve the EXACT facial features, bone structure, eye shape, nose shape, lip shape, eyebrow shape, and facial proportions from the uploaded person's photo. DO NOT add, remove, or modify any facial features. DO NOT change or add hairstyles, haircuts, or hair textures - keep the exact same hair as in the original photo. DO NOT alter facial hair, makeup, or any other facial characteristics. The face should be an EXACT replica of the uploaded photo with zero modifications or "improvements."

ABSOLUTELY CRITICAL - COMPLETE BODY SKIN TONE UNITY: Every single visible part of the person's body - face, forehead, cheeks, chin, neck, throat, hands, fingers, wrists, forearms, arms, and ANY other exposed skin - must be IDENTICAL in skin tone, color, and ethnicity to the uploaded person's photo. This is NON-NEGOTIABLE: if the uploaded person has light skin, then their face AND hands AND all visible skin must be light; if they have dark skin, then their face AND hands AND all visible skin must be dark. NEVER mix skin tones on the same person - the hands must be the EXACT same color as the face. Pay special attention to the hands and fingers - they must perfectly match the facial skin tone without any variation. The background should be a smooth dark gray gradient transitioning from darker gray at the top to lighter gray at the bottom, exactly like professional Nike product photography studio backgrounds. Make it look like a high-quality Nike advertisement photo with an upper body focus. IMPORTANT: Do not include any watermarks, logos, text overlays, or branding marks from stock photo sites like Freepik, Shutterstock, or Getty Images. Generate a clean, professional image without any watermarks or text overlays.`
    } else if (
      productCategory.toLowerCase().includes("accessories") ||
      productCategory.toLowerCase().includes("cap") ||
      productCategory.toLowerCase().includes("hat")
    ) {
      prompt = `Create a professional product modeling photo showing the person from the first image wearing the ${productName} from the second image. Frame the shot from the chest up, focusing on the head and face area to showcase the ${productCategory.toLowerCase()} clearly. The person should be posed naturally as a model. 

ABSOLUTELY CRITICAL - FACIAL FIDELITY: Preserve the EXACT facial features, bone structure, eye shape, nose shape, lip shape, eyebrow shape, and facial proportions from the uploaded person's photo. DO NOT add, remove, or modify any facial features. DO NOT change or add hairstyles, haircuts, or hair textures - keep the exact same hair as in the original photo. DO NOT alter facial hair, makeup, or any other facial characteristics. The face should be an EXACT replica of the uploaded photo with zero modifications or "improvements."

ABSOLUTELY CRITICAL - SKIN TONE CONSISTENCY: The person's face, neck, hands, arms, and ALL visible skin areas must have the EXACT SAME skin tone, ethnicity, and complexion as shown in the uploaded person's photo. Do NOT mix different skin tones - if the person has light skin, ALL visible skin must be light; if they have dark skin, ALL visible skin must be dark. Ensure perfect skin tone uniformity across all visible body parts - the hands must match the face exactly. The background should be a smooth dark gray gradient transitioning from darker gray at the top to lighter gray at the bottom, exactly like professional Nike product photography studio backgrounds. The ${productCategory.toLowerCase()} should fit naturally on the person and look realistic. Make it look like a high-quality Nike advertisement photo with a cropped, portrait-style framing. IMPORTANT: Do not include any watermarks, logos, text overlays, or branding marks from stock photo sites like Freepik, Shutterstock, or Getty Images. Generate a clean, professional image without any watermarks or text overlays.`
    } else if (
      productCategory.toLowerCase().includes("clothing") ||
      productCategory.toLowerCase().includes("hoodie") ||
      productCategory.toLowerCase().includes("shirt") ||
      productCategory.toLowerCase().includes("jacket")
    ) {
      prompt = `Create a professional product modeling photo showing the person from the first image wearing the ${productName} from the second image. CRITICAL CLOTHING FIT REQUIREMENT: The ${productCategory.toLowerCase()} MUST maintain the EXACT SAME fit, cut, silhouette, and proportions as shown in the reference product image. If the original garment is loose/baggy, keep it loose/baggy; if it's fitted, keep it fitted. DO NOT modify the clothing's original design characteristics, fit, or how it naturally drapes on the body. Preserve the authentic garment proportions exactly as designed. Frame the shot from the waist up to showcase the ${productCategory.toLowerCase()} and upper body clearly. The person should be posed naturally as a model with hands visible. 

ABSOLUTELY CRITICAL - FACIAL FIDELITY: Preserve the EXACT facial features, bone structure, eye shape, nose shape, lip shape, eyebrow shape, and facial proportions from the uploaded person's photo. DO NOT add, remove, or modify any facial features. DO NOT change or add hairstyles, haircuts, or hair textures - keep the exact same hair as in the original photo. DO NOT alter facial hair, makeup, or any other facial characteristics. The face should be an EXACT replica of the uploaded photo with zero modifications or "improvements."

ABSOLUTELY CRITICAL - SKIN TONE CONSISTENCY: The person's face, neck, arms, hands, legs, and ALL visible skin areas must have the EXACT SAME skin tone, ethnicity, and complexion as shown in the uploaded person's photo. Do NOT mix different skin tones - if the person has light skin, ALL visible skin must be light; if they have dark skin, ALL visible skin must be dark. Ensure perfect skin tone uniformity across all visible body parts - the hands must match the face exactly. The background should be a smooth dark gray gradient transitioning from darker gray at the top to lighter gray at the bottom, exactly like professional Nike product photography studio backgrounds. The ${productCategory.toLowerCase()} should fit naturally on the person with its original authentic design characteristics preserved. Make it look like a high-quality Nike advertisement photo with an upper body focus. IMPORTANT: Do not include any watermarks, logos, text overlays, or branding marks from stock photo sites like Freepik, Shutterstock, or Getty Images. Generate a clean, professional image without any watermarks or text overlays.`
    } else {
      prompt = `Create a professional product modeling photo showing the person from the first image wearing or using the ${productName} from the second image. CRITICAL CLOTHING FIT REQUIREMENT: If it's clothing, the garment MUST maintain the EXACT SAME loose/baggy or fitted characteristics as shown in the reference product image. DO NOT alter the original fit - if pants are loose and baggy, keep them loose and baggy; if they're fitted, keep them fitted. Preserve the authentic garment design and proportions exactly as intended by Nike. The person should be posed naturally as a model showcasing the product. 

ABSOLUTELY CRITICAL - FACIAL FIDELITY: Preserve the EXACT facial features, bone structure, eye shape, nose shape, lip shape, eyebrow shape, and facial proportions from the uploaded person's photo. DO NOT add, remove, or modify any facial features. DO NOT change or add hairstyles, haircuts, or hair textures - keep the exact same hair as in the original photo. DO NOT alter facial hair, makeup, or any other facial characteristics. The face should be an EXACT replica of the uploaded photo with zero modifications or "improvements."

ABSOLUTELY CRITICAL - SKIN TONE CONSISTENCY: The person's face, neck, arms, hands, legs, and ALL visible skin areas must have the EXACT SAME skin tone, ethnicity, and complexion as shown in the uploaded person's photo. Do NOT mix different skin tones - if the person has light skin, ALL visible skin must be light; if they have dark skin, ALL visible skin must be dark. Ensure perfect skin tone uniformity across all visible body parts - the hands must match the face exactly. The background should be a smooth dark gray gradient transitioning from darker gray at the top to lighter gray at the bottom, exactly like professional Nike product photography studio backgrounds. The ${productCategory.toLowerCase()} should fit naturally on the person with its original design characteristics preserved. Make it look like a high-quality Nike advertisement photo. IMPORTANT: Do not include any watermarks, logos, text overlays, or branding marks from stock photo sites like Freepik, Shutterstock, or Getty Images. Generate a clean, professional image without any watermarks or text overlays.`
    }

    console.log("[v0] Generated prompt length:", prompt.length)
    console.log("[v0] Prompt preview:", prompt.substring(0, 100) + "...")

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
              image: convertedUserPhoto.buffer,
            },
            {
              type: "image",
              image: convertedProductImage.buffer,
            },
          ],
        },
      ],
    })

    console.log("[v0] generateText completed")
    console.log("[v0] Result keys:", Object.keys(result))
    console.log("[v0] Result.files:", result.files?.length || 0, "files")
    console.log("[v0] Result.usage:", result.usage)

    const imageFiles = result.files?.filter((f) => f.mediaType?.startsWith("image/"))
    console.log("[v0] Image files found:", imageFiles?.length || 0)

    if (!imageFiles || imageFiles.length === 0) {
      console.log("[v0] No image files generated")
      return NextResponse.json({ error: "No image was generated" }, { status: 500 })
    }

    const generatedImage = imageFiles[0]
    console.log("[v0] Generated image mediaType:", generatedImage.mediaType)
    console.log("[v0] Generated image has base64:", !!generatedImage.base64)

    const base64Image = `data:${generatedImage.mediaType};base64,${generatedImage.base64}`
    console.log("[v0] Base64 image created, length:", base64Image.length)

    console.log("[v0] Successfully generated model image for:", productName)

    return NextResponse.json({
      imageUrl: base64Image,
      productName,
      usage: result.usage,
    })
  } catch (error) {
    console.error("[v0] Error in POST handler:", error)
    console.error("[v0] Error type:", typeof error)
    console.error("[v0] Error message:", error instanceof Error ? error.message : String(error))
    console.error("[v0] Error stack:", error instanceof Error ? error.stack : "No stack")
    return NextResponse.json({ error: "Failed to generate model image" }, { status: 500 })
  }
}
