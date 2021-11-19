import { Command, flags } from '@oclif/command'
import * as Listr from 'listr'
import * as fs from 'fs'
import { execSync } from "child_process"

const helloWorldFile = `
export default function greet(name = 'World') {
  return "Hello, " + name + "!"
}
`

const defaultEslintRC = `module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: [
    '@typescript-eslint',
  ],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
  ]
}
`

const defaultEslintIgnore = `module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: [
    '@typescript-eslint',
  ],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
  ]
}
`


class Tsetup extends Command {
  static description = 'Get a TypeScript off the ground quickly'

  static flags = {
    // add --version flag to show CLI version
    version: flags.version({char: 'v'}),
    help: flags.help({char: 'h'}),
  }


  async exec(command: string, args: string[] = [], printOutput = false) {
    const sargs = args.reduce((acc, arg) => `${acc} ${arg}`)
    const cmd = sargs.length > 0 ? `${command} ${sargs}` : `${command}`
    
    try {
      const res = execSync(cmd)
      if (printOutput) 
        this.log(res.toString())
    } catch (error) {
      throw error
    }

  }

  async run() {
    // Capture run params
    // const {args, flags} = this.parse(Tsetup)

    // Describe the tasks
    const tasks = new Listr([
      {
        title: "Initialize the npm project", // npm init -y
        task: async () => this.exec('npm', ['init', '-y']),
      },
      {
        title: "Update package.json", // npm init -y
        task: () => {
          const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'))
          packageJson.main = "dist/index.js"
          packageJson.license = "MIT"
          packageJson.version = "0.1.0"
          packageJson.scripts = {
            lint: "eslint src --ext .js,.jsx,.ts,.tsx", 
            prebuild: "npm run lint",
            build: "tsc",
            prestart: "npm run build",
            start: "node dist/index.js",
          }
          fs.writeFileSync('./package.json', JSON.stringify(packageJson, null, 2))
        },
      },
      {
        title: "Install typescript", // npm i -D typescript
        task: async () => this.exec('npm', ['i', '-D', 'typescript']),
      },
      {
        title: "Initialize the typescript project", // npm exec -y tsc --init
        task: async () => this.exec('npx', ['tsc', '--init']),
      },
      {
        title: "Create \"src\" and \"dist\" directories", // mkdir src dist
        task: async () => this.exec('mkdir', ['-p', 'src', 'dist']),
      },
      {
        title: "Adding placeholder \"src/index.ts\"", // TODO: this
        task: async () => {
          await this.exec('touch', ['src/index.ts'])
          try {
            fs.writeFileSync("src/index.ts", helloWorldFile)
          } catch (error) {
            throw error
          }
        },
      },
      {
        title: "Update the tsconfig", // Update tsconfig.json to add outDir and sourceMap
        task: () => {
          const tsconfig = {
            compilerOptions: {
              target: "es5",
              module: "commonjs",
              strict: true,
              outDir: "dist",
              sourceMap: true,
            }
          }
          fs.writeFileSync('./tsconfig.json', JSON.stringify(tsconfig, null, 2))
        },
      },
      {
        title: "Install eslint", // npm i -D eslint
        task: async () => this.exec("npm", ["i", "-D", "eslint", "@typescript-eslint/parser", "@typescript-eslint/eslint-plugin"]),
      },
      {
        title: "Creating a \".eslintrc.js\"",
        task: async () => {
          await this.exec('touch', ['.eslintrc.js'])
          try {
            fs.writeFileSync(".eslintrc.js", defaultEslintRC)
          } catch (error) {
            throw error
          }
        },
      },
      {
        title: "Creating a \".eslintignore\"",
        task: async () => {
          await this.exec('touch', ['.eslintignore'])
          try {
            fs.writeFileSync(".eslintignore", defaultEslintIgnore)
          } catch (error) {
            throw error
          }
        },
      },
      {
        title: "Set up eslint", // TODO: this
        task: async () => this.exec("npx", ["eslint", "--init"]),
      },
      {
        title: "Initialize a git repo", // npm init -y
        task: async () => this.exec('git', ['init']),
      },
    ])

    // Run the tasks
    tasks.run().catch((error: Error) => this.error(error))
  }
}

export = Tsetup
