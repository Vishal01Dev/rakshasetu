import app from './app';
import { env } from './config/env'; // from your earlier env.ts setup

const PORT = env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
