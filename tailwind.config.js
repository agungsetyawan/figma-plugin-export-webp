module.exports = {
  // purge: process.env.NODE_ENV === 'development' ? [] : ['./dist/*.html'],
  content: ['./src/**/*.{html,js,ts,vue}'],
  safelist: process.env.NODE_ENV === 'development' ? [{ pattern: /.*/ }] : [],
  darkMode: 'class',
  theme: {
    extend: {},
    fontFamily: {
      display: ['Inter', 'system-ui', 'sans-serif'],
      body: ['Inter', 'system-ui', 'sans-serif']
    }
  },
  variants: {
    extend: {}
  },
  plugins: [require('preline/plugin')]
}
