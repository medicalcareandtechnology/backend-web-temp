try {
    const { OAuth2Client } = require('google-auth-library');
    console.log('google-auth-library resolved successfully');
    console.log('Path:', require.resolve('google-auth-library'));
} catch (err) {
    console.error('Failed to resolve google-auth-library');
    console.error(err);
    console.log('Current directory:', process.cwd());
    console.log('Node modules paths:', module.paths);
}
