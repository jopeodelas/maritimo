// Centralized function for getting player image URLs
export const getPlayerImageUrl = (imageUrl: string): string => {
  console.log('=== getPlayerImageUrl GLOBAL ===');
  console.log('Input imageUrl:', imageUrl);
  
  if (!imageUrl) {
    console.log('No image URL provided, using default');
    return '/images/default-player.jpg';
  }
  
  let finalUrl = '';
  
  if (imageUrl.startsWith('/images/')) {
    // Old players - already have the correct path
    finalUrl = imageUrl;
    console.log('OLD PLAYER: Using existing path:', finalUrl);
  } else {
    // New players - construct the path for client static files
    finalUrl = `/images/${imageUrl}`;
    console.log('NEW PLAYER: Using client static files:', finalUrl);
  }
  
  console.log('FINAL URL:', finalUrl);
  return finalUrl;
}; 