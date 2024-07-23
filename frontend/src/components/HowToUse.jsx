import {
  Container,
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";

function HowToUse() {
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Container
      maxWidth="xl"
      id="how-to-use-section"
      sx={{
        height: isXs ? "100vh" : "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: isXs ? "20px" : "40px",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          maxWidth: "800px",
        }}
      >
        <Typography
          variant="h3"
          sx={{
            marginBottom: "1.5rem",
            letterSpacing: "0.05rem",
            fontWeight: "bold",
          }}
        >
          How to Use
        </Typography>
        <List>
          <ListItem>
            <ListItemText
              primary="1. Create your room and your friend have also to create theirs."
              sx={{ textAlign: "left" }}
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="2. Ensure you both have unique rooms."
              sx={{ textAlign: "left" }}
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="3. Share your room ID's, and anyone can start a call by requesting to the other user."
              sx={{ textAlign: "left" }}
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="4. If your friend accepts the call, you both will be connected; otherwise, the call is rejected."
              sx={{ textAlign: "left" }}
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="5. Enjoy your call :D"
              sx={{ textAlign: "left" }}
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="Tip : Refer FAQ section for more details."
              sx={{ textAlign: "left" }}
            />
          </ListItem>
        </List>
      </Box>
    </Container>
  );
}

export default HowToUse;
