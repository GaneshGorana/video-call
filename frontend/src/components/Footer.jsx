import { Box, Container, Typography } from "@mui/material";

function Footer() {
  return (
    <Container maxWidth="xl">
      <Box>
        <Typography
          variant="h3"
          sx={{
            margin: "0px 0px 1.5rem",
            fontFamily: "Roboto Helvetica Arial sans-serif",
            fontSize: "0.9rem",
            lineHeight: "1.167",
            letterSpacing: "0.05rem",
            fontWeight: "700",
            wordWrap: "break-word",
            wordBreak: "auto-phrase",
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
