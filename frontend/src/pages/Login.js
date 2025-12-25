import React, { useState, useContext } from 'react';
import { Container, Box, Typography, TextField, Button, Alert } from '@mui/material';
import { useNavigate, Link } from 'react-router-dom';
import apiClient from '../api/axios';
import { AuthContext } from '../context/AuthContext';

const Login = () => {
  const [credentials, setCredentials] = useState({
    subdomain: '',
    email: '',
    password: '',
  });
  const [errorMessage, setErrorMessage] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await apiClient.post('/auth/login', credentials);
      login(response.data.token);
      navigate('/dashboard');
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Failed to login. Please try again.');
    }
  };

  return (
    <Container maxWidth="xs">
      <Box sx={{ mt: 8, p: 4, boxShadow: 3, borderRadius: 2, bgcolor: 'background.paper' }}>
        <Typography variant="h4" align="center" gutterBottom>
          Login
        </Typography>

        {errorMessage && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errorMessage}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            margin="normal"
            label="Tenant Subdomain"
            name="subdomain"
            value={credentials.subdomain}
            onChange={handleChange}
            required
          />
          <TextField
            fullWidth
            margin="normal"
            label="Email"
            name="email"
            type="email"
            value={credentials.email}
            onChange={handleChange}
            required
          />
          <TextField
            fullWidth
            margin="normal"
            label="Password"
            name="password"
            type="password"
            value={credentials.password}
            onChange={handleChange}
            required
          />

          <Button fullWidth variant="contained" type="submit" sx={{ mt: 3 }}>
            Login
          </Button>
        </form>

        <Typography sx={{ mt: 2, textAlign: 'center' }}>
          Don't have a tenant? <Link to="/register">Register here</Link>
        </Typography>
      </Box>
    </Container>
  );
};

export default Login;
