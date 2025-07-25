let pyodide = null;
let marked = null;


const loadScript = (src) => {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve(); // Already loaded
      return;
    }

    const script = document.createElement("script");
    script.src = src;
    script.type = "text/javascript";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load script ${src}`));
    document.head.appendChild(script);
  });
};



export const runCode = async (language, code) => {
  // console.log("code in runCode:", code)
  switch (language) {
    case 'javascript':
      return runJS(code);

    case 'typescript':
      return await runTS(code);

    case 'python':
      return await runPython(code);

    case 'markdown':
      return await runMarkdown(code);

    case 'json':
      return runJSON(code);

    case 'html':
    case 'css':
      return runHTMLorCSS(code);

    case 'java':
    case 'c':
    case 'cpp':
      return await runWithPiston(language, code);

    default:
      return code;
  }
};

// Individual handlers:
const runJS = async (code) => {
  // console.log("code in runJS: ", code)
  const logs = [];

  // Backup original console.log
  const originalLog = console.log;

  // Override console.log to capture output
  console.log = (...args) => {
    logs.push(args.map(String).join(' '));
  };

  try {
    // Wrap code in async IIFE so await works
    await eval(`(async () => { ${code} })()`);
  } catch (err) {
    logs.push(`Error: ${err.message || err}`);
  }

  // Restore console.log
  console.log = originalLog;

  // Return all logs joined by newline, or a default message
  return logs.length > 0 ? logs.join('\n') : '(no output)';
};


const runTS = async (code) => {
  try {
    const mod = await import('https://cdn.skypack.dev/typescript');
    const ts = mod.default || mod;
    const output = ts.transpileModule(code, {
      compilerOptions: { module: ts.ModuleKind.CommonJS }
    });
    return String(eval(output.outputText));
  } catch (err) {
    return `Error: ${err}`;
  }
};

const runJSON = (code) => {
  try {
    const parsed = JSON.parse(code);
    return JSON.stringify(parsed, null, 2);
  } catch (err) {
    return `Invalid JSON: ${err}`;
  }
};

const runHTMLorCSS = (code) => {
  const blob = new Blob([code], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  return `<iframe src="${url}" class="w-full h-96 border-none" />`;
};

const runMarkdown = async (code) => {
  if (!marked) {
    const mod = await import('https://cdn.skypack.dev/marked');
    marked = mod.marked;
  }
  return marked.parse(code);
};


const runPython = async (code) => {
  if (!pyodide) {
    console.log("Loading Pyodide...");
    await loadScript("https://cdn.jsdelivr.net/pyodide/v0.28.0/full/pyodide.js");

    if (!window.loadPyodide) {
      console.error("Pyodide script loaded, but window.loadPyodide is undefined.");
      throw new Error("Pyodide failed to load.");
    }

    pyodide = await window.loadPyodide();
    console.log("Pyodide initialized.");
  }

  try {
    const wrapped = `
import sys
import io

_stdout = sys.stdout
sys.stdout = io.StringIO()

try:
    exec(${JSON.stringify(code)})
except Exception as e:
    print(e)

output = sys.stdout.getvalue()
sys.stdout = _stdout
output
      `;
    return await pyodide.runPythonAsync(wrapped);
  } catch (err) {
    return `Python Error: ${err}`;
  }
};






const runWithPiston = async (lang, code) => {
  try {
    const response = await fetch('https://emkc.org/api/v2/piston/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ language: lang, source: code })
    });

    const result = await response.json();
    return result.output || result.message || 'No output';
  } catch (err) {
    return `Error calling compiler API: ${err}`;
  }
};
