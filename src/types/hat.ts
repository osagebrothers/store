export type DecalType = 'image' | 'text';

export type PlacementZone =
  | 'front'
  | 'back'
  | 'left'
  | 'right'
  | 'brim-top'
  | 'brim-under'
  | 'rear-seam'
  | 'inside';

export interface Decal {
  id: string;
  type: DecalType;
  url?: string;
  text?: string;
  color?: string;
  font?: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  normal?: [number, number, number];
  spin?: number;
  zone?: PlacementZone;
  style?: TextStyle;
  targetMeshName?: string;
  targetParentName?: string;
}

export type TextStyle = 'flat' | 'embroidery' | 'gold-embroidery' | 'puff-3d';

export type Colorway = 'black' | 'white';

export interface HatConfig {
  id: string;
  colorway: Colorway;
  hatColor: string;
  bandColor?: string;
  texture?: string;
  text: string;
  backText?: string;
  brimText?: string;
  font: string;
  textColor: string;
  textStyle: TextStyle;
  size: 'S' | 'M' | 'L' | 'XL';
  countryCode?: string;
  countryName?: string;
  flagCode?: string;
  decals: Decal[];
}

export interface CartItem {
  hat: HatConfig;
  quantity: number;
}

export const HAT_PRICE = 50.0;

const BASE_URL = import.meta.env.BASE_URL || '/';

const INSIDE_LABEL_DECAL: Decal = {
  id: 'inside-out-out-label',
  type: 'image',
  url: `${BASE_URL}images/inside_label.png`,
  position: [0, 20, 60],
  rotation: [0, 0, 0],
  scale: [55, 30, 55],
  normal: [0, -1, 0.3],
  spin: 0,
  zone: 'inside',
  style: 'flat',
};

const FRONT_TEXT_DECAL: Decal = {
  id: 'front-mega-text',
  type: 'image',
  url: `${BASE_URL}images/mega_front_text.png`,
  position: [0, 58, 85],
  rotation: [0, 0, 0],
  scale: [105, 50, 105],
  normal: [0, 0.15, 1],
  spin: 0,
  zone: 'front',
  style: 'gold-embroidery',
};

// Back: eagle (viewer-left), crossed feathers (center, above snapback opening), panda (viewer-right).
// In back-of-hat camera view, world +X appears on viewer's LEFT, world -X on viewer's RIGHT.
// rotation [0, Math.PI, 0] orients the projection box to face the back; spin: 0 keeps the
// texture upright (spin: Math.PI was rotating it 180° which made everything upside down).
// Animals are pushed out to x=±46 so they sit on the lower side panels and clear the snapback gap.
const BACK_EAGLE_DECAL: Decal = {
  id: 'back-eagle',
  type: 'image',
  url: `${BASE_URL}images/eagle_decal.png`,
  position: [46, 22, -82],
  rotation: [0, Math.PI, 0],
  scale: [42, 30, 50],
  normal: [0, 0, -1],
  spin: 0,
  zone: 'back',
  style: 'embroidery',
};

const BACK_FEATHERS_DECAL: Decal = {
  id: 'back-crossed-feathers',
  type: 'image',
  url: `${BASE_URL}images/feathers_decal.png`,
  position: [0, 50, -88],
  rotation: [0, Math.PI, 0],
  scale: [34, 38, 50],
  normal: [0, 0, -1],
  spin: 0,
  zone: 'back',
  style: 'gold-embroidery',
};

const BACK_PANDA_DECAL: Decal = {
  id: 'back-panda',
  type: 'image',
  url: `${BASE_URL}images/panda_decal.png`,
  position: [-46, 22, -82],
  rotation: [0, Math.PI, 0],
  scale: [34, 34, 50],
  normal: [0, 0, -1],
  spin: 0,
  zone: 'back',
  style: 'embroidery',
};

export function buildHat(colorway: Colorway): HatConfig {
  const isBlack = colorway === 'black';
  return {
    id: `osage-${colorway}`,
    colorway,
    hatColor: isBlack ? '#000000' : '#FFFFFF',
    bandColor: isBlack ? '#000000' : '#FFFFFF',
    text: '',
    backText: '',
    brimText: '',
    font: 'Vinegar',
    textColor: '#FFD700',
    textStyle: 'gold-embroidery',
    size: 'M',
    decals: [
      FRONT_TEXT_DECAL,
      BACK_EAGLE_DECAL,
      BACK_FEATHERS_DECAL,
      BACK_PANDA_DECAL,
      INSIDE_LABEL_DECAL,
    ],
  };
}

export const HAT_BLACK: HatConfig = buildHat('black');
export const HAT_WHITE: HatConfig = buildHat('white');

export const DEFAULT_HAT: HatConfig = HAT_BLACK;
