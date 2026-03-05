import { ReactNode } from "react";

import { ProductSheet } from "./sheets/product-sheet";

export const BottomSheetProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  return (
    <>
      {children}

      <ProductSheet />
    </>
  );
};
