import { useState, useEffect } from "react";
import { Typography, Box } from "@mui/material";
import Image from "next/image";

const ForbiddenPage = () => {
  const [text, setText] = useState("");
  const fullText = "We are sorry, but you are not allowed to access this app.";
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (index < fullText.length) {
      const timer = setTimeout(() => {
        setText(text + fullText[index]);
        setIndex(index + 1);
      }, 10);
      return () => clearTimeout(timer);
    }
  }, [text, index]);

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      height="40vh"
    >
      <Typography variant="body1" color="purple">
        {text}
      </Typography>
      <Box mt={4}>
        <Image src="/oneshot.png" alt="Forbidden" width={30} height={30} />
      </Box>
      <Typography variant="h5" color="purple" mt={4}>
        403. Forbidden
      </Typography>
    </Box>
  );
};

export default ForbiddenPage;
