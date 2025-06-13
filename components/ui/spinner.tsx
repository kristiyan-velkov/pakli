import React from "react";
import { BeatLoader } from "react-spinners";

type SpinnerProps = {
  loading: boolean;
  size?: number;
  color?: string;
};

const Spinner: React.FC<SpinnerProps> = ({
  loading,
  size = 30,
  color = "#fff",
}) => {
  if (!loading) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(3, 3, 3, 0.75)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999,
        overflow: "hidden",
        userSelect: "none",
        touchAction: "none",
      }}
      aria-busy="true"
      aria-label="Loading"
      role="alert"
    >
      <BeatLoader loading={loading} size={size} color={color} />
    </div>
  );
};

export default Spinner;
