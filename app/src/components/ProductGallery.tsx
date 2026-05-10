"use client";

import { useState } from "react";
import { ProductImage } from "./ProductImage";

type Props = {
  images: string[];
  palette: { from: string; to: string };
  emoji: string;
  alt: string;
};

/**
 * 商品詳細ページのメイン画像 + サムネイル切替ギャラリー。
 *
 * 現状の商品データは imageUrl が 1 枚しかないので、images.length === 1 の時は
 * サムネイル列を出さず ProductImage 単独レンダーと同じ見た目になる。
 * 将来 PA-API / ブランド公式から複数アングル画像が入った時、images に複数 URL
 * を渡すだけでサムネ切替 UI が有効化する設計。
 */
export function ProductGallery({ images, palette, emoji, alt }: Props) {
  const [active, setActive] = useState(0);
  const main = images[active];

  return (
    <div className="space-y-3">
      <ProductImage
        palette={palette}
        emoji={emoji}
        imageUrl={main}
        alt={alt}
        size="lg"
      />
      {images.length > 1 && (
        <div
          className="flex gap-2 overflow-x-auto pb-1"
          style={{ scrollbarWidth: "none" }}
          role="tablist"
          aria-label={alt}
        >
          {images.map((url, i) => {
            const selected = i === active;
            return (
              <button
                key={`${url}-${i}`}
                type="button"
                onClick={() => setActive(i)}
                role="tab"
                aria-selected={selected}
                aria-label={`${alt} - ${i + 1}`}
                className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 transition-all ${
                  selected
                    ? "border-primary shadow-sm"
                    : "border-transparent opacity-70 hover:opacity-100"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt=""
                  width={64}
                  height={64}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover object-center"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
