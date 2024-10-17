import React from "react";
import Bsod from "../components/Bsod";

function Error({ statusCode, err, isInApp }) {
  if (isInApp) {
    // For in-app errors, return null to allow the app to handle it
    return null;
  }

  // For critical errors, show the BSOD
  return (
    <Bsod
      error={err}
      errorInfo={{
        componentStack: statusCode
          ? `An error ${statusCode} occurred on server`
          : "An error occurred on client",
      }}
    />
  );
}

Error.getInitialProps = ({ res, err, pathname }) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  const isInApp = pathname.startsWith('/app/');
  return { statusCode, err, isInApp };
};

export default Error;