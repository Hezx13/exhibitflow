import { useState } from 'react';
import {login} from '../api/user-api'
import NavBar from '../components/navBar';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { Navigate } from 'react-router-dom';
import { LinearProgress } from '@mui/material';
function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
    const handleLogin = async (event) => {
      event.preventDefault();
      setLoading(true)
       const response = await login({username, password})
       switch (response) {
        case 200: {
          setIsLoggedIn(!!localStorage.getItem('token'))
          break;
        }
        case 401: {
          setError("Invalid credentials")
          break;
        }
        case 403: {
          setError("Not approved")
          break;
        }
        case 404: {
          setError("User doesn't exist")
          break;
        }
        default: {
          setError("Unknown error")
        }
       }
       setLoading(false);
    };

    return (
        <Grid container>
          { isLoggedIn && <Navigate to="/"/>}
                <Grid item xs={12} sx={{marginBottom: '15px'}}>
                    <NavBar/>
                </Grid>
                <Grid item xs={12} sx={{marginBottom: '15px'}}>
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
            Sign in
          </Typography>
          <Box sx={{ width: '100%', textAlign: 'center', color: 'red' }}>
            {isLoading && <LinearProgress />}
            {error && <Typography component="h1" variant="h5" color="error">
                {error}
              </Typography>}
          </Box>
          <Box component="form" onSubmit={handleLogin} sx={{ mt: 1 }}>
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
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              value={password}
            onChange={(e) => setPassword(e.target.value)}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={isLoading}
              sx={{ mt: 3, mb: 2 }}
            >
              Log in
            </Button>
          </Box>
        </Box>
      </Container>
                </Grid>
                </Grid>
        
    );
}

export default Login;