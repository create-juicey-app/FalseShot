// pages/404.js
export default function Custom404() {
  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <video width="100%" height="auto" controls>
        <source src="/videos/nikostrikes.mp4" type="video/mp4" />
        404: Video not found
      </video>
    </div>
  );
}
