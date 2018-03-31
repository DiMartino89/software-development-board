
/**
 * getEnvironment - Returns the current environment, or development by default
 * @returns {String}
 */
export const getEnvironment = () => process.env.NODE_ENV
  ? process.env.NODE_ENV
  : 'development';


/**
 * getApiUrl  - Returns the URL for the api, given the current environment
 * @returns {String}
 */
export const getApiUrl = () => {
  switch (getEnvironment()) {
    case 'production':
      return 'http://api.sdb-domain.com';
    case 'stage':
      return 'http://api-stage.sdb-stage-domain.com';
    case 'test':
      return 'http://api-test.sdb-test-domain.com';
    case 'development':
    default:
      return 'http://localhost:3000';
  }
};


/**
 * getAppUrl  - Returns the URL for the app, given the environment
 * @returns {String}
 */
export const getAppUrl = () => {
  switch (getEnvironment()) {
    case 'production':
      return 'http://app.sdb-domain.com';
    case 'stage':
      return 'http://app-stage.sdb-stage-domain.com';
    case 'test':
      return 'http://app-test.sdb-test-domain.com';
    case 'development':
    default:
      return 'http://localhost:8080';
  }
};
