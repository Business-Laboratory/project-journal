export function getDocumentFontSize() {
  return parseFloat(getComputedStyle(document.documentElement).fontSize)
}
