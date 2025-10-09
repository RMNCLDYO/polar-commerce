import 'server-only';

/**
 * Product modeling prompts for AI image generation
 * Each prompt ensures consistent facial fidelity and skin tone preservation
 */

const BASE_PROMPT_RULES = `
ABSOLUTELY CRITICAL - FACIAL FIDELITY: Preserve the EXACT facial features, bone structure, eye shape, nose shape, lip shape, eyebrow shape, and facial proportions from the uploaded person's photo. DO NOT add, remove, or modify any facial features. DO NOT change or add hairstyles, haircuts, or hair textures - keep the exact same hair as in the original photo. DO NOT alter facial hair, makeup, or any other facial characteristics. The face should be an EXACT replica of the uploaded photo with zero modifications or "improvements."

ABSOLUTELY CRITICAL - SKIN TONE CONSISTENCY: The person's face, neck, arms, hands, legs, and ALL visible skin areas must have the EXACT SAME skin tone, ethnicity, and complexion as shown in the uploaded person's photo. Do NOT mix different skin tones - if the person has light skin, ALL visible skin must be light; if they have dark skin, ALL visible skin must be dark. Ensure perfect skin tone uniformity across the entire body.

The background should be a smooth dark gray gradient transitioning from darker gray at the top to lighter gray at the bottom, exactly like professional Nike product photography studio backgrounds.

IMPORTANT: Do not include any watermarks, logos, text overlays, or branding marks from stock photo sites like Freepik, Shutterstock, or Getty Images. Generate a clean, professional image without any watermarks or text overlays.`;

const CLOTHING_FIT_RULE = `CRITICAL CLOTHING FIT REQUIREMENT: The garment MUST maintain the EXACT SAME fit, proportions, and silhouette as shown in the reference product image - if it's oversized, keep it oversized; if it's fitted, keep it fitted. DO NOT alter the original Nike design characteristics or how the garment naturally fits and drapes.`;

const productPrompts: Record<string, string> = {
  vomero: `Create a professional product modeling photo showing the person from the first image wearing the exact Nike ZoomX Vomero Plus running shoes from the second image. The shoes must be the specific Nike Vomero Plus model - lightweight running sneakers with ZoomX foam technology, typically in colorways like blue/white, black/white, or other authentic Nike Vomero colorways. DO NOT substitute with other models. Frame the shot to show the full body with clear focus on the feet and shoes. The person should be posed naturally as a model in a running or athletic stance.
${BASE_PROMPT_RULES}
Make it look like a high-quality Nike advertisement photo showcasing specifically the Vomero Plus running shoes, not any other shoe model.`,

  cap: `Create a professional product modeling photo showing the person from the first image wearing the exact Nike Club Cap from the second image. The cap should be a classic Nike baseball cap with the Nike swoosh logo. Frame the shot from the chest up, focusing on the head and face area to showcase the cap clearly. The person should be posed naturally as a model.
${BASE_PROMPT_RULES}
Make it look like a high-quality Nike advertisement photo with a cropped, portrait-style framing.`,

  tech: `Create a professional product modeling photo showing the person from the first image wearing the exact Nike Tech Woven Pants from the second image. ${CLOTHING_FIT_RULE} The pants MUST maintain the EXACT SAME loose, baggy, relaxed fit as shown in the reference product image. DO NOT make the pants fitted, skinny, or tapered - they should be loose and baggy exactly like the original Nike Tech design. The pants should have the same wide leg opening, loose silhouette around the thighs and calves, and relaxed drape as the reference image. Frame the shot to show the full body to showcase the pants clearly. The person should be posed naturally as a model.
${BASE_PROMPT_RULES}
ABSOLUTELY CRITICAL - COMPLETE BODY SKIN TONE UNITY: Every single visible part of the person's body - face, forehead, cheeks, chin, neck, throat, hands, fingers, wrists, forearms, arms, and ANY other exposed skin - must be IDENTICAL in skin tone, color, and ethnicity to the uploaded person's photo. Pay special attention to the hands and fingers - they must perfectly match the facial skin tone without any variation.
Make it look like a high-quality Nike advertisement photo showcasing the specific camo tech pants with their original authentic loose, baggy fit.`,

  hoodie: `Create a professional product modeling photo showing the person from the first image wearing the exact Nike Fleece Hoodie from the second image. ${CLOTHING_FIT_RULE} Frame the shot from the waist up to showcase the hoodie and upper body clearly. The person should be posed naturally as a model with hands visible.
${BASE_PROMPT_RULES}
ABSOLUTELY CRITICAL - COMPLETE BODY SKIN TONE UNITY: Every single visible part of the person's body - face, forehead, cheeks, chin, neck, throat, hands, fingers, wrists, forearms, arms, and ANY other exposed skin - must be IDENTICAL in skin tone, color, and ethnicity to the uploaded person's photo. Pay special attention to the hands and fingers - they must perfectly match the facial skin tone without any variation.
Make it look like a high-quality Nike advertisement photo with an upper body focus.`,
};

