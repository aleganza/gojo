const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(__dirname, '..'); // points to deppiu/

const config = getDefaultConfig(projectRoot);

// Include the monorepo root so node_modules can be resolved
config.watchFolders = [workspaceRoot];

// Tell Metro where to look for node_modules
config.resolver.nodeModulesPaths = [
  path.join(projectRoot, 'node_modules'),
  path.join(workspaceRoot, 'node_modules'),
];

module.exports = config;