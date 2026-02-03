# 🚀 Quick Start Guide

## Your CV is Ready for GitHub Pages!

Everything is prepared. Follow these simple steps:

### Step 1: Install Git (if not already installed)

Download and install Git from: **https://git-scm.com/download/win**

### Step 2: Run the Setup Script (Easiest Method ⭐)

1. Open PowerShell in this folder (right-click → "Open PowerShell here")
2. Run: `.\setup-github.ps1`
3. Follow the prompts

**OR manually follow the steps in `GITHUB_SETUP_GUIDE.md`**

### Step 3: Create GitHub Repository

1. Go to **https://github.com/new**
2. Enter:
   - **Repository name**: `icz_cv_page`
   - **Description**: Professional CV website
   - **Visibility**: Public ✓
3. Click **Create repository**
4. Copy the HTTPS URL

### Step 4: Connect & Push (If Using Setup Script)

The setup script will ask for your repository URL. Paste it in.

**OR manually in PowerShell:**
```powershell
git remote add origin https://github.com/YOUR_USERNAME/icz_cv_page.git
git push -u origin main
```

### Step 5: Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** → **Pages**
3. Select:
   - Branch: `main`
   - Folder: `/ (root)`
4. Click **Save**

### Step 6: Visit Your Site! 🎉

After 1-2 minutes, your CV will be live at:
```
https://YOUR_USERNAME.github.io/icz_cv_page
```

---

## 📁 What's in This Folder?

| File | Purpose |
|------|---------|
| `index.html` | Your CV website (main file) |
| `README.md` | GitHub repository description |
| `.gitignore` | Tells Git which files to ignore |
| `setup-github.ps1` | Automated setup script |
| `GITHUB_SETUP_GUIDE.md` | Detailed step-by-step guide |
| `QUICKSTART.md` | This file |

---

## ✨ What You Get

✅ Professional CV website  
✅ Hosted for free on GitHub Pages  
✅ Your own domain: `github.com/YOUR_USERNAME/icz_cv_page`  
✅ Easy updates: just edit and push  
✅ Version control of all changes  
✅ Professional-looking repository  

---

## 📝 Making Updates

After you change anything in `index.html`:

```powershell
git add .
git commit -m "Update CV content"
git push
```

Changes appear live within seconds!

---

## 🎯 Repository Name Options

Choose one:

**Option A** (Recommended): 
- Repo name: `icz_cv_page`
- Website: `https://USERNAME.github.io/icz_cv_page`

**Option B** (Professional):
- Repo name: `USERNAME.github.io`
- Website: `https://USERNAME.github.io`

---

## ❓ Need Help?

1. **Setup issues?** → Read `GITHUB_SETUP_GUIDE.md`
2. **Git commands?** → See troubleshooting section in guide
3. **GitHub help?** → https://help.github.com

---

## 🏁 You're All Set!

Everything is configured. Just install Git and run the setup script! 

**Good luck with your CV website! 🚀**
