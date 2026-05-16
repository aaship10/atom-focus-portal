const fs = require('fs');

function convertHtmlToJsx(htmlFile, jsxFile, componentName) {
  let html = fs.readFileSync(htmlFile, 'utf8');
  let bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/);
  if (!bodyMatch) {
    console.error('No body tag found in', htmlFile);
    return;
  }
  let body = bodyMatch[1];
  body = body.replace(/class=/g, 'className=')
             .replace(/for=/g, 'htmlFor=')
             .replace(/<!--(.*?)-->/gs, '{/* $1 */}')
             .replace(/<input([^>]*[^\/])>/g, '<input$1 />')
             .replace(/<img([^>]*[^\/])>/g, '<img$1 />')
             .replace(/<br>/g, '<br />')
             .replace(/<hr>/g, '<hr />')
             .replace(/style="([^"]*)"/g, (match, p1) => {
                 let styleStr = p1.split(';').filter(s => s.trim()).map(s => {
                     let [key, val] = s.split(':');
                     if (!key || !val) return '';
                     key = key.trim().replace(/-([a-z])/g, g => g[1].toUpperCase());
                     return `${key}: "${val.trim().replace(/"/g, "'")}"`;
                 }).filter(Boolean).join(', ');
                 return `style={{${styleStr}}}`;
             });
  
  const content = `import React from 'react';
import { Link } from 'react-router-dom';

export default function ${componentName}() {
  return (
    <div className="flex min-h-screen">
      ${body}
    </div>
  );
}
`;
  fs.writeFileSync(jsxFile, content);
  console.log(`Converted ${htmlFile} to ${jsxFile}`);
}

convertHtmlToJsx('goal_creation_form.html', 'src/pages/GoalCreationForm.jsx', 'GoalCreationForm');
convertHtmlToJsx('manager_dashboard.html', 'src/pages/ManagerDashboard.jsx', 'ManagerDashboard');
convertHtmlToJsx('employee_dashboard.html', 'src/pages/EmployeeDashboard.jsx', 'EmployeeDashboard');
convertHtmlToJsx('login_page.html', 'src/pages/LoginPage.jsx', 'LoginPage');
convertHtmlToJsx('signup_page.html', 'src/pages/SignupPage.jsx', 'SignupPage');
