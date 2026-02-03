# GitHub Pages Setup Script for CV
# This script automates the setup process after you've installed Git

Write-Host "=== CV to GitHub Pages Setup ===" -ForegroundColor Cyan
Write-Host ""

# Check if Git is installed
Write-Host "Checking for Git installation..." -ForegroundColor Yellow
$gitCheck = git --version 2>$null
if ($null -eq $gitCheck) {
    Write-Host "❌ Git is not installed!" -ForegroundColor Red
    Write-Host "Please install Git from: https://git-scm.com/download/win" -ForegroundColor Yellow
    Write-Host "Then restart PowerShell and run this script again." -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}
Write-Host "✓ Git is installed: $gitCheck" -ForegroundColor Green
Write-Host ""

# Configure Git (optional - change if needed)
Write-Host "Configuring Git..." -ForegroundColor Yellow
git config user.email "ignaciocuiral@unizar.es"
git config user.name "Ignacio Cuiral Zueco"
Write-Host "✓ Git configured" -ForegroundColor Green
Write-Host ""

# Initialize repository
Write-Host "Initializing Git repository..." -ForegroundColor Yellow
git init
git add .
git commit -m "Initial commit: Professional CV website with modern design"
Write-Host "✓ Repository initialized with initial commit" -ForegroundColor Green
Write-Host ""

# Set main branch
Write-Host "Setting up main branch..." -ForegroundColor Yellow
git branch -M main
Write-Host "✓ Main branch configured" -ForegroundColor Green
Write-Host ""

# Add remote
Write-Host ""
Write-Host "=" * 60
Write-Host "NEXT STEPS:" -ForegroundColor Cyan
Write-Host "=" * 60
Write-Host ""
Write-Host "1. Create a GitHub repository at: https://github.com/new" -ForegroundColor White
Write-Host "   - Name: icz_cv_page (or USERNAME.github.io)" -ForegroundColor Gray
Write-Host "   - Make it PUBLIC" -ForegroundColor Gray
Write-Host "   - Don't initialize with README" -ForegroundColor Gray
Write-Host ""

Write-Host "2. Copy the repository URL from GitHub (HTTPS)" -ForegroundColor White
Write-Host ""

$repoUrl = Read-Host "3. Paste your GitHub repository URL here"

if ($repoUrl -eq "") {
    Write-Host "No URL provided. Setup incomplete." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Adding remote and pushing to GitHub..." -ForegroundColor Yellow
git remote add origin $repoUrl
git push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✓ Successfully pushed to GitHub!" -ForegroundColor Green
    Write-Host ""
    Write-Host "=" * 60
    Write-Host "FINAL STEP - Enable GitHub Pages:" -ForegroundColor Cyan
    Write-Host "=" * 60
    Write-Host ""
    Write-Host "1. Go to your GitHub repository" -ForegroundColor White
    Write-Host "2. Click Settings (top right)" -ForegroundColor White
    Write-Host "3. Click Pages (left sidebar)" -ForegroundColor White
    Write-Host "4. Select Branch: main, Folder: / (root)" -ForegroundColor White
    Write-Host "5. Click Save" -ForegroundColor White
    Write-Host ""
    Write-Host "⏳ Wait 1-2 minutes, then visit:" -ForegroundColor Yellow
    Write-Host "   https://YOUR_USERNAME.github.io/icz_cv_page" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "🎉 Your CV is now live!" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "❌ Push failed. Make sure:" -ForegroundColor Red
    Write-Host "   - The repository URL is correct" -ForegroundColor Gray
    Write-Host "   - Your GitHub authentication is set up" -ForegroundColor Gray
    Write-Host ""
    Write-Host "For authentication help:" -ForegroundColor Yellow
    Write-Host "   https://docs.github.com/en/get-started/quickstart/set-up-git" -ForegroundColor Gray
}

Read-Host "Press Enter to exit"
