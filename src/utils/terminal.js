/**
 * Shared terminal utility for creating terminal windows
 */

export const createTerminalWindow = () => {
  const terminalWindow = window.open('', '_blank', 'width=800,height=600,scrollbars=yes,resizable=yes')
  
  if (!terminalWindow) {
    throw new Error('Failed to open terminal. Please allow popups.')
  }

  terminalWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>CodeWonderAI Terminal</title>
      <style>
        body {
          background: #1e1e1e;
          color: #d4d4d4;
          font-family: 'Consolas', 'Monaco', monospace;
          margin: 0;
          padding: 20px;
          overflow: hidden;
        }
        .terminal {
          height: 100vh;
          display: flex;
          flex-direction: column;
        }
        .terminal-header {
          background: #2d2d2d;
          padding: 10px;
          border-bottom: 1px solid #404040;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .terminal-buttons {
          display: flex;
          gap: 5px;
        }
        .terminal-button {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          border: none;
        }
        .close { background: #ff5f56; }
        .minimize { background: #ffbd2e; }
        .maximize { background: #27ca3f; }
        .terminal-title {
          color: #d4d4d4;
          font-size: 14px;
        }
        .terminal-content {
          flex: 1;
          padding: 20px;
          overflow-y: auto;
          font-size: 14px;
          line-height: 1.5;
        }
        .terminal-input {
          background: transparent;
          border: none;
          color: #d4d4d4;
          font-family: inherit;
          font-size: 14px;
          outline: none;
          width: 100%;
        }
        .prompt {
          color: #4ec9b0;
        }
        .output {
          margin: 10px 0;
        }
        .error {
          color: #f48771;
        }
        .success {
          color: #4ec9b0;
        }
        .warning {
          color: #dcdcaa;
        }
      </style>
    </head>
    <body>
      <div class="terminal">
        <div class="terminal-header">
          <div class="terminal-buttons">
            <button class="terminal-button close"></button>
            <button class="terminal-button minimize"></button>
            <button class="terminal-button maximize"></button>
          </div>
          <div class="terminal-title">CodeWonderAI Terminal</div>
        </div>
        <div class="terminal-content">
          <div class="output">
            <span class="prompt">$</span> Welcome to CodeWonderAI Terminal
          </div>
          <div class="output">
            <span class="prompt">$</span> Type 'help' for available commands
          </div>
          <div class="output">
            <span class="prompt">$</span> <input type="text" class="terminal-input" id="terminalInput" placeholder="Enter command...">
          </div>
        </div>
      </div>
      
      <script>
        const input = document.getElementById('terminalInput');
        const content = document.querySelector('.terminal-content');
        
        function addOutput(text, type = '') {
          const output = document.createElement('div');
          output.className = 'output ' + type;
          output.innerHTML = '<span class="prompt">$</span> ' + text;
          content.appendChild(output);
          content.scrollTop = content.scrollHeight;
        }
        
        function executeCommand(command) {
          const cmd = command.toLowerCase().trim();
          
          switch(cmd) {
            case 'help':
              addOutput('Available commands:', 'success');
              addOutput('  help - Show this help message', '');
              addOutput('  clear - Clear terminal', '');
              addOutput('  ls - List files', '');
              addOutput('  pwd - Show current directory', '');
              addOutput('  npm install - Install dependencies', '');
              addOutput('  npm start - Start the project', '');
              addOutput('  npm run build - Build the project', '');
              addOutput('  exit - Close terminal', '');
              break;
            case 'clear':
              content.innerHTML = '<div class="output"><span class="prompt">$</span> <input type="text" class="terminal-input" id="terminalInput" placeholder="Enter command..."></div>';
              document.getElementById('terminalInput').focus();
              break;
            case 'ls':
              addOutput('package.json', '');
              addOutput('src/', '');
              addOutput('public/', '');
              addOutput('node_modules/', '');
              break;
            case 'pwd':
              addOutput('/workspace', 'success');
              break;
            case 'npm install':
              addOutput('Installing dependencies...', 'warning');
              setTimeout(() => addOutput('Dependencies installed successfully!', 'success'), 2000);
              break;
            case 'npm start':
              addOutput('Starting development server...', 'warning');
              setTimeout(() => addOutput('Server started on http://localhost:3000', 'success'), 1500);
              break;
            case 'npm run build':
              addOutput('Building project...', 'warning');
              setTimeout(() => addOutput('Build completed successfully!', 'success'), 3000);
              break;
            case 'exit':
              window.close();
              break;
            default:
              addOutput('Command not found: ' + command + '. Type "help" for available commands.', 'error');
          }
        }
        
        input.addEventListener('keypress', (e) => {
          if (e.key === 'Enter') {
            const command = input.value;
            addOutput(command);
            executeCommand(command);
            input.value = '';
          }
        });
        
        input.focus();
      </script>
    </body>
    </html>
  `)

  return terminalWindow
}
