@echo off
echo BSOServer - Windows
title BSOServer Console
echo Fetching newest updates...
echo Init GitHub Repo...
git init
if ERRORLEVEL 1 (
	echo Can't download files, is GitHub installed?
	pause
	exit)

echo Downloading files from GitHub...
git pull https://github.com/thallosaurus/BadSpeechOnly-sever.git
set /p Build=<VERSION
echo %Build%
echo Starting node.js...
node app.js 666 production
if ERRORLEVEL 1 (
	echo Can't start node.js, is node.js installed?
	pause
	exit)
