const chalk = require('chalk');
const ora = require('ora');

class Logger {
  constructor() {
    this.spinner = null;
  }

  // Basic console logging with optional prefix
  _log(message, colorFunc, prefix = '') {
    if (this.spinner && this.spinner.isSpinning) {
      this.spinner.stop();
    }
    console.log(colorFunc(`${prefix}${message}`));
  }

  info(message) {
    this._log(message, chalk.blue, '[INFO] ');
  }

  pass(message) {
    this._log(message, chalk.green, '  [✔] ');
  }

  warn(message) {
    this._log(message, chalk.yellow, '  [!] ');
  }

  fail(message) {
    this._log(message, chalk.red, '  [✖] ');
  }

  step(message) {
    if (this.spinner && this.spinner.isSpinning) {
      this.spinner.stop();
    }
    console.log(chalk.cyan(`\n➤ ${message}`));
  }

  section(title) {
    if (this.spinner && this.spinner.isSpinning) {
      this.spinner.stop();
    }
    console.log(chalk.bold.magenta(`\n══════════════════════════════════════════════════════════════`));
    console.log(chalk.bold.magenta(`  ${title}`));
    console.log(chalk.bold.magenta(`══════════════════════════════════════════════════════════════`));
  }

  startSpinner(text) {
    if (this.spinner && this.spinner.isSpinning) {
      this.spinner.text = text;
    } else {
      this.spinner = ora({
        text,
        color: 'cyan'
      }).start();
    }
  }

  succeedSpinner(text) {
    if (this.spinner) {
      this.spinner.succeed(chalk.green(text || this.spinner.text));
      this.spinner = null;
    }
  }

  failSpinner(text) {
    if (this.spinner) {
      this.spinner.fail(chalk.red(text || this.spinner.text));
      this.spinner = null;
    }
  }
  
  stopSpinner() {
    if (this.spinner && this.spinner.isSpinning) {
      this.spinner.stop();
      this.spinner = null;
    }
  }
  
  error(err) {
      this.stopSpinner();
      console.error(chalk.red(`\n[ERROR] ${err.message}`));
      if(err.stack) {
          console.error(chalk.gray(err.stack));
      }
  }
}

module.exports = new Logger();
