module.exports = {
  // purge: ['./dist/*.html'],
  content: ['./src/**/*.{html,js,ts,vue}'],
  safelist: process.env.NODE_ENV === 'development' ? [{ pattern: /.*/ }] : [],
  darkMode: 'class',
  theme: {
    extend: {}
  },
  variants: {
    extend: {}
  },
  plugins: [
    require('preline/plugin')
  ]
}
