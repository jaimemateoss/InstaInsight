const express = require('express');
const { IgApiClient } = require('instagram-private-api');
const config = require('./config.json');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Servir archivos estáticos de las carpetas Presentation y Main
app.use(express.static(path.join(__dirname, 'Presentation')));
app.use(express.static(path.join(__dirname, 'Main')));

// Inicializa el cliente de Instagram
async function loginToInstagram() {
  const ig = new IgApiClient();
  ig.state.generateDevice(config.username);
  await ig.account.login(config.username, config.password);
  return ig;
}

// Ruta para obtener seguidores
app.get('/api/followers', async (req, res) => {
  try {
    const ig = await loginToInstagram();
    const followersFeed = ig.feed.accountFollowers(ig.state.cookieUserId);
    const followers = await getAllItems(followersFeed);
    res.json(followers.map(f => f.username));
  } catch (error) {
    console.error('Error fetching followers:', error.message);
    res.status(500).json({ error: 'Failed to fetch followers' });
  }
});

// Ruta para obtener seguidos
app.get('/api/following', async (req, res) => {
  try {
    const ig = await loginToInstagram();
    const followingFeed = ig.feed.accountFollowing(ig.state.cookieUserId);
    const following = await getAllItems(followingFeed);
    res.json(following.map(f => f.username));
  } catch (error) {
    console.error('Error fetching following:', error.message);
    res.status(500).json({ error: 'Failed to fetch following' });
  }
});

// Ruta para obtener usuarios que no te siguen de vuelta
app.get('/api/not-following-back', async (req, res) => {
  try {
    const ig = await loginToInstagram();
    const followersFeed = ig.feed.accountFollowers(ig.state.cookieUserId);
    const followingFeed = ig.feed.accountFollowing(ig.state.cookieUserId);

    const followers = await getAllItems(followersFeed);
    const following = await getAllItems(followingFeed);

    const notFollowingBack = following.filter(user => !followers.some(follower => follower.pk === user.pk));
    res.json(notFollowingBack.map(f => f.username));
  } catch (error) {
    console.error('Error fetching not following back:', error.message);
    res.status(500).json({ error: 'Failed to fetch not following back' });
  }
});

// Ruta para obtener usuarios que no sigues de vuelta
app.get('/api/not-followed-back', async (req, res) => {
  try {
    const ig = await loginToInstagram();
    const followersFeed = ig.feed.accountFollowers(ig.state.cookieUserId);
    const followingFeed = ig.feed.accountFollowing(ig.state.cookieUserId);

    const followers = await getAllItems(followersFeed);
    const following = await getAllItems(followingFeed);

    const notFollowedBack = followers.filter(follower => !following.some(user => user.pk === follower.pk));
    res.json(notFollowedBack.map(f => f.username));
  } catch (error) {
    console.error('Error fetching not followed back:', error.message);
    res.status(500).json({ error: 'Failed to fetch not followed back' });
  }
});

// Función auxiliar para obtener todos los elementos de un feed
async function getAllItems(feed) {
  const items = [];
  let response = await feed.items();
  items.push(...response);

  while (feed.isMoreAvailable()) {
    response = await feed.items();
    items.push(...response);
  }

  return items;
}

// Ruta para servir el archivo index.html como página principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'Presentation', 'index.html'));
});

// Ruta para servir el archivo main.html desde la carpeta Main
app.get('/main', (req, res) => {
  res.sendFile(path.join(__dirname, 'Main', 'main.html'));
});

// Inicia el servidor
app.listen(port, () => {
  console.log(`Servidor iniciado en http://localhost:${port}`);
});
