import React, { useEffect, useState } from 'react';
import { Link } from "react-router-dom";
import { styled } from '@mui/material/styles';
/* FC */
import Status from "../Status/Status";
/* MUI */
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Checkbox from '@mui/material/Checkbox';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import FormControlLabel from '@mui/material/FormControlLabel';
import IconButton from '@mui/material/IconButton';
import LinearProgress from '@mui/material/LinearProgress';
import Paper from '@mui/material/Paper';
import Slider from '@mui/material/Slider';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';
/* Icons */
import AutorenewIcon from '@mui/icons-material/Autorenew';
import CancelIcon from '@mui/icons-material/Cancel';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
/* APIs */
import { getConfigs, removeConfig, uploadConfig } from '../../api/config';
import { checkSettings, updateSettings } from '../../api/settings';
/* Interfaces */
import { SettingsInterface, defaultSettings } from '../../interfaces/Settings';

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

function Settings() {
  const [userName, setUserName] = useState<string>('');
  const [userKey, setUserKey] = useState<string>('');
  const [licenceAgree, setLicenceAgree] = useState<boolean>(false);
  const [serverCPU, setServerCPU] = useState<number>(0);
  const [serverVM, setServerVM] = useState<number>(0);
  const [serverDisk, setServerDisk] = useState<number>(0);
  const [availableMemory, setAvailableMemory] = useState<number>(0);
  const [totalMemory, setTotalMemory] = useState<number>(1);
  const [serverSettings, setServerSettings] = useState<SettingsInterface>(defaultSettings);
  const [storageMode, setStorageMode] = useState<string>('MEMORY');
  const [memoryLimit, setMemoryLimit] = useState<number>(0);
  const [configs, setConfigs] = useState<any[]>([]);
  const [configName, setConfigName] = useState<string>('');
  const [configDescription, setConfigDescription] = useState<string>('');
  const [configFile, setConfigFile] = useState<File | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(false);
  const [uploading, setUploading] = useState<boolean>(false);

  const check = (): void => {
    void checkSettings().then((data: SettingsInterface) => {
      setUserName('');
      setUserKey('');
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

  const updatelicence = (): void => {
    setLoading(true);
    void updateSettings({
      licence: {
        key: userKey,
        name: userName,
      },
    }).then((data: any) => {
      setLoading(false);
    });
  }

  const checkConfigs = (): void => {
    setConfigs([]);
    void getConfigs().then((data: any) => {
      setConfigs(data.configs);
    });
  }

  const updateConfig = (): void => {
    setLoading(true);
    void updateSettings({
      sf: {
        config: {
          storage_mode: storageMode,
          eula_accepted: licenceAgree ? '15' : '-1',
        },
        memory_amount: memoryLimit,
      }
    }).then((data: any) => {
      setLoading(false);
    });
  }

  const upload = (): void => {
    setUploading(true);
    void uploadConfig(configName, configDescription, configFile).then((data: any) => {
      setUploading(false);
      if(data.status === 'ok') {
        setConfigName('');
        setConfigDescription('');
        setConfigFile(undefined);
        checkConfigs();
      }
    });
  }

  const remove = (configId: string): void => {
    void removeConfig(configId).then((data: any) => {
      if(data.status === 'ok') {
        checkConfigs();
      }
    })
  }

  useEffect(() => {
    check();
    checkConfigs();
  }, []);

  return (
    <Container maxWidth="xl" sx={{pt: 2, pb: 10}}>
      <Status cpu={serverCPU} vm={serverVM} disk={serverDisk} />
      <Stack direction="row" alignItems="center">
        <Typography variant="h1">Settings</Typography>
        <IconButton onClick={check}>
          <AutorenewIcon />
        </IconButton>
      </Stack>
      <Stack spacing={1}>
        <Card>
          <CardHeader title="Licence" />
          <CardContent>
            <Stack spacing={3}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Typography variant="caption" sx={{width: 120}}>User Name</Typography>
                <TextField
                  placeholder={serverSettings.licence.name}
                  value={userName}
                  onChange={(_e: React.ChangeEvent<HTMLInputElement>) => { setUserName(_e.target.value)}}
                  sx={{flexGrow: 1}}
                />
              </Stack>
              <Stack direction="row" spacing={2} alignItems="center">
                <Typography variant="caption" sx={{width: 120}}>Key</Typography>
                <TextField
                  placeholder={serverSettings.licence.key}
                  value={userKey}
                  onChange={(_e: React.ChangeEvent<HTMLInputElement>) => { setUserKey(_e.target.value)}}
                  sx={{flexGrow: 1}}
                />
              </Stack>
            </Stack>
          </CardContent>
          <CardActions>
            <Button
              variant="contained"
              disabled={userName === '' || userKey === ''}
              onClick={updatelicence}
            >
              Update licence
            </Button>
          </CardActions>
        </Card>
        <Card>
          <CardHeader title={
            <Stack direction="row" spacing={2} alignItems="center">
              <Typography variant="h3">
                Crawler
              </Typography>
              <Typography variant="caption">
                {serverSettings.sf.version}
              </Typography>
            </Stack>
          }>
          </CardHeader>
          <CardContent>
            <Stack spacing={3}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Typography variant="caption" sx={{width: 120}}>Storage Mode</Typography>
                <ToggleButtonGroup
                  exclusive
                  value={storageMode}
                  onChange={(_e: React.MouseEvent<HTMLElement>, nextView: string) => {
                    setStorageMode(nextView);
                  }}
                >
                  <ToggleButton value="MEMORY">Memory (VM)</ToggleButton>
                  <ToggleButton value="DB">Database (Disk)</ToggleButton>
                </ToggleButtonGroup>
              </Stack>
              <Stack direction="row" spacing={2} alignItems="center">
                <Typography variant="caption" sx={{width: 120}}>Disk In-Use</Typography>
                <Box sx={{width: '100%'}}>
                  <LinearProgress
                    variant="determinate"
                    value={serverSettings.server.disk.per}
                    color="warning"
                  />
                </Box>
                <Stack>
                  <Typography variant="caption" sx={{width: 120, textAlign: 'center'}}>{serverSettings.server.disk.available} gb / {serverSettings.server.disk.total} gb</Typography>
                  <Typography variant="caption" sx={{width: 120, textAlign: 'center'}}>{serverSettings.server.disk.per}%</Typography>
                </Stack>
              </Stack>
              <Divider />
              <Stack direction="row" spacing={2} alignItems="center" sx={{pt: 2}}>
                <Typography variant="caption" sx={{width: 120}}>Memory Limit</Typography>
                <Slider
                  aria-label="Always visible"
                  value={memoryLimit}
                  defaultValue={Number(serverSettings.sf.memory_amount)}
                  max={totalMemory}
                  valueLabelDisplay="on"
                  valueLabelFormat={(value: number) => `${value} GB` }
                  onChange={(_e: Event, newValue: number | number[]) => {
                    !Array.isArray(newValue) && setMemoryLimit(newValue);
                  }}
                />
                <Stack>
                  <Typography variant="caption" sx={{width: 120, textAlign: 'center'}}>{memoryLimit} gb / {totalMemory} gb</Typography>
                </Stack>
              </Stack>
              <Stack direction="row" spacing={2} alignItems="center">
                <Typography variant="caption" sx={{width: 120}}>Memory In-Use</Typography>
                <Box sx={{width: '100%'}}>
                  <LinearProgress
                    variant="determinate"
                    value={(availableMemory / totalMemory) * 100}
                    color="warning"
                  />
                </Box>
                <Stack>
                  <Typography variant="caption" sx={{width: 120, textAlign: 'center'}}>{availableMemory} gb / {totalMemory} gb</Typography>
                  <Typography variant="caption" sx={{width: 120, textAlign: 'center'}}>{serverVM}%</Typography>
                </Stack>
              </Stack>
              <Divider />
            </Stack>
          </CardContent>
          <CardActions>
            <Button
              variant="contained"
              onClick={updateConfig}
              disabled={loading || !licenceAgree}
              startIcon={<CircularProgress color="success" size={20} sx={{display: loading ? 'block' : 'none'}}/>}
            >
              Update Settings
            </Button>
            <Stack direction="row" spacing={2} alignItems="center">
              <FormControlLabel
                label="Agree to ScreamingFrog EULA"
                control={
                  <Checkbox
                    checked={licenceAgree}
                    onChange={(_e: React.ChangeEvent<HTMLInputElement>) => {
                      setLicenceAgree(_e.target.checked);
                    }}
                  />
                }
              />
              <Typography
                component={Link}
                to="https://www.screamingfrog.co.uk/seo-spider/terms-conditions/"
                variant="caption"
                sx={{width: 120}}
              >
                User Agreement
              </Typography>
            </Stack>
          </CardActions>
        </Card>
        <Card>
          <CardHeader title="Custom Configs" />
          <CardContent>
            <Stack spacing={3}>
              <Paper variant="outlined">
                <Stack divider={<Divider />}>
                  {configs.length > 0 ? configs?.map((config: any, index: number) => (
                    <Stack key={index} direction="row" spacing={1} alignItems="center">
                      <Typography sx={{pl: 1}}>{config.name}</Typography>
                      <Typography variant="caption" sx={{flexGrow: 1}}> - {config.description}</Typography>
                      <Stack direction="row" alignItems="center">
                        <InsertDriveFileOutlinedIcon fontSize="small" />
                        <Typography variant="caption">{config.config_data.filename}</Typography>
                        <IconButton onClick={() => remove(config.config_id)}>
                          <CancelIcon fontSize="small" />
                        </IconButton>
                      </Stack>
                    </Stack>
                   )) : (
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography sx={{pl: 1, fontStyle: 'italic'}}>None Added</Typography>
                    </Stack>
                  )}
                </Stack>
              </Paper>
              <Divider />
              <Typography variant="h5">
                Add New
              </Typography>
              <Stack direction="row" spacing={2} alignItems="center">
                <Typography variant="caption" sx={{width: 120}}>Config File</Typography>
                <Stack spacing={1} direction="row" alignItems="center">
                  <Button
                    component="label"
                    role={undefined}
                    variant="contained"
                    startIcon={<CloudUploadIcon />}
                  >
                    Upload Config File
                    <VisuallyHiddenInput
                      type="file"
                      accept=".seospiderconfig"
                      onChange={(_e) => {
                        setConfigFile(_e.target.files?.[0]);
                        setConfigName(_e.target.files?.[0].name.replace('.seospiderconfig', '') || '');
                      }}
                    />
                  </Button>
                  {configFile && (
                    <Stack direction="row">
                      <InsertDriveFileOutlinedIcon fontSize="small" />
                      <Typography>
                        {configFile?.name}
                      </Typography>
                    </Stack>
                  )}
                </Stack>
              </Stack>
              <Stack direction="row" spacing={2} alignItems="center">
                <Typography variant="caption" sx={{width: 120}}>Name</Typography>
                <TextField
                  value={configName}
                  onChange={(_e: React.ChangeEvent<HTMLInputElement>) => { setConfigName(_e.target.value)}}
                  sx={{flexGrow: 1}}
                  disabled={!configFile}
                />
              </Stack>
              <Stack direction="row" spacing={2} alignItems="center">
                <Typography variant="caption" sx={{width: 120}}>Description</Typography>
                <TextField
                  value={configDescription}
                  onChange={(_e: React.ChangeEvent<HTMLInputElement>) => { setConfigDescription(_e.target.value)}}
                  sx={{flexGrow: 1}}
                  disabled={!configFile}
                />
              </Stack>
              <Divider />
            </Stack>
          </CardContent>
          <CardActions>
            <Button
              variant="contained"
              onClick={upload}
              disabled={configName === '' || configFile === undefined || uploading}
              startIcon={<CircularProgress color="success" size={20} sx={{display: uploading ? 'block' : 'none'}}/>}
            >
              Add New Config
            </Button>
          </CardActions>
        </Card>
      </Stack>
    </Container>
  );
}

export default Settings;
