import { Car } from '../models/car.model';

type CarImageSet = {
  primary: string;
  gallery: string[];
};

const local = (fileName: string): string => `assets/car_images/${fileName}`;

const normalize = (value: string): string =>
  value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

const AMAZE_IMAGES: CarImageSet = {
  primary: local('amaze1.webp'),
  gallery: [local('amaze1.webp'), local('amaze2.webp'), local('amaze3.webp'), local('amaze4.webp')]
};

const CRYSTA_IMAGES: CarImageSet = {
  primary: local('crysta1.webp'),
  gallery: [local('crysta1.webp'), local('crysta2.webp'), local('crysta3.webp'), local('crysta4.webp')]
};

const HARRIER_IMAGES: CarImageSet = {
  primary: local('harrier1.jpeg'),
  gallery: [local('harrier1.jpeg'), local('harrier2.jpeg'), local('harrier3.jpeg'), local('harrier4.jpeg')]
};

const I20_IMAGES: CarImageSet = {
  primary: local('i201.webp'),
  gallery: [local('i201.webp'), local('i202.webp'), local('i203.webp'), local('i204.webp')]
};

const SCORPIO_IMAGES: CarImageSet = {
  primary: local('scorpio1.jpeg'),
  gallery: [local('scorpio1.jpeg'), local('scorpio2.jpeg'), local('scorpio3.jpeg'), local('scorpio4.jpeg')]
};

const SONET_IMAGES: CarImageSet = {
  primary: local('sonet1.jpeg'),
  gallery: [local('sonet1.jpeg'), local('sonet2.jpeg'), local('sonet3.jpeg'), local('sonet4.jpeg')]
};

const SWIFT_IMAGES: CarImageSet = {
  primary: local('swift1.jpeg'),
  gallery: [local('swift1.jpeg'), local('swift2.jpeg'), local('swift3.jpeg'), local('swift4.jpeg')]
};

const TAIGUN_IMAGES: CarImageSet = {
  primary: local('taigun1.jpeg'),
  gallery: [local('taigun1.jpeg'), local('taigun2.jpeg'), local('taigun3.jpeg'), local('taigun4.jpeg')]
};

const FALLBACK_CAR_IMAGES: CarImageSet = AMAZE_IMAGES;

const CAR_IMAGE_LIBRARY: Record<string, CarImageSet> = {
  // Honda
  'honda amaze': AMAZE_IMAGES,
  // Toyota
  'toyota innova crysta': CRYSTA_IMAGES,
  'toyota innova': CRYSTA_IMAGES,
  // Tata
  'tata harrier': HARRIER_IMAGES,
  // Hyundai
  'hyundai i20': I20_IMAGES,
  // Mahindra
  'mahindra scorpio': SCORPIO_IMAGES,
  'mahindra scorpio n': SCORPIO_IMAGES,
  'mahindra scorpio classic': SCORPIO_IMAGES,
  // Kia
  'kia sonet': SONET_IMAGES,
  // Maruti / Suzuki
  'maruti swift': SWIFT_IMAGES,
  'maruti suzuki swift': SWIFT_IMAGES,
  'suzuki swift': SWIFT_IMAGES,
  // Volkswagen
  'volkswagen taigun': TAIGUN_IMAGES,
  'vw taigun': TAIGUN_IMAGES,
};

const KEYWORD_MAP: Array<[string, CarImageSet]> = [
  ['amaze', AMAZE_IMAGES],
  ['crysta', CRYSTA_IMAGES],
  ['innova', CRYSTA_IMAGES],
  ['harrier', HARRIER_IMAGES],
  ['i20', I20_IMAGES],
  ['scorpio', SCORPIO_IMAGES],
  ['sonet', SONET_IMAGES],
  ['swift', SWIFT_IMAGES],
  ['taigun', TAIGUN_IMAGES],
];

function expandImages(images: string[], count: number): string[] {
  if (images.length === 0 || count <= 0) return [];
  return Array.from({ length: count }, (_, i) => images[i % images.length]);
}

export function getCarImageSet(car: Pick<Car, 'make' | 'model'>): CarImageSet {
  const key = normalize(`${car.make} ${car.model}`);
  if (CAR_IMAGE_LIBRARY[key]) return CAR_IMAGE_LIBRARY[key];

  const modelKey = normalize(car.model);
  for (const [keyword, images] of KEYWORD_MAP) {
    if (modelKey.includes(keyword)) return images;
  }

  return FALLBACK_CAR_IMAGES;
}

export function getCarPrimaryImage(car: Pick<Car, 'make' | 'model'>): string {
  return getCarImageSet(car).primary;
}

export function getCarGalleryImages(car: Pick<Car, 'make' | 'model'>, count = 4): string[] {
  return expandImages(getCarImageSet(car).gallery, count);
}

export const MARKETPLACE_HERO_IMAGE = CRYSTA_IMAGES.primary;
