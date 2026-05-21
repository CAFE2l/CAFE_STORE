type PixPayloadInput = {
  key: string;
  merchantName: string;
  merchantCity: string;
  amount: number;
  txid: string;
  description?: string;
};

function formatValue(id: string, value: string) {
  const length = value.length.toString().padStart(2, '0');

  return `${id}${length}${value}`;
}

function crc16(payload: string) {
  let crc = 0xffff;

  for (let index = 0; index < payload.length; index += 1) {
    crc ^= payload.charCodeAt(index) << 8;

    for (let bit = 0; bit < 8; bit += 1) {
      crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1;
      crc &= 0xffff;
    }
  }

  return crc.toString(16).toUpperCase().padStart(4, '0');
}

function sanitizePixText(value: string, maxLength: number) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Za-z0-9 ]/g, '')
    .slice(0, maxLength)
    .toUpperCase();
}

export function generatePixPayload(input: PixPayloadInput) {
  const merchantAccountInfo = [
    formatValue('00', 'BR.GOV.BCB.PIX'),
    formatValue('01', input.key),
    input.description ? formatValue('02', sanitizePixText(input.description, 72)) : '',
  ].join('');
  const additionalData = formatValue('05', sanitizePixText(input.txid, 25));
  const payloadWithoutCrc = [
    formatValue('00', '01'),
    formatValue('26', merchantAccountInfo),
    formatValue('52', '0000'),
    formatValue('53', '986'),
    formatValue('54', input.amount.toFixed(2)),
    formatValue('58', 'BR'),
    formatValue('59', sanitizePixText(input.merchantName, 25)),
    formatValue('60', sanitizePixText(input.merchantCity, 15)),
    formatValue('62', additionalData),
    '6304',
  ].join('');

  return `${payloadWithoutCrc}${crc16(payloadWithoutCrc)}`;
}

export function getPixQrCodeUrl(payload: string) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(payload)}`;
}
