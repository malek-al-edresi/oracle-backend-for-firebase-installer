const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);

// Substitute variables in a SQL script (&1, &2, etc)
function substituteVariables(sql, variables = {}) {
  let result = sql;
  
  // Replace direct key matches if they exist
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`&${key}\\b`, 'g');
    result = result.replace(regex, value);
  }
  
  return result;
}

// Check if a command is available on the system
async function commandExists(command) {
  try {
    const checkCmd = process.platform === 'win32' ? 'where' : 'which';
    await execAsync(`${checkCmd} ${command}`);
    return true;
  } catch (err) {
    return false;
  }
}

// Compare semantic versions (v1 >= v2)
function versionGreaterThanOrEqual(v1, v2) {
  const parts1 = v1.split('.').map(Number);
  const parts2 = v2.split('.').map(Number);
  
  for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
    const p1 = parts1[i] || 0;
    const p2 = parts2[i] || 0;
    
    if (p1 > p2) return true;
    if (p1 < p2) return false;
  }
  return true;
}

module.exports = {
  substituteVariables,
  commandExists,
  versionGreaterThanOrEqual
};
