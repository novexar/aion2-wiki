import { createContext, useContext } from 'react';

export interface SearchPaletteApi {
  readonly isOpen: boolean;
  readonly open: (initialQuery?: string) => void;
  readonly close: () => void;
}

export const SearchPaletteContext = createContext<SearchPaletteApi>({
  isOpen: false,
  open: () => undefined,
  close: () => undefined,
});

export function useSearchPalette(): SearchPaletteApi {
  return useContext(SearchPaletteContext);
}
