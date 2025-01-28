export const getConfigs = async (): Promise<any[]> => {
  const url = new URL('http://localhost:5000/configs');
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

export const uploadConfig = async (
  configName: string,
  configDescription: string,
  configData: any
): Promise<any> => {
  const url = new URL('http://localhost:5000/upload-config');
  const formData = new FormData();
  formData.append('name', configName);
  formData.append('description', configDescription);
  formData.append('file', configData);
  return await fetch(url.href, {
    method: 'post',
    body: formData,
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

export const removeConfig = async (
  configId: string,
): Promise<any> => {
  const url = new URL('http://localhost:5000/remove-config');
  return await fetch(url.href, {
    method: 'post',
    headers: {
      'Content-Type':'application/json',
    },
    body: JSON.stringify({
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
