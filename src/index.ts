import { Command, flags } from '@oclif/command'
import * as Listr from 'listr'
import * as fs from 'fs'
import { exec } from "child_process"

const helloWorldFile = `
export default function greet(name: string = 'World'): string {
  return "Hello, " + name + "!"
}
`

class Tsetup extends Command {
  static description = 'Get a TypeScript off the ground quickly'

  static flags = {
    // add --version flag to show CLI version
    version: flags.version({char: 'v'}),
    help: flags.help({char: 'h'}),
    // flag with a value (-n, --name=VALUE)
    name: flags.string({char: 'n', description: 'name to print'}),
    // flag with no value (-f, --force)
    force: flags.boolean({char: 'f'}),
  }

  static args = [{name: 'file'}]

  async delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  async exec(command: string, args: string[] = [], printOutput = false) {
    await this.delay(1000)

    const sargs = args.reduce((acc, arg) => `${acc} ${arg}`)
    const cmd = sargs.length > 0 ? `${command} ${sargs}` : `${command}`
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        throw error
      }

      // Stop if not printing output
      if (!printOutput) return

      // Print to stderr if it exists
      if (stderr)
        this.error(stderr)

      // Print to stdout if it exists
      if (stdout)
        this.log(stdout)
    })
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
        title: "Install typescript", // npm i -D typescript
        task: async () => this.exec('npm', ['i', '-D', 'typescript']),
      },
      {
        title: "Initialize the typescript project", // npm exec -y tsc --init
        task: async () => this.exec('npm', ['exec', '-y', 'tsc', '--init']),
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
        skip: () => true,
        task: async () => this.exec("echo", ["Hello, world"]),
      },
      {
        title: "Install eslint", // npm i -D eslint
        task: async () => this.exec("npm", ["i", "-D", "eslint"]),
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
