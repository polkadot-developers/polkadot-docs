@echo off
setlocal enabledelayedexpansion

set VENV=venv
set PIP=%VENV%\Scripts\pip.exe
set MKDOCS=%VENV%\Scripts\mkdocs.exe
set PYTHON=%VENV%\Scripts\python.exe
set SCRIPTS_DIR=scripts

:: Detect python3 or python
set PYTHON_BIN=
where python3.10 >nul 2>&1 && set PYTHON_BIN=python3.10
if "%PYTHON_BIN%"=="" where python3 >nul 2>&1 && set PYTHON_BIN=python3
if "%PYTHON_BIN%"=="" where python >nul 2>&1 && set PYTHON_BIN=python
if "%PYTHON_BIN%"=="" (
    echo Error: No Python interpreter found.
    echo Install Python 3 from https://python.org and ensure it is added to PATH.
    exit /b 1
)

if "%1"=="" goto help
if "%1"=="install" goto install
if "%1"=="reinstall" goto reinstall
if "%1"=="serve" goto serve
if "%1"=="build" goto build
if "%1"=="gen-cookbook" goto gen-cookbook
if "%1"=="help" goto help
echo Unknown target: %1
goto help

:reinstall
if exist %VENV%\.installed del %VENV%\.installed
goto install

:install
if exist %VENV%\.installed goto :eof
echo Using %PYTHON_BIN% to create virtual environment...
%PYTHON_BIN% -m venv %VENV%
if errorlevel 1 (
    echo.
    echo Error: Failed to create virtual environment.
    echo   Ensure Python 3 is installed and the venv module is available.
    echo   On Windows, reinstall Python from https://python.org and check "Add to PATH".
    exit /b 1
)
%PIP% install --upgrade pip
if errorlevel 1 (
    echo.
    echo Error: Failed to upgrade pip.
    echo   Check your internet connection and try again.
    exit /b 1
)
%PIP% install -r requirements.txt
if errorlevel 1 (
    echo.
    echo Error: Failed to install dependencies from requirements.txt.
    echo   Verify the file exists and your internet connection is working.
    echo   Then re-run: Makefile.bat install
    exit /b 1
)
type nul > %VENV%\.installed
echo Setup complete.
goto :eof

:serve
if not exist %VENV%\.installed call :install
if errorlevel 1 exit /b 1
%MKDOCS% serve %~2
if errorlevel 1 (
    echo.
    echo Error: Failed to start the local server.
    echo   If port 8000 is already in use, run manually:
    echo   %MKDOCS% serve --dev-addr=127.0.0.1:8001
    exit /b 1
)
goto :eof

:build
if not exist %VENV%\.installed call :install
if errorlevel 1 exit /b 1
%MKDOCS% build --strict %~2
if errorlevel 1 (
    echo.
    echo Error: Build failed. Fix the errors above, then re-run: Makefile.bat build
    echo   Tip: run "Makefile.bat serve" to preview and identify broken references interactively.
    exit /b 1
)
goto :eof

:gen-cookbook
if "%TARGET%"=="" (
    echo Error: TARGET is required.
    echo   Usage: set TARGET=smart-contracts/cookbook ^& Makefile.bat gen-cookbook
    exit /b 1
)
if not exist %VENV%\.installed call :install
if errorlevel 1 exit /b 1
%PYTHON% %SCRIPTS_DIR%\generate-cookbook-indexes.py %TARGET%
if errorlevel 1 (
    echo.
    echo Error: Failed to generate cookbook index for "%TARGET%".
    echo   Ensure the path exists under polkadot-docs/ and contains a .nav.yml file.
    exit /b 1
)
goto :eof

:help
echo Please use "Makefile.bat [target]" where [target] is one of:
echo   install       to create a virtual environment and install all doc dependencies
echo   reinstall     to force reinstall of all dependencies (use when remote requirements change)
echo   serve         to watch, rebuild, and serve the docs locally with live reload (http://127.0.0.1:8000)
echo                   pass extra flags as a second arg: Makefile.bat serve "--watch-theme"
echo   build         to build the static site and validate it compiles cleanly (mirrors CI)
echo                   pass extra flags as a second arg: Makefile.bat build "-d site"
echo   gen-cookbook  to regenerate the cookbook index table (set TARGET=path/to/section)
goto :eof
