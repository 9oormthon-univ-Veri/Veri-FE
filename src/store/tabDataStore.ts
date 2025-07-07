import { create } from 'zustand';

interface UserData {
  email: string;
  nickname: string;
  image: string;
  numOfReadBook: number;
  numOfCard: number;
}

interface LibraryData {
  userData: UserData | null;
  bookImageUrl: string | null;
  myCards: any[] | null;
  myBooks: any[] | null;
  popularBooks: any[] | null;
}

interface TabDataState {
  libraryData: LibraryData | null;
  setLibraryData: (data: LibraryData) => void;
  readingCardData: any;
  setReadingCardData: (data: any) => void;
  myPageData: any;
  setMyPageData: (data: any) => void;
  clearAll: () => void;
  clearLibraryData: () => void;
}

export const useTabDataStore = create<TabDataState>((set) => ({
  libraryData: null,
  setLibraryData: (data) => set({ libraryData: data }),
  readingCardData: null,
  setReadingCardData: (data) => set({ readingCardData: data }),
  myPageData: null,
  setMyPageData: (data) => set({ myPageData: data }),
  clearAll: () => set({ libraryData: null, readingCardData: null, myPageData: null }),
  clearLibraryData: () => set((state) => ({ ...state, libraryData: null })),
})); 