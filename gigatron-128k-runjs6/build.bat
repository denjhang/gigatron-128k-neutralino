@echo off
echo Building Gigatron 128K Simulator...

REM Create output directory
if not exist "gigatron-128k-simulator" mkdir gigatron-128k-simulator

REM Copy HTML files
xcopy "html\*" "gigatron-128k-simulator\html\" /E /I /Y

REM Copy ROM and VHD files
copy "dev128k.rom" "gigatron-128k-simulator\" /Y
copy "sd.vhd" "gigatron-128k-simulator\" /Y
copy "favicon.ico" "gigatron-128k-simulator\" /Y

REM Create a launcher script
echo @echo off > "gigatron-128k-simulator\start.bat"
echo echo Starting Gigatron 128K Simulator... >> "gigatron-128k-simulator\start.bat"
echo start "" "http://localhost:8000/html/index_128k.html" >> "gigatron-128k-simulator\start.bat"

REM Create a simple HTTP server script
echo const http = require('http'); > "gigatron-128k-simulator\server.js"
echo const fs = require('fs'); >> "gigatron-128k-simulator\server.js"
echo const path = require('path'); >> "gigatron-128k-simulator\server.js"
echo. >> "gigatron-128k-simulator\server.js"
echo const server = http.createServer((req, res) => { >> "gigatron-128k-simulator\server.js"
echo   let filePath = '.' + req.url; >> "gigatron-128k-simulator\server.js"
echo   if (filePath === './') filePath = './html/index_128k.html'; >> "gigatron-128k-simulator\server.js"
echo. >> "gigatron-128k-simulator\server.js"
echo   const extname = String(path.extname(filePath)).toLowerCase(); >> "gigatron-128k-simulator\server.js"
echo   const contentType = { >> "gigatron-128k-simulator\server.js"
echo     '.html': 'text/html', >> "gigatron-128k-simulator\server.js"
echo     '.js': 'text/javascript', >> "gigatron-128k-simulator\server.js"
echo     '.css': 'text/css', >> "gigatron-128k-simulator\server.js"
echo     '.json': 'application/json', >> "gigatron-128k-simulator\server.js"
echo     '.png': 'image/png', >> "gigatron-128k-simulator\server.js"
echo     '.jpg': 'image/jpg', >> "gigatron-128k-simulator\server.js"
echo     '.ico': 'image/x-icon' >> "gigatron-128k-simulator\server.js"
echo   }[extname] || 'application/octet-stream'; >> "gigatron-128k-simulator\server.js"
echo. >> "gigatron-128k-simulator\server.js"
echo   fs.readFile(filePath, (error, content) => { >> "gigatron-128k-simulator\server.js"
echo     if (error) { >> "gigatron-128k-simulator\server.js"
echo       if (error.code === 'ENOENT') { >> "gigatron-128k-simulator\server.js"
echo         res.writeHead(404, { 'Content-Type': 'text/html' }); >> "gigatron-128k-simulator\server.js"
echo         res.end('<h1>404 Not Found</h1>'); >> "gigatron-128k-simulator\server.js"
echo       } else { >> "gigatron-128k-simulator\server.js"
echo         res.writeHead(500); >> "gigatron-128k-simulator\server.js"
echo         res.end('Sorry, check with the site admin for error: ' + error.code + ' ..\n'); >> "gigatron-128k-simulator\server.js"
echo       } >> "gigatron-128k-simulator\server.js"
echo     } else { >> "gigatron-128k-simulator\server.js"
echo       res.writeHead(200, { 'Content-Type': contentType }); >> "gigatron-128k-simulator\server.js"
echo       res.end(content, 'utf-8'); >> "gigatron-128k-simulator\server.js"
echo     } >> "gigatron-128k-simulator\server.js"
echo   }); >> "gigatron-128k-simulator\server.js"
echo }); >> "gigatron-128k-simulator\server.js"
echo. >> "gigatron-128k-simulator\server.js"
echo server.listen(8000, () => { >> "gigatron-128k-simulator\server.js"
echo   console.log('Server running at http://localhost:8000/'); >> "gigatron-128k-simulator\server.js"
echo }); >> "gigatron-128k-simulator\server.js"

REM Create a launcher that starts the server and opens the browser
echo @echo off > "gigatron-128k-simulator\Gigatron 128K Simulator.bat"
echo echo Starting Gigatron 128K Simulator... >> "gigatron-128k-simulator\Gigatron 128K Simulator.bat"
echo echo. >> "gigatron-128k-simulator\Gigatron 128K Simulator.bat"
echo echo Starting local server... >> "gigatron-128k-simulator\Gigatron 128K Simulator.bat"
echo start /B node server.js >> "gigatron-128k-simulator\Gigatron 128K Simulator.bat"
echo timeout /t 2 >nul >> "gigatron-128k-simulator\Gigatron 128K Simulator.bat"
echo echo Opening application in default browser... >> "gigatron-128k-simulator\Gigatron 128K Simulator.bat"
echo start http://localhost:8000 >> "gigatron-128k-simulator\Gigatron 128K Simulator.bat"

echo Build complete!
echo Output directory: gigatron-128k-simulator
echo.
echo To run the application, execute "Gigatron 128K Simulator.bat"
pause