const configs = {
  codeDelay: 1000,
};

const localConfigs = localStorage.getItem('configs');
if (localConfigs) {
  try {
    const parsedConfigs = JSON.parse(localConfigs);
    Object.assign(configs, parsedConfigs);
  } catch (e) {
    console.error('Failed to parse configs from local storage');
  }
}

localStorage.setItem('configs', JSON.stringify(configs));

const getConfig = () => {
  return {
    codeDelay: configs.codeDelay,
  };
};

export default getConfig;
