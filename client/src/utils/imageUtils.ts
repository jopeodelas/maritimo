// Função para normalizar nomes de arquivo (remover acentos, etc.)
const normalizeFileName = (filename: string): string => {
  return filename
    .toLowerCase()
    .normalize('NFD') // Decompor caracteres acentuados
    .replace(/[\u0300-\u036f]/g, '') // Remover diacríticos
    .replace(/ç/g, 'c') // Cedilha específica
    .replace(/[^a-z0-9.-]/g, '-') // Substituir caracteres especiais por hífen
    .replace(/-+/g, '-') // Múltiplos hífens por um só
    .replace(/^-|-$/g, ''); // Remover hífens no início/fim
};

// Lista de variações possíveis para nomes problemáticos
const getImageVariations = (imageUrl: string): string[] => {
  if (!imageUrl) return [];

  const variations: string[] = [];
  const baseName = imageUrl.replace(/^\/images\//, '').replace(/\.(png|jpg|jpeg|webp)$/i, '');
  
  // Adicionar original
  variations.push(imageUrl);
  
  // Adicionar versão normalizada
  const normalized = `/images/${normalizeFileName(baseName)}.png`;
  if (normalized !== imageUrl) {
    variations.push(normalized);
  }
  
  // Adicionar variações específicas conhecidas
  const knownMappings: { [key: string]: string } = {
    'goncalo-tabuaco': 'goncalo-tabuaco.png',
    'gonçalo-tabuaço': 'goncalo-tabuaco.png',
    'tomas-domingos': 'tomas-domingos.png',
    'tomás-domingos': 'tomas-domingos.png',
    'francisco-franca': 'francisco-franca.png',
    'francisco-frança': 'francisco-franca.png',
  };
  
  const normalizedBase = normalizeFileName(baseName);
  if (knownMappings[normalizedBase]) {
    variations.push(`/images/${knownMappings[normalizedBase]}`);
  }
  
  return [...new Set(variations)]; // Remover duplicatas
};

// Centralized function for getting player image URLs
export const getPlayerImageUrl = (imageUrl: string): string => {
  console.log('=== getPlayerImageUrl GLOBAL ===');
  console.log('Input imageUrl:', imageUrl);
  
  if (!imageUrl) {
    console.log('No image URL provided, using default');
    return '/images/default-player.png';
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

// Função para tentar carregar uma imagem e retornar a primeira que funciona
export const getWorkingImageUrl = async (imageUrl: string): Promise<string> => {
  const variations = getImageVariations(getPlayerImageUrl(imageUrl));
  
  console.log('Testing image variations:', variations);
  
  for (const variation of variations) {
    try {
      const response = await fetch(variation, { method: 'HEAD' });
      if (response.ok) {
        console.log('Working image found:', variation);
        return variation;
      }
    } catch (error) {
      console.log('Failed to load:', variation);
      continue;
    }
  }
  
  console.log('No working image found, using default');
  return '/images/default-player.png';
}; 