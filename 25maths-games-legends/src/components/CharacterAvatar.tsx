import { memo } from 'react';
import { motion } from 'motion/react';

const AVATAR_IMAGES: Record<string, string> = {
  caocao: './avatars/caocao.png',
  liubei: './avatars/liubei.png',
  guanyu: './avatars/guanyu.png',
  zhugeliang: './avatars/zhugeliang.png',
  sunquan: './avatars/sunquan.png',
  diaochan: './avatars/diaochan.png',
};

export const CharacterAvatar = memo(function CharacterAvatar({
  characterId,
  size = 48,
  speaking = false,
}: {
  characterId: string;
  size?: number;
  speaking?: boolean;
}) {
  const src = AVATAR_IMAGES[characterId];

  if (!src) {
    // Fallback: colored circle with first letter
    return (
      <div
        className="rounded-full bg-[#3d2b1f] flex items-center justify-center text-[#f4e4bc] font-black"
        style={{ width: size, height: size, fontSize: size * 0.4, flexShrink: 0 }}
      >
        {characterId.charAt(0).toUpperCase()}
      </div>
    );
  }

  return (
    <motion.img
      initial={{ scale: 0.7, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      src={src}
      alt={characterId}
      width={size}
      height={size}
      className={`rounded-full object-cover ${speaking ? 'animate-[avatar-bounce_0.6s_ease-in-out_infinite]' : ''}`}
      style={{ flexShrink: 0, width: size, height: size }}
    />
  );
});
