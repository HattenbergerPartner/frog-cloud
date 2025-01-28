import React from 'react';
/* MUI */
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';
import Stack from '@mui/material/Stack';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';

function Status(props: {
  cpu?: number,
  vm?: number,
  disk?: number,
}) {
  const {
    cpu = 0,
    vm = 0,
    disk = 0,
  } = props;

  return (
    <AppBar position="fixed" color="primary" sx={{ top: 'auto', bottom: 0 }}>
      <Toolbar>
        <Stack>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography variant="caption" sx={{width: 50, textAlign: 'center'}}>CPU</Typography>
            <Box sx={{width: 100}}>
              <LinearProgress variant="determinate" value={cpu} color="success" />
            </Box>
            <Typography
              variant="caption"
              component="div"
            >{`${Math.round(cpu)}%`}</Typography>
          </Stack>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography variant="caption" sx={{width: 50, textAlign: 'center'}}>VM</Typography>
            <Box sx={{width: 100}}>
              <LinearProgress variant="determinate" value={vm} color="success" />
            </Box>
            <Typography
              variant="caption"
              component="div"
            >{`${Math.round(vm)}%`}</Typography>
          </Stack>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography variant="caption" sx={{width: 50, textAlign: 'center'}}>Disk</Typography>
            <Box sx={{width: 100}}>
              <LinearProgress variant="determinate" value={disk} color="success" />
            </Box>
            <Typography
              variant="caption"
              component="div"
            >{`${Math.round(disk)}%`}</Typography>
          </Stack>
        </Stack>
      </Toolbar>
    </AppBar>
  );
}

export default Status;
