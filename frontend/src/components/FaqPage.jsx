import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import CustomList from "./CustomList";

const FaqPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Container
      maxWidth="md"
      className={`py-8 ${isMobile ? "text-sm" : "text-base"}`}
    >
      <Box textAlign="center" mb={4}>
        <Typography variant="h4" className="font-bold">
          Frequently Asked Questions
        </Typography>
      </Box>
      <Accordion className="mb-4 rounded-lg shadow-lg">
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1a-content"
          id="panel1a-header"
          className="bg-primary "
        >
          <Typography>
            1. How can i make proper connection of video call with my friend.
          </Typography>
        </AccordionSummary>
        <AccordionDetails className="bg-white">
          <CustomList text="First, join in your room by setting up unique room Id and pass-key." />
          <CustomList text="Make sure your firend is also joined in his/her room." />
          <CustomList text="Now, anybody can make call to other person." />
          <CustomList text="If call accepted then both you will be connected." />
          <CustomList text="Otherwise call is rejected." />
        </AccordionDetails>
      </Accordion>
      <Accordion className="mb-4 rounded-lg shadow-lg">
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel2a-content"
          id="panel2a-header"
          className="bg-primary"
        >
          <Typography>
            2. I have joined room in incognito, and i closed tab without
            removing room. Now i am not able to join that room again.
          </Typography>
        </AccordionSummary>
        <AccordionDetails className="bg-white">
          <CustomList text="In incognito mode, browser not store any data so that room you have joined will no longer saved in your browser." />
          <CustomList text="There is no way to connect back, if you wan then Email me your room id and pass-key, and i will help you to assist connect back." />
        </AccordionDetails>
      </Accordion>
      <Accordion className="mb-4 rounded-lg shadow-lg">
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel3a-content"
          id="panel3a-header"
          className="bg-primary"
        >
          <Typography>
            3. I facing gliches during connecting videocall.
          </Typography>
        </AccordionSummary>
        <AccordionDetails className="bg-white">
          <CustomList text="First thing, make sure you have good internet connection." />
          <CustomList text="If internet is good then reload website and try again, this would fix the gliches and issues." />
        </AccordionDetails>
      </Accordion>
      <Accordion className="mb-4 rounded-lg shadow-lg">
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel3a-content"
          id="panel3a-header"
          className="bg-primary"
        >
          <Typography>
            4. Failed to connect error or peer connection not established error
            got in browser console.
          </Typography>
        </AccordionSummary>
        <AccordionDetails className="bg-white">
          <CustomList text="You got this error then anyone can have internet issue, so make sure you both have good internet connection." />
          <CustomList text="if issue still persist then anyone may have connected to VPN or any other DNS connection or using something like Firewall, so make sure you disconnect from all and try again to connect." />
          <CustomList text="Sometimes, turning Airplan mode on/off resolve this kind of issues." />
          <CustomList text="Also try to remove room id and join again." />
        </AccordionDetails>
      </Accordion>
      <Accordion className="mb-4 rounded-lg shadow-lg">
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel3a-content"
          id="panel3a-header"
          className="bg-primary"
        >
          <Typography>
            5. I accidently deleted my room id, there is any way to get it back.
          </Typography>
        </AccordionSummary>
        <AccordionDetails className="bg-white">
          <CustomList text="No worries, this thing is differently handled, when you delete any room and join that room again then it will be created again, so no need to worry about that." />
        </AccordionDetails>
      </Accordion>
      <Accordion className="mb-4 rounded-lg shadow-lg">
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel3a-content"
          id="panel3a-header"
          className="bg-primary"
        >
          <Typography>
            6. I have to change my room id&apos;s pass-key.
          </Typography>
        </AccordionSummary>
        <AccordionDetails className="bg-white">
          <CustomList text="Just delete room id and join again with different pass-key, this will change room id's pass-key." />
          <CustomList text="Remember, after deleting room id, it does not exists, so anyone can make room id of that name with another pass-key as it is not exists, right. So join with new pass-key after deleting that room as soon as." />
        </AccordionDetails>
      </Accordion>
    </Container>
  );
};

export default FaqPage;
