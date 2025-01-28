export interface TasksInterface {
  id: number,
  status: string,
  start_url: string,
  task_id: string,
  start_time: string,
  end_time: string,
  report_data: {
    directory: string,
    reports: string[],
  }
}
