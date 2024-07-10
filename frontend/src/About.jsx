import { Container, Box, Typography, Link } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { FaEnvelope, FaFacebook, FaInstagram } from "react-icons/fa";

const About = () => {
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down("sm"));
  const isSm = useMediaQuery(theme.breakpoints.between("sm", "md"));

  let flexDirection = "row";
  let textOrder = 1;
  let imageOrder = 2;

  if (isXs || isSm) {
    flexDirection = "column";
    textOrder = 1;
    imageOrder = 2;
  }

  return (
    <Container maxWidth="xl" id="about-section" sx={{ minHeight: "100vh" }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          textAlign: "center",
          p: { xs: 2, md: 4 },
        }}
      >
        <Typography
          variant="h3"
          sx={{
            fontWeight: "bold",
            mb: { xs: 2, md: 4 },
          }}
        >
          About Me
        </Typography>
        <Box
          sx={{
            display: "flex",
            flexDirection: flexDirection,
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            p: { xs: 1, md: 3 },
            textAlign: { xs: "center", md: "left" },
          }}
        >
          <Box
            sx={{
              order: textOrder,
              flex: 1,
              p: { xs: 1, md: 3 },
              maxWidth: { xs: "100%", md: "50%" },
            }}
          >
            <Typography variant="body1" sx={{ mb: 2 }}>
              Hi, I&apos;m Ganesh Gorana. You can reach me at&nbsp;
              <Link href="mailto:ganeshgorana01@gmail.com">
                <Box
                  component="span"
                  sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    verticalAlign: "middle",
                  }}
                >
                  <FaEnvelope />
                </Box>
              </Link>
            </Typography>

            <Typography variant="body1" sx={{ mb: 2 }}>
              This is my first project, and I&apos;m really excited about it. I
              wanted to create a service where people can connect easily without
              worrying about their data being stolen or their privacy being
              compromised.
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              I&apos;m passionate about using technology to bring people closer
              together in a safe and simple way.
            </Typography>
            <Box
              sx={{
                display: "flex",
                justifyContent: { xs: "center", md: "flex-start" },
                gap: 2,
                mb: 2,
              }}
            >
              <Link
                href="https://www.facebook.com/ganesh.gorana.56"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaFacebook size={24} />
              </Link>
              <Link
                href="https://www.instagram.com/ganesh_gorana/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaInstagram size={24} />
              </Link>
            </Box>
          </Box>
          <Box
            component="img"
            src="https://ik.imagekit.io/imgUpload/videocall_assests/author.jpg"
            alt="Ganesh Gorana"
            title="Ganesh Gorana"
            sx={{
              order: imageOrder,
              width: { xs: "100%", md: "30%" },
              maxWidth: "450px",
              borderRadius: "50%",
              objectFit: "cover",
              aspectRatio: "1/1",
              mt: { xs: 3, md: 0 },
            }}
          />
        </Box>
      </Box>
    </Container>
  );
};

export default About;
