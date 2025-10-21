import { SettingsInterface, SettingsUpdateInterface } from '../interfaces/Settings';

export const checkSettings = async (): Promise<SettingsInterface> => {
  const url = new URL('/api/settings', window.location.origin);
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

export const updateSettings = async (settings: SettingsUpdateInterface): Promise<any> => {
  const url = new URL('/api/update', window.location.origin);
  return await fetch(url.href, {
    method: 'post',
    headers: {
      'Content-Type':'application/json',
    },
    body: JSON.stringify({
      'settings': settings
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
