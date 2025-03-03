import React, { createContext, useContext, useRef } from "react";
import BottomSheet from "@gorhom/bottom-sheet";

type BottomSheetContextType = {
  openBottomSheet: () => void;
  bottomSheetRef: React.MutableRefObject<BottomSheet | null>;
};

const BottomSheetContext = createContext<BottomSheetContextType | undefined>(undefined);

export const BottomSheetProvider = ({ children }) => {
  const bottomSheetRef = useRef(null);

  const openBottomSheet = () => {
    bottomSheetRef.current?.expand();
  };

  return (
    <BottomSheetContext.Provider value={{ openBottomSheet, bottomSheetRef }}>
      {children}
    </BottomSheetContext.Provider>
  );
};

export const useBottomSheet = () => useContext(BottomSheetContext);
