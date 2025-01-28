import React, { useEffect, useRef, useState } from 'react';
import { Link, useParams } from "react-router-dom";
/* FC */
import Status from "../Status/Status";
/* MUI */
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Chip from '@mui/material/Chip';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Fab from '@mui/material/Fab';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
/* Icons */
import CancelIcon from '@mui/icons-material/Cancel';
import VerticalAlignBottomIcon from '@mui/icons-material/VerticalAlignBottom';
import VerticalAlignTopIcon from '@mui/icons-material/VerticalAlignTop';
/* APIs */
import { checkCrawl, cancelCrawl } from '../../api/request';
/* Interfaces */
import { TasksInterface } from '../../interfaces/Tasks';

let apiRefresh = setTimeout(() => {}, 0);

function Crawl() {
  const scrollTop = useRef<HTMLDivElement | null>(null);
  const scrollBottom = useRef<HTMLDivElement | null>(null);
  const [taskID, setTaskID] = useState<string>('');
  const [task, setTask] = useState<TasksInterface | undefined>(undefined);
  const [taskStatus, setTaskStatus] = useState<string>('');
  const [taskMsgs, setTaskMsgs] = useState<string[]>([]);
  const [serverCPU, setServerCPU] = useState<number>(0);
  const [serverVM, setServerVM] = useState<number>(0);
  const [serverDisk, setServerDisk] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  let { crawlID } = useParams();

  const check = (): void => {
    setLoading(true);

    if(taskID !== '') {
      void checkCrawl(taskID).then((data: any) => {
        setTaskStatus(data?.task.status);
        setTask(data?.task);
        setTaskMsgs(data?.task.status !== 'done' ? data?.msg : data?.task.report_data.output);
        setServerCPU(data?.server?.cpu);
        setServerVM(data?.server?.vm);
        setServerDisk(data?.server?.disk);
        
        clearTimeout(apiRefresh);
        if((data.task.status === 'requested'
          || data.task.status === 'started'
        ) && data.task_id !== '') {
          apiRefresh = setTimeout(() => {
            check();
          }, 2000);
        }
        else {
          setLoading(false);
        }
      });
    }
  }

  const stop = (): void => {
    if(taskID !== '') {
      void cancelCrawl(taskID).then((data: any) => {
        clearTimeout(apiRefresh);
        check();
      });
    }
  }

  useEffect(() => {
    if(taskID !== '') {
      clearTimeout(apiRefresh);
      setTaskStatus('');
      setTaskMsgs([]);
      check();
    }
  }, [taskID]);

  useEffect(() => {
    if(crawlID !== undefined) {
      setTaskID(crawlID);
    }
  }, [crawlID]);

  useEffect(() => {
    scrollBottom?.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [taskMsgs]);

  return (
    <Container maxWidth="xl" sx={{pt: 2, pb: 10}}>
      <Status cpu={serverCPU} vm={serverVM} disk={serverDisk} />
      <Typography variant="h1">
        Crawl
      </Typography>
      <Stack>
        {loading && (
          <Stack direction="row" spacing={2} alignItems="center">
            <IconButton color="success">
              <CircularProgress size="30px" />
            </IconButton>
            <Typography>Crawling</Typography>
          </Stack>
        )}
        {(taskStatus !== '') && (
          <Box>
            <Paper sx={{minHeight: 40}} variant="outlined">
              <Stack direction="row" sx={{p: 1}}>
                <Stack direction="row" sx={{flexGrow: 1}} alignItems="center" spacing={1}>
                  <Box>
                    <Chip label={taskStatus} />
                  </Box>
                  <Typography component={Link} to={task?.start_url || ''}>{task?.start_url}</Typography>
                  {(taskStatus === 'request' || taskStatus === 'started') && (
                    <Button
                      startIcon={<CancelIcon />}
                      variant="outlined"
                      color="error"
                      size="small"
                      onClick={stop}
                    >
                      Cancel Crawl
                    </Button>
                  )}
                </Stack>
                <Stack direction="row" spacing={2}>
                  <Typography>
                    {task?.start_time !== undefined ? new Intl.DateTimeFormat(undefined, {dateStyle: 'short', timeStyle: 'short'}).format(new Date(task.start_time)) : ''}
                  </Typography>
                  <Typography>
                    {task?.end_time !== undefined && task.end_time !== null ? new Intl.DateTimeFormat(undefined, {dateStyle: 'short', timeStyle: 'short'}).format(new Date(task.end_time)) : ''}
                  </Typography>
                  <Box>
                    {task?.start_time !== undefined && task?.end_time !== undefined && task.end_time !== null ?
                      `${((new Date(task.end_time).valueOf() - new Date(task.start_time).valueOf()) / 60000).toFixed(0)} minutes`
                      : ''
                    }
                  </Box>
                </Stack>
              </Stack>
              {(task !== undefined && taskStatus === 'done') && (
                <Stack divider={<Divider />}>
                  {task.report_data.reports.map((report: any, index: number) => (
                    <Stack key={index} direction="row" spacing={1} alignItems="center" sx={{p: 1}}>
                      <Typography>{report.path}</Typography>
                      <Typography variant="caption" sx={{flexGrow: 1}}>({(report.size / 1024).toFixed(1)}kb)</Typography>
                      <Button
                        component={Link}
                        variant="contained"
                        size="small"
                        to={`http://localhost/crawl-data/${task.task_id}/${report.path}`}
                        target="_blank"
                        sx={{width: 200}}
                       >
                        Download CSV
                      </Button>
                    </Stack>
                   ))}
                </Stack>
              )}
            </Paper>
          </Box>
        )}
      </Stack>
      <Box
        sx={{
          position: 'relative',
          minHeight: 200,
          backgroundColor: 'rgba(50, 50, 50, 1)',
        }}
      >
        <Typography sx={{p: 0.5, color: 'rgba(240, 240, 240, 1)', fontSize: 20}}>
          Crawl Log
        </Typography>
        <Box
          sx={{
            maxHeight: '60vh',
            overflowY: 'auto',
            color: 'rgba(0, 255, 0, 1)',
            fontSize: 12,
            fontFamily: 'monospace'

          }}

        >
          <Box ref={scrollTop} />
          {taskMsgs.map((msg: any, index: number) => (
            <Stack key={index} direction="row" spacing={0.5} sx={{backgroundColor: `rgba(60, 60, 60, ${index % 2 === 0 ? 1 : 0})`}}>
              <Box
                sx={{
                  pr: 1,
                  minWidth: 50,
                  textAlign: 'right',
                  color: 'rgba(240, 240, 240, 1)',
                  backgroundColor: 'rgba(100, 100, 100, 0.5)',
                }}
              >
                {index}
              </Box>
              <Box>
               {msg.msg}
              </Box>
            </Stack>
          ))}
          <Box ref={scrollBottom} />
        </Box>
        <Fab
          color="primary"
          sx={{
            position: 'absolute',
            right: 20,
            top: 40,
          }}
          onClick={() => scrollTop?.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
        >
          <VerticalAlignTopIcon />
        </Fab>
        <Fab
          color="primary"
          sx={{
            position: 'absolute',
            right: 20,
            bottom: 10,
          }}
          onClick={() => scrollBottom?.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })}
        >
          <VerticalAlignBottomIcon />
        </Fab>
      </Box>
    </Container>
  );
}

export default Crawl;
