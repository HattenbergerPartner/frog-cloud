import React, { useEffect, useState } from 'react';
import { Link } from "react-router-dom";
/* MUI */
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Container from '@mui/material/Container';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
/* Icons */
import AutorenewIcon from '@mui/icons-material/Autorenew';
/* API */
import { checkComplete } from '../../api/complete';
/* Interfaces */
import { TasksInterface } from '../../interfaces/Tasks';

function Complete() {
  const [tasks, setTasks] = useState<TasksInterface[]>([]);

  const check = (): void => {
    setTasks([]);
    void checkComplete().then((data: any) => {
      setTasks(data.tasks);
    });
  }

  useEffect(() => {
    check();
  }, []);

  return (
    <Container maxWidth="xl" sx={{pt: 2}}>
      <Stack direction="row" alignItems="center">
        <Typography variant="h1">Completed</Typography>
        <IconButton onClick={check}>
          <AutorenewIcon />
        </IconButton>
      </Stack>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{width: 100}}>Status</TableCell>
              <TableCell>URL</TableCell>
              <TableCell>Time</TableCell>
              <TableCell sx={{width: 300}}>Reports</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tasks.map((task: any, index: number) => (
              <TableRow key={index}>
                <TableCell>
                  <Chip label={task.status} />
                </TableCell>
                <TableCell>
                  {task.start_url}
                </TableCell>
                <TableCell>
                  <Stack>
                    <Typography>
                      {task.start_time !== null ? new Intl.DateTimeFormat(undefined, {dateStyle: 'short', timeStyle: 'short'}).format(new Date(task.start_time)) : ''}
                    </Typography>
                    <Typography>
                      {task.end_time !== null ? new Intl.DateTimeFormat(undefined, {dateStyle: 'short', timeStyle: 'short'}).format(new Date(task.end_time)) : ''}
                    </Typography>
                  </Stack>
                </TableCell>
                <TableCell>
                  <Button
                    component={Link}
                    to={`/crawl/${task.task_id}`}
                    variant="contained"
                  >
                    View crawl
                  </Button>
                </TableCell>
              </TableRow>
           ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
}

export default Complete;
