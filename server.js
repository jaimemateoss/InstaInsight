import express from 'express';
import { IgApiClient } from 'instagram-private-api';
import session from 'express-session';
import path from 'path';
import bodyParser from 'body-parser';
import puppeteer from 'puppeteer';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config(); // Cargar variables de entorno

const app = express();
const port = process.env.PORT || 3000;

// Configuración de variables para Instagram
const IG_CLIENT_ID = '3804774203173101';
const IG_CLIENT_SECRET = '8e342fa5d04446ae7a934e43bf7b6365';
const IG_REDIRECT_URI = process.env.IG_REDIRECT_URI || 'http://localhost:3000/auth/instagram/callback';

app.use(express.static(path.join(process.cwd(), 'Presentation')));
app.use(express.static(path.join(process.cwd(), 'App')));
app.use(express.static(path.join(process.cwd(), 'Images')));

app.use(session({
  secret: '@J25m01l2008!',
  resave: false,
  saveUninitialized: true,
}));

app.use(bodyParser.json());

const ig = new IgApiClient();

// Endpoint para iniciar sesión con Instagram
app.get('/auth/instagram', (req, res) => {
  const authUrl = `https://api.instagram.com/oauth/authorize/?client_id=${IG_CLIENT_ID}&redirect_uri=${IG_REDIRECT_URI}&response_type=code`;
  res.redirect(authUrl);
});

// Endpoint de callback de Instagram
app.get('/auth/instagram/callback', async (req, res) => {
  const { code } = req.query;

  if (!code) {
    return res.status(400).json({ error: 'Código de autorización no proporcionado' });
  }

  try {
    // Intercambiar código de autorización por token de acceso
    const response = await axios.post('https://api.instagram.com/oauth/access_token', {
      client_id: IG_CLIENT_ID,
      client_secret: IG_CLIENT_SECRET,
      grant_type: 'authorization_code',
      redirect_uri: IG_REDIRECT_URI,
      code: code
    });

    const { access_token, user } = response.data;

    // Guardar información del usuario en la sesión
    req.session.username = user.username;
    req.session.avatarUrl = user.profile_picture;

    res.redirect('/app');  // Redirige al usuario a la página principal de tu aplicación
  } catch (error) {
    console.error('Error al obtener el token de acceso:', error);
    res.status(500).json({ error: 'Error al obtener el token de acceso' });
  }
});

// Endpoint para obtener información del usuario
app.get('/api/user-info', (req, res) => {
  const username = req.session.username;
  if (username) {
    res.status(200).json({
      username: username,
      avatarUrl: req.session.avatarUrl
    });
  } else {
    res.status(401).json({ error: 'No autorizado' });
  }
});

// Endpoint para cerrar sesión
app.post('/api/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error al cerrar sesión:', err);
      return res.status(500).json({ error: 'Error al cerrar sesión' });
    }
    res.status(200).json({ message: 'Sesión cerrada exitosamente' });
  });
});

// Servir archivos estáticos
app.get('/', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'Presentation', 'index.html'));
});

app.get('/home', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'Presentation', 'index.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'Presentation', 'login.html'));
});

app.get('/app', (req, res) => {
  if (!req.session.username) {
    return res.redirect('/login');
  }
  res.sendFile(path.join(process.cwd(), 'App', 'app.html'));
});

app.listen(port, () => {
  console.log(`Servidor iniciado en http://localhost:${port}`);
});
