# See: <https://github.com/casey/just/blob/5969e396f4e5c98b64a5df929e3ee67629295d6e/examples/powershell.just>
# Cross platform shebang:
shebang := if os() == 'windows' {
  'powershell.exe'
} else {
  '/usr/bin/env pwsh'
}

# Set shell for non-Windows OSs:
set shell := ["powershell", "-c"]

# Set shell for Windows OSs:
set windows-shell := ["powershell.exe", "-NoProfile", "-NonInteractive", "-NoLogo", "-Command"]

help:
    @Write-Output "cdebug: Run the container with a debugger";
    @Write-Output "crun: Run the container without a debugger";

cdebug:
    docker compose up --build debug-app

crun:
    docker compose up --build prod-app

activate-venv:
    @.\.venv\Scripts\activate.ps1

openapi: activate-venv
    @python .\gen_openapi.py
