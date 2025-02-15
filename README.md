## Elven monorepo

TODO link other readmes

## Development

### HTTPS Local Development

The development server runs on HTTPS for secure local development. When you run `npm run dev:server`, the setup script will automatically:

1. Check if development SSL certificates exist
2. Generate new self-signed certificates if needed
3. Start the HTTPS development server

The first time you access the development server in your browser, you'll see a security warning because we're using self-signed certificates. This is normal for local development, and you can safely proceed by accepting the certificate warning.

The development server will be available at `https://localhost:3000` (or your specified PORT).
