process.on('uncaughtException', () => {
  console.log(null, 'ERROR: ');
  process.exit(0);
})

require('./security');
require('./session');
require('./validator');
require('./storage');
require('./services');
require('./modules');
