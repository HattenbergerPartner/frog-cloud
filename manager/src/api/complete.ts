import { TasksInterface } from '../interfaces/Tasks';

export const checkComplete = async (): Promise<TasksInterface[]> => {
  const url = new URL('http://localhost:5000/complete');
  return await fetch(url.href, {
    method: 'post',
    headers: {
      'Content-Type':'application/json',
    },
  })
  .then(async (response) => {
    if (!response.ok) {
      throw new Error('error')
    }
    return await response.json();
  })
  .catch((error: Error) => {
    throw error
  });
}