@echo off
set /p Build=<VERSION
echo BSOServer - Windows
echo Fetching newest updates...
echo Init GitHub Repo...
git init
if ERRORLEVEL 1 (
	echo Can't download files, is GitHub installed?
	pause
	exit)

echo Downloading files from GitHub...
git pull https://github.com/thallosaurus/BadSpeechOnly-sever.git
echo %Build%
echo Starting node.js...
start node app.js
if ERRORLEVEL 1 (
	echo "Can't start node.js, is node.js installed?"
	pause
	exit)
