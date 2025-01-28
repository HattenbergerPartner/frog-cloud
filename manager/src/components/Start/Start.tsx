import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
/* MUI */
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';
import Container from '@mui/material/Container';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import FormLabel from '@mui/material/FormLabel';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
/* Icons */
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
/* APIs */
import { getConfigs } from '../../api/config';
import { startCrawl } from '../../api/request';

function Start() {
  const [requestURL, setRequestURL] = useState<string>('');
  const [configs, setConfigs] = useState<any[]>([]);
  const [selectedConfigId, setSelectedConfigId] = useState<string>('default');
  const [reportTypes, setReportTypes] = useState<string[]>([]);
  const [reportOptions, setReportOptions] = useState<any[]>([]);
  const [requestReports, setRequestReports] = useState<any[]>([{csv: "internal_all", label:"All", report: "Internal:All", section: "Internal" }]);
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const crawl = (): void => {
    setLoading(true);
    void startCrawl(requestURL, requestReports, selectedConfigId).then((data: any) => {
      setLoading(false);
      navigate(`/crawl/${data.task}`);
    });
  }

  const updateRequestReport = (selectedReport: any): void => {
    if (requestReports.some(report=> report.csv === selectedReport.csv)) {
      setRequestReports(requestReports.filter(report => report.csv !== selectedReport.csv));
    }
    else {
      setRequestReports([...requestReports, selectedReport]);
    }
  }

  const checkConfigs = (): void => {
    setConfigs([]);
    void getConfigs().then((data: any) => {
      setConfigs(data.configs);
      setReportTypes(data.reportTypes);
      setReportOptions(data.reports);
    });
  }

  useEffect(() => {
    checkConfigs();
  }, []);

  return (
    <Container maxWidth="xl" sx={{pt: 2, pb: 2}}>
      <Typography variant="h1">
        Crawl a website
      </Typography>
      <Box>
        <Stack spacing={2}>
          <Card>
            <CardContent>
              <Stack direction="row" spacing={2}>
                <TextField
                  label="URL"
                  value={requestURL}
                  disabled={loading}
                  onChange={(_e: React.ChangeEvent<HTMLInputElement>) => {
                    setRequestURL(_e.target.value);
                  }}
                />
                <Button
                  variant="contained"
                  onClick={crawl}
                  disabled={loading}
                >
                  Start Crawl
                </Button>
              </Stack>
              <Box sx={{maxHeight: 100, overflowY: 'auto'}}>
                <FormControl>
                  <FormLabel>Configuration</FormLabel>
                  <RadioGroup
                    row
                    value={selectedConfigId}
                    onChange={(_e: React.ChangeEvent<HTMLInputElement>) => setSelectedConfigId((_e.target as HTMLInputElement).value)}
                  >
                    <FormControlLabel value="default" control={<Radio />} label="Default" />
                    {configs?.map((config: any, index: number) => (
                      <FormControlLabel
                        key={index}
                        value={config.config_id}
                        control={<Radio />}
                        label={config.name}
                      />
                    ))}
                  </RadioGroup>
                </FormControl>
              </Box>
            </CardContent>
          </Card>
          <Card>
            <CardHeader title={
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography variant="h5">
                  Export Reports
                </Typography>
                <Chip label={`${requestReports.length} Selected`} />
              </Stack>
            }/>
            <CardContent
              sx={{
                p: 0,
                maxHeight: '50vh',
                overflowY: 'auto',
              }}
            >
              {reportTypes.map((report: any, index: number) => (
                <Accordion key={index} slotProps={{ transition: { unmountOnExit: true } }}>
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                  >
                    {`${report}`}
                  </AccordionSummary>
                  <AccordionDetails>
                    <FormGroup>
                      {reportOptions
                        .filter((option: any) => option.section === report)
                        .sort((a, b) => a.report.localeCompare(b.report))
                        .map((option: any, index: number) => (
                        <FormControlLabel
                          key={index}
                          control={<Checkbox size="small" />}
                          label={option.label}
                          onChange={() => updateRequestReport(option)}
                          checked={requestReports.some(report => report.csv === option.csv)}
                          disabled={option.csv === 'internal_all'}
                         />
                       ))}
                    </FormGroup>
                  </AccordionDetails>
                </Accordion>
               ))}
              </CardContent>
          </Card>
        </Stack>
      </Box>
    </Container>
  );
}

export default Start;
