import type { Config } from 'tailwindcss';
import defaultTheme from 'tailwindcss/defaultTheme';

/**
 * Ported from the root Laravel app's tailwind.config.js so the admin app shares
 * the exact Dreammy design tokens (colours, radii, shadows, fonts).
 */
const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-body)', ...defaultTheme.fontFamily.sans],
        display: ['var(--font-display)', 'Georgia', 'serif'],
        script: ['var(--font-script)', 'cursive'],
      },
      colors: {
        cream: {
          DEFAULT: '#FCF5F0',
          page: '#FBF3EE',
          deep: '#F6EAE1',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          soft: '#FFF8F5',
        },
        blush: {
          DEFAULT: '#FBE0E8',
          soft: '#FDEDF2',
          deep: '#F6C9D6',
        },
        peach: {
          DEFAULT: '#F9DAC6',
          soft: '#FCEBE0',
        },
        lavender: {
          DEFAULT: '#E7DDF1',
          soft: '#F1EBF8',
        },
        rose: {
          DEFAULT: '#C9718C',
          soft: '#E3A9BB',
        },
        primary: {
          DEFAULT: '#C43C6E',
          hover: '#AE2F5E',
          light: '#E86A9A',
          soft: '#F6D3DF',
        },
        plum: {
          DEFAULT: '#6E2450',
          deep: '#57173D',
        },
        berry: '#8A2B57',
        gold: {
          DEFAULT: '#F2B33C',
          deep: '#E7972E',
          soft: '#FBE6C4',
        },
        ink: {
          DEFAULT: '#5C4A54',
          soft: '#7A6A72',
          muted: '#9A8791',
        },
        success: {
          DEFAULT: '#3F9D6B',
          soft: '#E4F3EA',
        },
        warn: {
          DEFAULT: '#E7972E',
          soft: '#FBEBD3',
        },
        info: {
          DEFAULT: '#4C6FBF',
          soft: '#E4EAF7',
        },
        danger: {
          DEFAULT: '#D14343',
          soft: '#FBE4E4',
        },
      },
      borderRadius: {
        '4xl': '2rem',
      },
      boxShadow: {
        soft: '0 10px 40px -20px rgba(122, 42, 82, 0.35)',
        card: '0 12px 32px -18px rgba(122, 42, 82, 0.28)',
        lift: '0 20px 50px -24px rgba(122, 42, 82, 0.40)',
      },
      maxWidth: {
        shell: '1340px',
      },
    },
  },
  plugins: [],
};

export default config;
