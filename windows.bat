@ECHO OFF
TITLE MANGAFOX MANGA DOWNLOADER
ECHO MANGAFOX MANGA DOWNLOADER
IF EXIST %CD%\node_modules\NUL GOTO :1
ECHO INSTALLING NODE MODULES PLEASE WAIT...
call npm install
:1
ECHO.
node manga
ECHO.
ECHO [1] DOWNLOAD ANOTHER MANGA
ECHO [2] EXIT
SET /P choice=ENTER YOUR CHOICE : 
GOTO :%choice%
:2
EXIT