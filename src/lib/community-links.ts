import { createWhatsAppLink, whatsappMessages } from './whatsapp';

export const communityLinks = {
  discord: process.env.NEXT_PUBLIC_DISCORD_INVITE_URL || '#',
  telegramVip: process.env.NEXT_PUBLIC_TELEGRAM_VIP_URL || '#',
};

export const TELEGRAM_VIP_WHATSAPP = createWhatsAppLink(whatsappMessages.telegramVipAccess);
