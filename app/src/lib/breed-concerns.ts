/**
 * 犬種 → 関連 concern ID マッピング。
 *
 * breeds.ts (200+ 犬種) の全件に concern を埋めるのは現実的でないため、
 *  - 国内で多い人気犬種 (popular: true 中心) は手動で 3-6 件指定
 *  - それ以外は size + coat から推測 (fallbackBySize / fallbackByCoat)
 * の二段階で解決する。
 *
 * /breeds/[id] LP の buildFeedItems multi-concern OR フィルタ、および
 * /my-dog の「うちの子」 推薦の元データ。
 */

import { type Breed, type BreedSize } from "./breeds";

/** 人気犬種は手動指定。LP 表示順に影響するので「最も関係が深い」を先頭に。 */
const MANUAL: Record<string, string[]> = {
  chihuahua: ["small-breed", "cold-winter", "anxiety-general", "dental-care"],
  pomeranian: ["small-breed", "heavy-shedding", "barking", "cute-outing"],
  maltese: ["small-breed", "long-coat-grooming", "tear-stains-care", "cute-outing"],
  yorkie: ["small-breed", "long-coat-grooming", "barking", "cute-outing"],
  "miniature-pinscher": ["small-breed", "cold-winter", "jumps-on-people", "active-sports"],
  "toy-poodle": ["small-breed", "long-coat-grooming", "dental-care", "cute-outing"],
  "miniature-poodle": ["small-breed", "long-coat-grooming", "dental-care"],
  dachshund: ["long-back", "pulls-leash", "weight-management", "small-breed"],
  "dachshund-mini": ["long-back", "pulls-leash", "weight-management", "small-breed"],
  "dachshund-wire": ["long-back", "pulls-leash", "weight-management"],
  "dachshund-long": ["long-back", "long-coat-grooming", "weight-management"],
  "french-bulldog": ["hot-summer", "asphalt-hot", "dental-care", "biting-habit"],
  pug: ["hot-summer", "asphalt-hot", "weight-management", "dental-care"],
  "shih-tzu": ["small-breed", "long-coat-grooming", "tear-stains-care", "brushing-hates"],
  "miniature-schnauzer": ["small-breed", "scavenging", "dental-care", "long-coat-grooming"],
  cavalier: ["small-breed", "long-coat-grooming", "dirty-ears", "dental-care"],
  "bichon-frise": ["small-breed", "long-coat-grooming", "tear-stains-care"],
  "boston-terrier": ["hot-summer", "dental-care", "biting-habit"],
  pekingese: ["small-breed", "hot-summer", "tear-stains-care"],
  shiba: ["heavy-shedding", "hot-summer", "barking", "wont-walk"],
  "shiba-mame": ["small-breed", "heavy-shedding", "wont-walk"],
  corgi: ["long-back", "heavy-shedding", "weight-management", "pulls-leash"],
  "cardigan-corgi": ["long-back", "heavy-shedding", "weight-management"],
  beagle: ["scavenging", "weight-management", "picky-eater", "pulls-leash"],
  "border-collie": ["active-sports", "dog-run", "biting-habit", "long-walker"],
  sheltie: ["heavy-shedding", "long-coat-grooming", "barking", "active-sports"],
  "english-bulldog": ["hot-summer", "weight-management", "asphalt-hot", "dental-care"],
  whippet: ["cold-winter", "active-sports", "long-walker"],
  "golden-retriever": ["heavy-shedding", "destroys-toys", "long-walker", "active-sports", "dog-run"],
  labrador: ["heavy-shedding", "weight-management", "destroys-toys", "long-walker", "active-sports"],
  husky: ["heavy-shedding", "hot-summer", "active-sports", "destroys-toys"],
  "german-shepherd": ["active-sports", "heavy-shedding", "destroys-toys", "long-walker"],
  doberman: ["cold-winter", "active-sports", "long-walker"],
  rottweiler: ["destroys-toys", "weight-management", "active-sports"],
  "standard-poodle": ["long-coat-grooming", "active-sports", "long-walker"],
  samoyed: ["heavy-shedding", "hot-summer", "long-coat-grooming"],
  boxer: ["hot-summer", "active-sports", "destroys-toys", "weight-management"],
  akita: ["heavy-shedding", "cold-winter", "long-walker"],
  "american-akita": ["heavy-shedding", "cold-winter", "destroys-toys"],
  "alaskan-malamute": ["heavy-shedding", "hot-summer", "destroys-toys", "long-walker"],
  bernese: ["heavy-shedding", "hot-summer", "long-walker"],
  dalmatian: ["active-sports", "heavy-shedding", "long-walker"],
  labradoodle: ["long-coat-grooming", "active-sports", "destroys-toys"],
  goldendoodle: ["long-coat-grooming", "active-sports", "destroys-toys"],
  bernedoodle: ["long-coat-grooming", "active-sports"],
  maltipoo: ["small-breed", "long-coat-grooming", "tear-stains-care"],
  cavapoo: ["small-breed", "long-coat-grooming", "cute-outing"],
  pomsky: ["small-breed", "heavy-shedding", "active-sports"],
  cockapoo: ["small-breed", "long-coat-grooming", "cute-outing"],
  // mix系のフォールバック
  mix: ["mix-fit", "weight-management"],
  "unknown-tiny": ["small-breed"],
  "unknown-small": ["small-breed"],
  "unknown-medium": ["mix-fit", "weight-management"],
  "unknown-large": ["heavy-shedding", "long-walker"],
  "unknown-giant": ["heavy-shedding", "long-walker"],
};

/** size 別フォールバック (手動指定が無い犬種用) */
const fallbackBySize: Record<BreedSize, string[]> = {
  tiny: ["small-breed", "cold-winter"],
  small: ["small-breed"],
  medium: ["weight-management"],
  large: ["heavy-shedding", "long-walker"],
  giant: ["heavy-shedding", "destroys-toys"],
};

export function getBreedConcerns(breed: Breed): string[] {
  const manual = MANUAL[breed.id];
  if (manual) return manual;
  return fallbackBySize[breed.size];
}
