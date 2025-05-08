import React, { useState } from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { useRegisterMutation } from '../store/api/userApi';

const Register = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [department, setDepartment] = useState('');
  const [email, setEmail] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [register] = useRegisterMutation();
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match!');
      return;
    }

    try {
      // Replace with your backend API endpoint as needed.
      const response = await register({ username, password, email, department });

      if (response.data) {
        setSuccessMessage('Successfully registered!');
        setUsername('');
        setPassword('');
        setConfirmPassword('');
      }
    } catch (error) {
      setErrorMessage('Error during registration. Please try again.');
    }
  };

  return (
    <Grid container>
      <Grid item xs={12} sx={{ marginBottom: '15px' }}>
        <Container component="main" maxWidth="xs">
          <Box
            sx={{
              marginTop: 8,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Avatar sx={{ m: 1, bgcolor: 'orange' }}>
              <LockOutlinedIcon />
            </Avatar>
            <Typography component="h1" variant="h5" color="#e3f2fd">
              Registration
            </Typography>
            {errorMessage && (
              <Typography component="h1" variant="h5" color="error">
                {errorMessage}
              </Typography>
            )}
            {successMessage && (
              <Typography component="h1" variant="h5" color="success.dark">
                {successMessage}
              </Typography>
            )}
            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
              <TextField
                margin="normal"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                fullWidth
                label="Username"
                name="username"
                autoFocus
              />
              <TextField
                margin="normal"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                fullWidth
                label="Email"
                name="email"
              />
              <TextField
                margin="normal"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                required
                fullWidth
                label="Department"
                name="department"
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Confirm Password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={!!successMessage}
                sx={{ mt: 3, mb: 2 }}
              >
                Sign up
              </Button>
            </Box>
          </Box>
        </Container>
      </Grid>
    </Grid>
  );
};

export default Register;
