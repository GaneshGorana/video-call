/* eslint-disable react/no-unescaped-entities */
import { Container, Box, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";

function Intoduction() {
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down("sm"));
  const isSm = useMediaQuery(theme.breakpoints.between("sm", "md"));
  const isMd = useMediaQuery(theme.breakpoints.between("md", "lg"));

  let flexDirection = "row";
  let textOrder = 0;

  if (isXs) {
    flexDirection = "column";
    textOrder = 1;
  }

  if (isSm || isMd) {
    flexDirection = "column";
  }

  return (
    <Container maxWidth="xl" sx={{ height: "100vh" }}>
      <Box
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
          maxWidth={isXs ? "100%" : "50%"}
        >
          <Typography
            variant="h3"
            sx={{
              marginBottom: "1.5rem",
              letterSpacing: "0.05rem",
              fontWeight: "bold",
            }}
          >
            How We Help
          </Typography>
          <Typography
            variant="body1"
            sx={{
              maxWidth: "800px",
              lineHeight: "1.8",
              letterSpacing: "0.02rem",
              fontSize: "1.1rem",
            }}
          >
            <Typography variant="p" style={{ fontWeight: "500" }}>
              <br />
              - Easy to use, no account creation needed.
              <br />
              - P2P technology for secure direct data transmission.
              <br />- End-to-end encryption ensures privacy and security.
            </Typography>
          </Typography>
        </Box>
        <Box
          component="img"
          src="https://ik.imagekit.io/imgUpload/videocall_assests/how-we.jpg"
          alt="videocall"
          id="home-section-image"
          sx={{
            width: "50%",
            maxWidth: "400px",
            order: 1,
          }}
        />
      </Box>
    </Container>
  );
}

export default Intoduction;
