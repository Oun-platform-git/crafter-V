# Check if Node.js is installed
try {
    node --version
    Write-Host "Node.js is installed"
} catch {
    Write-Host "Please install Node.js from https://nodejs.org/"
    exit 1
}

# Install dependencies
Write-Host "Installing dependencies..."
npm install

# Create uploads directory
if (!(Test-Path -Path "uploads")) {
    New-Item -ItemType Directory -Path "uploads"
    Write-Host "Created uploads directory"
}

# Check if .env exists
if (!(Test-Path -Path ".env")) {
    Copy-Item ".env.example" ".env"
    Write-Host "Created .env file from .env.example"
    Write-Host "Please update the .env file with your configuration"
}

# Build TypeScript
Write-Host "Building TypeScript..."
npm run build

Write-Host "Setup complete!"
Write-Host "Please make sure MongoDB and Redis are running"
Write-Host "To start the development server, run: npm run dev"
