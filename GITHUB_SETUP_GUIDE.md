# GitHub Pages Setup Guide for Your CV

Complete step-by-step guide to set up your CV as a GitHub Pages repository.

## Prerequisites

Before starting, you'll need:
1. A GitHub account (free at [github.com](https://github.com))
2. Git installed on your computer
3. Your CV files (already prepared in this folder)

## Step 1: Install Git

### Windows:
1. Download Git from: https://git-scm.com/download/win
2. Run the installer and accept all default options
3. Restart your terminal/PowerShell after installation
4. Verify installation: Open PowerShell and type `git --version`

## Step 2: Create a GitHub Repository

1. Go to **[github.com](https://github.com)** and sign in to your account
2. Click the **+** icon in the top-right corner
3. Select **New repository**
4. Configure the repository:
   - **Repository name**: `icz_cv_page` (or `USERNAME.github.io` for custom domain)
   - **Description**: "Professional CV website - Ignacio Cuiral Zueco"
   - **Public**: Yes (required for GitHub Pages)
   - **Initialize with**: Leave unchecked (we already have files)
5. Click **Create repository**
6. Copy the repository URL (looks like: `https://github.com/YOUR_USERNAME/icz_cv_page.git`)

## Step 3: Initialize Local Repository

Open PowerShell and navigate to your CV folder:

```powershell
cd "C:\Users\Nacho trabajo\Desktop\icz_cv_page"
```

Then run these commands:

```powershell
git init
git config user.email "ignaciocuiral@unizar.es"
git config user.name "Ignacio Cuiral Zueco"
git add .
git commit -m "Initial commit: Professional CV website"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/icz_cv_page.git
git push -u origin main
```

**Important**: Replace `YOUR_USERNAME` with your actual GitHub username!

## Step 4: Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** (tab at top)
3. In the left sidebar, click **Pages**
4. Under "Source", select:
   - **Branch**: `main`
   - **Folder**: `/ (root)`
5. Click **Save**
6. Wait 1-2 minutes for GitHub to deploy your site
7. Your CV will be live at:
   - `https://YOUR_USERNAME.github.io/icz_cv_page` (if repo is `icz_cv_page`)
   - `https://YOUR_USERNAME.github.io` (if repo is `USERNAME.github.io`)

## Step 5: Update Your CV (Future Changes)

After making changes to `index.html`:

```powershell
cd "C:\Users\Nacho trabajo\Desktop\icz_cv_page"
git add .
git commit -m "Update CV content"
git push
```

Your site will automatically update within a few seconds!

## Tips & Best Practices

### Custom Domain (Optional)
If you want a custom domain like `ignaciocuiral.com`:
1. Buy a domain from services like GoDaddy, Namecheap, etc.
2. Go to repository **Settings** → **Pages**
3. Under "Custom domain", enter your domain
4. Add DNS records as instructed (usually CNAME or A records)

### Making Updates
Every time you change `index.html`:
```powershell
git add .
git commit -m "Brief description of changes"
git push
```

### Checking Status
```powershell
git status        # See what's changed
git log --oneline # See commit history
```

## Troubleshooting

**"git is not recognized"**
- You need to install Git first. See Step 1.
- Restart PowerShell after installation.

**"Permission denied" on push**
- Generate an SSH key or use HTTPS with a Personal Access Token
- Guide: https://docs.github.com/en/authentication

**Site not showing up**
- Check repository Settings → Pages is enabled
- Verify branch is set to `main`
- Wait 2-3 minutes, then refresh
- Check the "Deployments" tab in your repository

**Want to change repository name later?**
1. Go to repository Settings
2. Scroll to "Danger Zone" → "Rename"
3. Update the remote on your local copy:
   ```powershell
   git remote set-url origin https://github.com/YOUR_USERNAME/NEW_NAME.git
   git push
   ```

## File Structure

Your repository now contains:
```
icz_cv_page/
├── index.html         # Your CV website (main file)
├── README.md         # Repository documentation
├── .gitignore        # Tells git what files to ignore
└── .git/             # Git repository data (hidden folder)
```

## Next Steps

1. ✅ Ensure all files are in the folder
2. ✅ Install Git on your computer
3. ✅ Create a GitHub repository
4. ✅ Push your code to GitHub
5. ✅ Enable GitHub Pages
6. ✅ Visit your live CV!

## Resources

- GitHub Pages Documentation: https://pages.github.com/
- Git Basics: https://git-scm.com/book/en/v2
- Markdown Guide: https://www.markdownguide.org/
- GitHub Help: https://help.github.com/

---

**Questions?** Check the GitHub Community: https://github.community/

Good luck with your CV website! 🚀
