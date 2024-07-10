import { useMemo } from "react";
import { Container, Box, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";

function Home() {
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down("sm"));
  const isSm = useMediaQuery(theme.breakpoints.between("sm", "md"));
  const isMd = useMediaQuery(theme.breakpoints.between("md", "lg"));

  let flexDirection = "row";
  let textOrder = 2;
  let imageWidth = "50%";
  let textSize = "3rem";

  const imageSrc = useMemo(() => {
    if (isXs)
      return "https://ik.imagekit.io/imgUpload/videocall_assests/one.jpg";
    if (isSm || isMd)
      return "https://ik.imagekit.io/imgUpload/videocall_assests/three.jpg";
    return "https://ik.imagekit.io/imgUpload/videocall_assests/two.jpg";
  }, [isXs, isSm, isMd]);

  if (isXs) {
    flexDirection = "column";
    textOrder = 1;
    imageWidth = "80%";
    textSize = "2rem";
  }

  if (isSm || isMd) {
    flexDirection = "column";
    imageWidth = "70%";
    textSize = "3.5rem";
  }

  return (
    <Container maxWidth="xl" sx={{ height: "100vh" }}>
      <Box
        id="home-section"
        sx={{
          display: "flex",
          flexDirection: flexDirection,
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          position: "relative",
          textAlign: "center",
        }}
      >
        <Box
          sx={{
            order: textOrder,
            p: { xs: 0, md: 2 },
            mb: { xs: 1, md: 0 },
          }}
        >
          <Typography
            variant="h1"
            sx={{ fontSize: textSize, fontWeight: "bold" }}
          >
            Welcome to VidCall
          </Typography>
          <Typography
            variant="h5"
            lineHeight={"2.5rem"}
            letterSpacing={"0.1rem"}
          >
            Connect to the world without any boundaries.
            <br />
            Start a video call
          </Typography>
        </Box>
        <Box
          component="img"
          src={imageSrc}
          alt="videocall"
          id="home-section-image"
          sx={{
            width: imageWidth,
            maxWidth: "400px",
            order: 1,
          }}
          loading="lazy"
        />
      </Box>
    </Container>
  );
}

export default Home;
