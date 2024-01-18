import express from 'express';
import aggregateRoute from './routes/aggregator.route';

const app = express();
app.use(express.json());

// Use the swap route
app.use('/api', aggregateRoute);

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
