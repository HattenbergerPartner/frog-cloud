
export const startCrawl = async (
  requestURL: string,
  requestReports: string[],
  configId: string,
): Promise<any> => {
  const url = new URL('/api/crawl', window.location.origin);
  return await fetch(url.href, {
    method: 'post',
    headers: {
      'Content-Type':'application/json',
    },
    body: JSON.stringify({
      'requestURL': requestURL,
      'requestReports': requestReports,
      'configId': configId,
    })
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

export const checkCrawl = async (
  taskID: string,
): Promise<any> => {
  const url = new URL('/api/status', window.location.origin);
  return await fetch(url.href, {
    method: 'post',
    headers: {
      'Content-Type':'application/json',
    },
    body: JSON.stringify({
      'task_id': taskID
    })
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

export const cancelCrawl = async (
  taskID: string,
): Promise<any> => {
  const url = new URL('/api/cancel', window.location.origin);
  return await fetch(url.href, {
    method: 'post',
    headers: {
      'Content-Type':'application/json',
    },
    body: JSON.stringify({
      'task_id': taskID
    })
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