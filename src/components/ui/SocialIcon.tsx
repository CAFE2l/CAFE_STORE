import Image from 'next/image';

type Platform = 'discord' | 'telegram' | 'twitter' | 'linkedin' | 'youtube' | 'whatsapp';

const socialIconMap: Record<Platform, string> = {
  discord: '/images/icons/Discord.png',
  telegram: '/images/icons/Telegram.png',
  twitter: '/images/icons/Twitter.png',
  linkedin: '/images/icons/LinkedIn.png',
  youtube: '/images/icons/Youtube.png',
  whatsapp: '/images/icons/Whatsapp.png',
};

type Props = {
  platform: Platform;
  size?: number;
  className?: string;
};

export function SocialIcon({ platform, size = 24, className = '' }: Props) {
  return (
    <Image
      src={socialIconMap[platform]}
      alt={`${platform} icon`}
      width={size}
      height={size}
      className={`object-contain ${className}`}
    />
  );
}
