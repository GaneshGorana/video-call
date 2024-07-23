import { Box, Container, Typography } from "@mui/material";

function Footer() {
  return (
    <Container maxWidth="xl">
      <Box>
        <Typography
          variant="h3"
          sx={{
            marginBottom: "1.5rem",
            letterSpacing: "0.05rem",
            fontWeight: "bold",
          }}
          className="text-center mt-8 text-sm text-gray-600"
        >
          Copyright © Assets and materials are property of their respective
          authors. Links to the authors are provided.
        </Typography>
      </Box>
    </Container>
  );
}

export default Footer;
