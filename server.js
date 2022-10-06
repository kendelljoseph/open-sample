const morgan = require('morgan')
const cors = require('cors')
const express = require('express');
const entity = require('./routes/entity');
const app = express();
const port = 3000;

app.use(cors())
app.use(express.json())
app.use(morgan('tiny'))
app.use('/v1/entity', entity);
app.get('/', (req, res) => {
  res.send('App Online');
})

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
})