import React from 'react';
import { Link } from "react-router-dom";
/* MUI */
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';

function Nav() {

  return (
    <header>
      <AppBar position="static">
        <Toolbar
          disableGutters
          sx={{
            margin: 0
          }}
        >
          <Box
            sx={{
              flexGrow: 1,
              display: {
                xs: 'none',
                md: 'flex'
              }
            }}
          >
            <Stack
              direction="row"
              justifyContent="flex-start"
              alignItems="center"
              sx={{flexGrow: 1}}
            >
              <MenuItem component={Link} to="/">
                <Stack
                  sx={{
                    color: 'white',
                    fontSize: 18,
                    fontWeight: 700,
                    lineHeight: 0.9,
                    textDecoration: 'none',
                  }}
                >
                  <Box>Frog</Box>
                  <Box>Cloud</Box>
                </Stack>
              </MenuItem>
              <MenuItem component={Link} to="/crawl">
                <Typography
                  textAlign="center"
                  sx={{
                    color: 'white',
                    textDecoration: 'none',
                  }}
                >
                  Crawl
                </Typography>
              </MenuItem>
              <MenuItem component={Link} to="/complete/">
                <Typography
                  textAlign="center"
                  sx={{
                    color: 'white',
                    textDecoration: 'none',
                  }}
                >
                  Completed
                </Typography>
              </MenuItem>
              <Box sx={{flexGrow: 1}} />
              <MenuItem component={Link} to="/settings/">
                <Typography
                  textAlign="center"
                  sx={{
                    color: 'white',
                    textDecoration: 'none',
                  }}
                >
                  Settings
                </Typography>
              </MenuItem>
            </Stack>
          </Box>
        </Toolbar>
      </AppBar>
    </header>
  );
}

export default Nav;
