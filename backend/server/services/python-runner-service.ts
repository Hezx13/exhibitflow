import { spawn } from "child_process";
import path from 'path';

class PythonRunnerService {
    private pythonExecutable: string
    private pyServerPath: string

    constructor() {
        this.pyServerPath = process.env.PY_SERVER_PATH || path.join(__dirname, '../../py-server');
        this.pythonExecutable = process.env.PYTHON_EXECUTABLE || path.join(this.pyServerPath, '.venv', 'bin', 'python3');
    }

  public runOcrPythonScript (scriptName: string = 'simple_test.py', jobId: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const pythonProcess = spawn(this.pythonExecutable, [scriptName, jobId], {
        cwd: this.pyServerPath,
      });

      let stdout = '';
      let stderr = '';

      pythonProcess.stdout?.on('data', (data) => {
        stdout += data.toString();
      });

      pythonProcess.stderr?.on('data', (data) => {
        stderr += data.toString();
      });

      pythonProcess.on('close', (code) => {
        if (code === 0) {
          resolve(stdout);
        } else {
          reject(new Error(`Process exited with code ${code}: ${stderr}`));
        }
      });

      pythonProcess.on('error', (error) => {
        reject(error);
      });

      // Set timeout
      const timeout = setTimeout(() => {
        pythonProcess.kill();
        reject(new Error('Process timeout after 120 seconds'));
      }, 120000);

      pythonProcess.on('close', () => clearTimeout(timeout));
    });
  }
    
}

export default PythonRunnerService;