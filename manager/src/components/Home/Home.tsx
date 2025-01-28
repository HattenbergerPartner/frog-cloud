import React, { useEffect, useState } from 'react';
import { Link } from "react-router-dom";
/* MUI */
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import CircularProgress, { CircularProgressProps } from '@mui/material/CircularProgress';
import Chip from '@mui/material/Chip';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
/* APIs */
import { checkComplete } from '../../api/complete';
import { checkSettings, updateSettings } from '../../api/settings';
/* Interfaces */
import { SettingsInterface, defaultSettings } from '../../interfaces/Settings';
import { TasksInterface } from '../../interfaces/Tasks';

function Home() {
  const [licenceAgree, setLicenceAgree] = useState<boolean>(false);
  const [serverCPU, setServerCPU] = useState<number>(0);
  const [serverVM, setServerVM] = useState<number>(0);
  const [serverDisk, setServerDisk] = useState<number>(0);
  const [availableMemory, setAvailableMemory] = useState<number>(0);
  const [totalMemory, setTotalMemory] = useState<number>(1);
  const [serverSettings, setServerSettings] = useState<SettingsInterface>(defaultSettings);
  const [storageMode, setStorageMode] = useState<string>('MEMORY');
  const [memoryLimit, setMemoryLimit] = useState<number>(0);
  const [tasks, setTasks] = useState<TasksInterface[]>([]);

  const check = (): void => {
    void checkSettings().then((data: SettingsInterface) => {
      setLicenceAgree(data?.sf.config.eula_accepted === '15');
      setServerCPU(data?.server?.cpu);
      setServerVM(data?.server?.vm?.per);
      setServerDisk(data?.server?.disk?.per);
      setAvailableMemory(data?.server?.vm?.available);
      setTotalMemory(data?.server?.vm?.total);
      setServerSettings(data);
      setStorageMode(data.sf.config.storage_mode);
      setMemoryLimit(data.sf.memory_amount);
    });
  };

  const checkTasks = (): void => {
    setTasks([]);
    void checkComplete().then((data: any) => {
      setTasks(data.tasks);
    });
  }

  useEffect(() => {
    check();
    checkTasks();
  }, []);

  return (
    <Container maxWidth="lg" sx={{pt: 2, pb: 2}}>
      <Stack spacing={2}>
        <Typography variant="h1">Getting Started</Typography>
        <Box>
          <Typography variant="body2">
            Frog Cloud is a cloud-based interface for managing, running, and exporting data from Screaming Frog.
          </Typography>
        </Box>
        <Card>
          <CardHeader title="Instance Status" />
          <CardContent>
            <Stack
              direction="row"
              spacing={3}
              divider={<Divider orientation="vertical" flexItem />}
              justifyContent="space-evenly"
             >
              <Stack alignItems="center">
                <Typography>License</Typography>
                {serverSettings.licence.name !== '' && serverSettings.licence.key !== ''
                  ? <Chip label="Added" color="success" size="small" />
                  : <Chip label="Missing" color="warning" size="small" />
                }
              </Stack>
              <Stack alignItems="center">
                <Typography>EULA</Typography>
                <Typography variant="caption">
                  {licenceAgree
                  ? <Chip label="Accepted" color="success" size="small" />
                  : <Chip label="Not Accepted" color="warning" size="small" />
                  }
                </Typography>
              </Stack>
              <Stack alignItems="center">
                <Typography>CPU Usage</Typography>
                <Box>
                  <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                    <CircularProgress variant="determinate" value={serverCPU} />
                    <Box
                      sx={{
                        top: 0,
                        left: 0,
                        bottom: 0,
                        right: 0,
                        position: 'absolute',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Typography variant="caption">
                        {`${Math.round(serverCPU)}%`}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Stack>
              <Stack alignItems="center">
                <Typography>VM Usage</Typography>
                <Box>
                  <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                    <CircularProgress variant="determinate" value={serverVM} />
                    <Box
                      sx={{
                        top: 0,
                        left: 0,
                        bottom: 0,
                        right: 0,
                        position: 'absolute',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Typography variant="caption">
                        {`${Math.round(serverVM)}%`}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Stack>
              <Stack alignItems="center">
                <Typography>Disk Usage</Typography>
                <Box>
                  <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                    <CircularProgress variant="determinate" value={serverDisk} />
                    <Box
                      sx={{
                        top: 0,
                        left: 0,
                        bottom: 0,
                        right: 0,
                        position: 'absolute',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Typography variant="caption">
                        {`${Math.round(serverDisk)}%`}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Stack>
            </Stack>
          </CardContent>
          <CardActions>
            <Button
              component={Link}
              to="/settings"
              variant="outlined"
             >
              Change Settings
            </Button>
          </CardActions>
        </Card>
        <Card>
          <CardHeader title="Crawls" />
          <CardContent>
            <Stack
              direction="row"
              spacing={3}
              divider={<Divider orientation="vertical" flexItem />}
              justifyContent="space-evenly"
             >
              <Box>
                <Stack alignItems="center">
                  <Typography>
                    Total
                  </Typography>
                  <Typography variant="caption">
                    {tasks.length}
                  </Typography>
                </Stack>
              </Box>
              <Box>
                <Stack alignItems="center">
                  <Typography>
                    In Progress
                  </Typography>
                  <Typography variant="caption">
                    {tasks.filter((task) => task.status === 'started').length}
                  </Typography>
                </Stack>
              </Box>
              <Box>
                <Stack alignItems="center">
                  <Typography>
                    Errors
                  </Typography>
                  <Typography variant="caption">
                    {tasks.filter((task) => task.status === 'canceled').length}
                  </Typography>
                </Stack>
              </Box>
            </Stack>
          </CardContent>
          <CardActions>
            <Button
              component={Link}
              to="/crawl"
              variant="contained"
             >
              New Crawl
            </Button>
            <Button
              component={Link}
              to="/complete"
              variant="outlined"
             >
              View Crawls
            </Button>
          </CardActions>
        </Card>
        <Typography>
          See <Typography component={Link} to="https://github.com/myawesomebike/frog-cloud">frog-cloud</Typography> on github.
        </Typography>
      </Stack>
    </Container>
  );
}

export default Home;