/**
 * Get the appropriate prompt for product modeling based on product name and category
 */
export function getProductPrompt(
  productName: string,
  productCategory: string,
): string {
  const nameLower = productName.toLowerCase();
  const categoryLower = productCategory.toLowerCase();

  // Check for specific product types
  if (nameLower.includes('vomero')) {
    return productPrompts.vomero || '';
  }

  if (nameLower.includes('club cap')) {
    return productPrompts.cap || '';
  }

  if (nameLower.includes('tech woven') || nameLower.includes('tech')) {
    return productPrompts.tech || '';
  }

  if (nameLower.includes('fleece hoodie') || nameLower.includes('hoodie')) {
    return productPrompts.hoodie || '';
  }

  // Category-based fallbacks
  if (
    categoryLower.includes('accessories') ||
    categoryLower.includes('cap') ||
    categoryLower.includes('hat')
  ) {
    return `Create a professional product modeling photo showing the person from the first image wearing the ${productName} from the second image. Frame the shot from the chest up, focusing on the head and face area to showcase the ${categoryLower} clearly. The person should be posed naturally as a model.
${BASE_PROMPT_RULES}
The ${categoryLower} should fit naturally on the person and look realistic. Make it look like a high-quality Nike advertisement photo with a cropped, portrait-style framing.`;
  }

  if (
    categoryLower.includes('clothing') ||
    categoryLower.includes('hoodie') ||
    categoryLower.includes('shirt') ||
    categoryLower.includes('jacket')
  ) {
    return `Create a professional product modeling photo showing the person from the first image wearing the ${productName} from the second image. ${CLOTHING_FIT_RULE} Frame the shot from the waist up to showcase the ${categoryLower} and upper body clearly. The person should be posed naturally as a model with hands visible.
${BASE_PROMPT_RULES}
The ${categoryLower} should fit naturally on the person with its original authentic design characteristics preserved. Make it look like a high-quality Nike advertisement photo with an upper body focus.`;
  }

  // Generic fallback
  return `Create a professional product modeling photo showing the person from the first image wearing or using the ${productName} from the second image. ${CLOTHING_FIT_RULE} The person should be posed naturally as a model showcasing the product.
${BASE_PROMPT_RULES}
The ${categoryLower} should fit naturally on the person with its original design characteristics preserved. Make it look like a high-quality Nike advertisement photo.`;
}

/**
 * Get prompt for product mashup generation
 */
export function getProductMashupPrompt(): string {
  return `Create a high-quality product mashup image combining elements from both input images. Blend the style, colors, and key features of both products into a new, cohesive design. The result should look like a professional Nike product photo with a studio background. Maintain the quality and aesthetic of premium sportswear photography.
${BASE_PROMPT_RULES}`;
}
