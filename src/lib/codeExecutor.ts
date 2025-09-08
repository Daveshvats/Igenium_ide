import { exec } from 'child_process'
import { promisify } from 'util'
import fs from 'fs/promises'
import path from 'path'
import os from 'os'

const execAsync = promisify(exec)

export interface ExecutionResult {
  status: 'SUCCESS' | 'ERROR' | 'TIMEOUT' | 'MEMORY_LIMIT_EXCEEDED'
  output: string
  error: string
  executionTime: number
  memoryUsage: number
}

export class CodeExecutor {
  private tempDir: string

  constructor() {
    this.tempDir = path.join(os.tmpdir(), 'idearpit-executions')
  }

  async executeCode(
    code: string,
    language: string,
    input: string = '',
    timeLimit: number = 2000,
    memoryLimit: number = 128 // Currently not used but kept for future implementation
  ): Promise<ExecutionResult> {
    const startTime = Date.now()
    
    // Declare variables outside try block for cleanup in catch
    let filePath: string = ''
    let executablePath: string = ''
    let inputFile: string | null = null
    
    try {
      // Ensure temp directory exists
      await fs.mkdir(this.tempDir, { recursive: true })
      
      const fileName = `solution_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      filePath = path.join(this.tempDir, fileName)
      
      // Write code to file
      await fs.writeFile(filePath, code)
      
      // Write input to file if provided
      if (input) {
        inputFile = filePath + '.input'
        await fs.writeFile(inputFile, input)
      }
      
      // Execute based on language
      let command: string
      executablePath = filePath
      
      switch (language.toLowerCase()) {
        case 'javascript':
        case 'js':
          command = inputFile ? `node "${filePath}" < "${inputFile}"` : `node "${filePath}"`
          break
        case 'python':
        case 'py':
          command = inputFile ? `python "${filePath}" < "${inputFile}"` : `python "${filePath}"`
          break
        case 'java':
          // Compile Java first
          const className = 'Solution'
          const javaPath = filePath + '.java'
          await fs.writeFile(javaPath, code)
          await execAsync(`javac "${javaPath}"`)
          command = inputFile ? `java -cp "${this.tempDir}" ${className} < "${inputFile}"` : `java -cp "${this.tempDir}" ${className}`
          executablePath = javaPath
          break
        case 'cpp':
        case 'c++':
          // Compile C++ first
          const cppPath = filePath + '.cpp'
          const exePath = filePath + '.exe'
          await fs.writeFile(cppPath, code)
          await execAsync(`g++ -o "${exePath}" "${cppPath}"`)
          command = inputFile ? `"${exePath}" < "${inputFile}"` : `"${exePath}"`
          executablePath = exePath
          break
        default:
          throw new Error(`Unsupported language: ${language}`)
      }
      
      // Execute with timeout
      const { stdout, stderr } = await execAsync(command, {
        timeout: timeLimit,
        maxBuffer: 1024 * 1024, // 1MB buffer
      })
      
      const executionTime = Date.now() - startTime
      
      // Clean up files
      await this.cleanup(filePath, executablePath, inputFile)
      
      return {
        status: 'SUCCESS',
        output: stdout.trim(),
        error: stderr.trim(),
        executionTime,
        memoryUsage: 0, // TODO: Implement memory usage tracking
      }
      
    } catch (error: unknown) {
      const executionTime = Date.now() - startTime
      
      // Clean up files
      if (filePath) {
        await this.cleanup(filePath, executablePath, inputFile)
      }
      
      if (error && typeof error === 'object' && 'code' in error && error.code === 'TIMEOUT') {
        return {
          status: 'TIMEOUT',
          output: '',
          error: 'Time limit exceeded',
          executionTime,
          memoryUsage: 0,
        }
      }
      
      return {
        status: 'ERROR',
        output: '',
        error: error instanceof Error ? error.message : 'Execution failed',
        executionTime,
        memoryUsage: 0,
      }
    }
  }
  
  private async cleanup(filePath: string, executablePath?: string, inputFile?: string | null) {
    try {
      // Clean up main file
      await fs.unlink(filePath).catch(() => {})
      
      // Clean up executable if different
      if (executablePath && executablePath !== filePath) {
        await fs.unlink(executablePath).catch(() => {})
      }
      
      // Clean up input file
      if (inputFile) {
        await fs.unlink(inputFile).catch(() => {})
      }
      
      // Clean up related files
      const basePath = filePath.replace(/\.[^/.]+$/, '')
      const extensions = ['.java', '.cpp', '.exe', '.class', '.input']
      
      for (const ext of extensions) {
        await fs.unlink(basePath + ext).catch(() => {})
      }
    } catch {
      // Ignore cleanup errors
    }
  }
}

export const codeExecutor = new CodeExecutor()
