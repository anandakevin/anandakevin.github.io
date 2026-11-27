export function feedCardMatchesFilter(cardKind: string, selectedKind: string): boolean {
  return selectedKind === 'all' || cardKind === selectedKind;
}
