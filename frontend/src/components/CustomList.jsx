import { ArrowRight } from "@mui/icons-material";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";

import PropTypes from "prop-types";

function CustomList({ text }) {
  return (
    <ListItem>
      <ListItemIcon sx={{ p: 0, m: 0, mr: "-24px" }}>
        <ArrowRight />
      </ListItemIcon>
      <ListItemText primary={text} />
    </ListItem>
  );
}

CustomList.propTypes = {
  text: PropTypes.string.isRequired,
};

export default CustomList;
