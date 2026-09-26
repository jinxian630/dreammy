import type { SVGProps } from 'react';

/**
 * Lightweight stroke icon set (no external dependency). Standard interface
 * icons only — never used to recreate illustration/artwork.
 */
type IconProps = SVGProps<SVGSVGElement>;

function base(props: IconProps) {
  return {
    width: 20,
    height: 20,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    ...props,
  };
}

export const IconGrid = (p: IconProps) => (
  <svg {...base(p)}><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></svg>
);
export const IconBag = (p: IconProps) => (
  <svg {...base(p)}><path d="M6 7h12l-1 13H7L6 7Z" /><path d="M9 7a3 3 0 0 1 6 0" /></svg>
);
export const IconTicket = (p: IconProps) => (
  <svg {...base(p)}><path d="M4 8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2 2 2 0 0 0 0 4 2 2 0 0 1-2 2H6a2 2 0 0 1-2-2 2 2 0 0 0 0-4Z" /><path d="M14 6v12" strokeDasharray="2 2" /></svg>
);
export const IconClipboard = (p: IconProps) => (
  <svg {...base(p)}><rect x="5" y="4" width="14" height="17" rx="2" /><path d="M9 4h6v3H9z" /><path d="M8 11h8M8 15h5" /></svg>
);
export const IconChart = (p: IconProps) => (
  <svg {...base(p)}><path d="M5 20V10M12 20V4M19 20v-7" /></svg>
);
export const IconSettings = (p: IconProps) => (
  <svg {...base(p)}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-2.9 1.2 2 2 0 1 1-4 0 1.7 1.7 0 0 0-2.9-1.2l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-1.6-1H2.9a2 2 0 1 1 0-4H3a1.7 1.7 0 0 0 1.6-1.2 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-1.6V2.9a2 2 0 1 1 4 0V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.1a2 2 0 1 1 0 4H21a1.7 1.7 0 0 0-1.6 1Z" /></svg>
);
export const IconBell = (p: IconProps) => (
  <svg {...base(p)}><path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6Z" /><path d="M10 20a2 2 0 0 0 4 0" /></svg>
);
export const IconChevronDown = (p: IconProps) => (
  <svg {...base(p)}><path d="m6 9 6 6 6-6" /></svg>
);
export const IconChevronRight = (p: IconProps) => (
  <svg {...base(p)}><path d="m9 6 6 6-6 6" /></svg>
);
export const IconChevronLeft = (p: IconProps) => (
  <svg {...base(p)}><path d="m15 6-6 6 6 6" /></svg>
);
export const IconChevronUp = (p: IconProps) => (
  <svg {...base(p)}><path d="m6 15 6-6 6 6" /></svg>
);
export const IconSearch = (p: IconProps) => (
  <svg {...base(p)}><circle cx="11" cy="11" r="7" /><path d="m20 20-3-3" /></svg>
);
export const IconCalendar = (p: IconProps) => (
  <svg {...base(p)}><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 9h18M8 3v4M16 3v4" /></svg>
);
export const IconPlus = (p: IconProps) => (
  <svg {...base(p)}><path d="M12 5v14M5 12h14" /></svg>
);
export const IconDownload = (p: IconProps) => (
  <svg {...base(p)}><path d="M12 4v11m0 0 4-4m-4 4-4-4" /><path d="M4 19h16" /></svg>
);
export const IconEdit = (p: IconProps) => (
  <svg {...base(p)}><path d="M4 20h4L19 9l-4-4L4 16v4Z" /><path d="m14 6 4 4" /></svg>
);
export const IconTrash = (p: IconProps) => (
  <svg {...base(p)}><path d="M4 7h16M9 7V5h6v2M6 7l1 13h10l1-13" /></svg>
);
export const IconCheck = (p: IconProps) => (
  <svg {...base(p)}><path d="m5 12 5 5L20 6" /></svg>
);
export const IconCheckCircle = (p: IconProps) => (
  <svg {...base(p)}><circle cx="12" cy="12" r="9" /><path d="m8.5 12 2.5 2.5 4.5-5" /></svg>
);
export const IconX = (p: IconProps) => (
  <svg {...base(p)}><path d="M6 6l12 12M18 6 6 18" /></svg>
);
export const IconRefresh = (p: IconProps) => (
  <svg {...base(p)}><path d="M4 12a8 8 0 0 1 14-5l2 2M20 12a8 8 0 0 1-14 5l-2-2" /><path d="M20 4v5h-5M4 20v-5h5" /></svg>
);
export const IconUpload = (p: IconProps) => (
  <svg {...base(p)}><path d="M12 20V9m0 0 4 4m-4-4-4 4" /><path d="M4 5h16" /></svg>
);
export const IconImage = (p: IconProps) => (
  <svg {...base(p)}><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="9" cy="10" r="2" /><path d="m5 19 5-5 4 4 2-2 3 3" /></svg>
);
export const IconMenu = (p: IconProps) => (
  <svg {...base(p)}><path d="M4 7h16M4 12h16M4 17h16" /></svg>
);
export const IconMore = (p: IconProps) => (
  <svg {...base(p)}><circle cx="5" cy="12" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="19" cy="12" r="1.5" /></svg>
);
export const IconMoreVertical = (p: IconProps) => (
  <svg {...base(p)}><circle cx="12" cy="5" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="19" r="1.5" /></svg>
);
export const IconArrowRight = (p: IconProps) => (
  <svg {...base(p)}><path d="M5 12h14m0 0-6-6m6 6-6 6" /></svg>
);
export const IconArrowLeft = (p: IconProps) => (
  <svg {...base(p)}><path d="M19 12H5m0 0 6-6m-6 6 6 6" /></svg>
);
export const IconInfo = (p: IconProps) => (
  <svg {...base(p)}><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></svg>
);
export const IconUser = (p: IconProps) => (
  <svg {...base(p)}><circle cx="12" cy="8" r="4" /><path d="M4 20a8 8 0 0 1 16 0" /></svg>
);
export const IconGlobe = (p: IconProps) => (
  <svg {...base(p)}><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" /></svg>
);
export const IconClock = (p: IconProps) => (
  <svg {...base(p)}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
);
export const IconCoins = (p: IconProps) => (
  <svg {...base(p)}><ellipse cx="9" cy="7" rx="6" ry="3" /><path d="M3 7v5c0 1.7 2.7 3 6 3s6-1.3 6-3V7" /><path d="M15 12c3.3 0 6-1.3 6-3s-2.7-3-6-3" /><path d="M9 15v2c0 1.7 2.7 3 6 3s6-1.3 6-3v-5" /></svg>
);
export const IconCart = (p: IconProps) => (
  <svg {...base(p)}><path d="M3 4h2l2 12h11l2-8H7" /><circle cx="9" cy="20" r="1.3" /><circle cx="18" cy="20" r="1.3" /></svg>
);
export const IconHeart = (p: IconProps) => (
  <svg {...base(p)}><path d="M12 20s-7-4.5-7-9.5A3.5 3.5 0 0 1 12 7a3.5 3.5 0 0 1 7 3.5C19 15.5 12 20 12 20Z" /></svg>
);
export const IconLeaf = (p: IconProps) => (
  <svg {...base(p)}><path d="M5 19c0-8 6-13 14-13 0 8-5 14-13 14a6 6 0 0 1-1-1Z" /><path d="M5 19 12 12" /></svg>
);
export const IconUsers = (p: IconProps) => (
  <svg {...base(p)}><circle cx="9" cy="8" r="3" /><path d="M3 20a6 6 0 0 1 12 0" /><path d="M16 6a3 3 0 0 1 0 6M21 20a6 6 0 0 0-4-5.6" /></svg>
);
export const IconLightning = (p: IconProps) => (
  <svg {...base(p)}><path d="M13 3 5 13h5l-1 8 8-10h-5l1-8Z" /></svg>
);
export const IconFile = (p: IconProps) => (
  <svg {...base(p)}><path d="M6 3h8l4 4v14H6z" /><path d="M14 3v4h4" /><path d="M9 13h6M9 17h6" /></svg>
);
export const IconSave = (p: IconProps) => (
  <svg {...base(p)}><path d="M5 3h11l3 3v15H5z" /><path d="M8 3v5h7V3" /><rect x="8" y="13" width="8" height="5" /></svg>
);
export const IconSend = (p: IconProps) => (
  <svg {...base(p)}><path d="M4 12 20 4l-6 16-3-7-7-1Z" /></svg>
);
export const IconEye = (p: IconProps) => (
  <svg {...base(p)}><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>
);
export const IconPhoto = (p: IconProps) => (
  <svg {...base(p)}><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="9" cy="10" r="2" /><path d="m5 19 5-5 4 4 2-2 3 3" /></svg>
);
