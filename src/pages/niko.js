import React from "react";
import dynamic from "next/dynamic";

const DynamicNikoPage = dynamic(() => import("../../apps/nyko"), {
  ssr: false,
});

const NikoPage = () => {
  const pageStyle = {
    width: "100vw",
    position: "relative",
    overflow: "hidden",
    "& .MuiCircularProgress-root": {
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
    },
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
  };

  return (
    <div style={pageStyle}>
      <DynamicNikoPage />
    </div>
  );
};

export default NikoPage;
