interface ImageLoaderProps {
  src: string;
  width: number;
  quality?: number;
}

export default function imageLoader({
  src,
  width,
  quality,
}: ImageLoaderProps): string {
  if (src.startsWith("data:")) {
    return src;
  }

  if (src.startsWith("blob:")) {
    return src;
  }

  if (src.startsWith("http://") || src.startsWith("https://")) {
    const url = new URL(src);
    url.searchParams.set("w", width.toString());
    if (quality) {
      url.searchParams.set("q", quality.toString());
    }
    return url.toString();
  }

  const separator = src.includes("?") ? "&" : "?";
  return `${src}${separator}w=${width}${quality ? `&q=${quality}` : ""}`;
}
