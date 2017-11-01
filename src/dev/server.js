import { EOL } from 'os';
import getPort from 'get-port'; // eslint-disable-line

import logger from '../lib/defaultLogger';
import app from './app';

// Get the port from the various places it can be set
const mode =
  process.env.NODE_ENV === 'production' || process.env.GRAMPS_MODE === 'live'
    ? 'live'
    : 'mock';

// Start the server, then display app details and URL info.
getPort(8080).then(port => {
  app.set('port', port);
  app.listen(app.get('port'), () => {
    const message = [
      `${EOL}============================================================`,
      `    GrAMPS is running in ${mode} mode on port ${port}`,
      '',
      `    GraphiQL: http://localhost:${port}/graphiql`,
      `============================================================${EOL}`,
    ];
    logger.info(message.join(EOL)); // eslint-disable-line no-console
  });
});
