const app = require('./app');

const port = process.env.PORT || 3001;

const onServerStarted = () => console.log(`Server listening on port ${port}`);

app.listen(port, onServerStarted);
