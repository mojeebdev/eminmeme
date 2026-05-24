export interface Meme {
  id: string;
  slug: string;
  prompt: string;
  x_handle: string | null;
  image_url: string | null;
  meme_output_url: string;
  meme_caption: string;
  top_text: string | null;
  bottom_text: string | null;
  created_at: string;
}

export interface GeneratePayload {
  prompt: string;
  xHandle?: string;
  imageBase64?: string;
  imageMimeType?: string;
}

export interface GenerateResponse {
  slug: string;
  meme_output_url: string;
  meme_caption: string;
}
