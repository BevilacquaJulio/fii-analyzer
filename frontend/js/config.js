const AppConfig = {
  API_URL: (() => {
    const { protocol, hostname, port } = window.location;
    if (protocol === 'file:') return 'http://localhost:3000/api';
    if (port === '3000') return '/api';
    return `http://${hostname || 'localhost'}:3000/api`;
  })()
};
