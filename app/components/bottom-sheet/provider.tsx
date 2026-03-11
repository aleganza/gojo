import { ReactNode } from "react";

export const BottomSheetProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  return (
    <>
      {children}
    </>
  );
};
