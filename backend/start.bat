@echo off
cd /d "%~dp0src"
javac *.java
if errorlevel 1 (
  echo Java compilation failed. Install JDK 17 or later and check JAVA_HOME/PATH.
  pause
  exit /b 1
)
java FlowgateServer
pause
