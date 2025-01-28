import React from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@mui/material";
import { createTheme } from '@mui/material/styles';

import Complete from "../Complete/Complete";
import Crawl from "../Crawl/Crawl";
import Home from "../Home/Home";
import Nav from "../Nav/Nav";
import Start from "../Start/Start";
import Settings from "../Settings/Settings";

/* MUI */
import Box from '@mui/material/Box';

function App() {

  const theme = createTheme({
    palette: {
      primary: {
        main: 'rgba(109, 212, 13, 1)',
      },
      secondary: {
        main: '#edf2ff',
      },
    },
    typography: {
      h1: {
        fontSize: '2rem',
      },
      h2: {
        fontSize: '1.75rem',
      },
      h3: {
        fontSize: '1.5rem',
      },
      h5: {
        fontSize: '1.25rem',
      },
      h6: {
        fontSize: '1rem',
      },
    }
  });

  return (
    <ThemeProvider theme={theme}>
      <Router>
        <Box>
          <Nav />
          <Routes>
            <Route path="*" element={<Home />} />
            <Route path="/complete" element={<Complete />} />
            <Route path="/crawl" element={<Start />} />
            <Route path="/crawl/:crawlID" element={<Crawl />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </Box>
       </Router>
    </ThemeProvider>
  );
}

export default App;
