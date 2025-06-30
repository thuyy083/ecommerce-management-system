// utils/preventNumberScroll.js
export function preventNumberInputScroll() {
  if (typeof window === 'undefined') return

  document.addEventListener(
    'wheel',
    function (e) {
      if (
        document.activeElement &&
          document.activeElement.type === 'number' &&
          document.activeElement === e.target
      ) {
        document.activeElement.blur() // hoặc e.preventDefault();
      }
    },
    { passive: false }
  )
}
