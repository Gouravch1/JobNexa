const API_BASE_URL = 'http://localhost:8080/api';

async function request(endpoint, options = {}) {
  const { method = 'GET', headers = {}, body, ...rest } = options;

  const token = localStorage.getItem('authToken');

  const isFormData = body instanceof FormData;

  const finalHeaders = isFormData
    ? { ...headers }
    : {
        'Content-Type': 'application/json',
        ...headers,
      };

  if (token) {
    finalHeaders.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers: finalHeaders,
    body,
    ...rest,
  });

  if (response.status === 401) {
    try {
      localStorage.removeItem('user');
      localStorage.removeItem('authToken');
    } catch (e) {
      // ignore storage errors
    }
    window.location.href = '/';
    throw new Error('Unauthorized');
  }

  return response;
}

async function get(endpoint) {
  const response = await request(endpoint, { method: 'GET' });
  return response;
}

async function post(endpoint, body, options = {}) {
  const isFormData = body instanceof FormData;

  const headers = isFormData ? options.headers || {} : options.headers || {};
  const payload = isFormData ? body : JSON.stringify(body);

  const response = await request(endpoint, {
    method: 'POST',
    headers,
    body: payload,
    ...options,
  });
  return response;
}

async function put(endpoint, body, options = {}) {
  const headers = options.headers || {};
  const response = await request(endpoint, {
    method: 'PUT',
    headers,
    body: JSON.stringify(body),
    ...options,
  });
  return response;
}

async function del(endpoint, options = {}) {
  const headers = options.headers || {};
  const response = await request(endpoint, {
    method: 'DELETE',
    headers,
    ...options,
  });
  return response;
}

const apiClient = {
  request,
  get,
  post,
  put,
  del,
};

export default apiClient;

