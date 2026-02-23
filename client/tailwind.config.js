/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // 컨퍼런스 디자인 색상
        navy: {
          900: '#0f172a',  // 다크 네이비 배경
          800: '#1e293b',
        },
        gold: {
          400: '#fbbf24',  // 강조색 (버튼, 하이라이트)
          500: '#f59e0b',
        },
        lime: {
          400: '#a3e635',  // 보조색
          500: '#84cc16',
        },
      },
      fontFamily: {
        sans: ['Pretendard', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
