#!/usr/bin/env python3
"""
Add Sidebar to dashboard pages with proper indentation and structure.
"""

import re

def add_sidebar_to_page(filepath, import_statement=None):
    """Add Sidebar to a dashboard page"""
    with open(filepath, 'r') as f:
        content = f.read()
    
    # Add Sidebar import if specified
    if import_statement:
        if "import Sidebar from '@/components/Sidebar'" not in content:
            content = content.replace(
                import_statement,
                import_statement + "\nimport Sidebar from '@/components/Sidebar';"
            )
    
    # Find the main return statement
    # Pattern: "  return (\n    <div className="min-h-screen bg-slate-900..."
    return_pattern = r"(  return \(\n    <div className=\"min-h-screen bg-slate-900[^>]*>\n      <div className=\"max-w-7xl mx-auto\">\n)"
    
    if not re.search(return_pattern, content):
        print(f"Could not find return pattern in {filepath}")
        return False
    
    # Replace the opening
    new_opening = """  return (
    <div className="flex h-screen bg-slate-900">
      <Sidebar user={user} />
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="max-w-7xl mx-auto">
"""
    
    content = re.sub(return_pattern, new_opening, content)
    
    # Now find all lines between the new opening and the function closing
    # and indent them by 4 spaces if they're not already at the right level
    
    # Find the position of the first line after "  return ("
    lines = content.split('\n')
    return_line = -1
    for i, line in enumerate(lines):
        if line.strip() == 'return (':
            return_line = i
            break
    
    if return_line == -1:
        print(f"Could not find return line in {filepath}")
        return False
    
    # Find the closing brace for the return statement
    # We need to track brace counting
    opening_count = 0
    closing_line = -1
    in_return = False
    
    for i in range(return_line, len(lines)):
        line = lines[i]
        
        if i == return_line:
            in_return = True
            opening_count = line.count('(')
        
        if in_return:
            opening_count += line.count('(')
            opening_count -= line.count(')')
            
            if opening_count == 0 and i > return_line + 2:
                closing_line = i
                break
    
    if closing_line == -1:
        print(f"Could not find closing brace for return in {filepath}")
        return False
    
    # Now indent lines from return_line + 8 (the first "actual" content line) 
    # to closing_line - 1 by 4 spaces
    # But we need to be careful - the lines from the new wrapper opening should be
    # indented correctly already
    
    # Strategy: Find lines that start with 8 spaces followed by non-whitespace
    # (these are the original content indented for the old wrapper level)
    # and indent them to 12 spaces (for the new wrapper level)
    
    content_start = return_line + 7  # Skip to first content line
    
    new_lines = []
    for i, line in enumerate(lines):
        if content_start <= i < closing_line:
            if line.startswith('        ') and not line.startswith('          '):
                # This line is at the old indent level (8 spaces)
                # Indent it by 4 more spaces
                line = '    ' + line
        new_lines.append(line)
    
    content = '\n'.join(new_lines)
    
    # Replace the closing structure
    old_closing = """      </div>
    </div>
  );
}"""
    
    new_closing = """      </div>
      </div>
    </div>
    </main>
  </div>
  );
}"""
    
    content = content.replace(old_closing, new_closing)
    
    with open(filepath, 'w') as f:
        f.write(content)
    
    print(f"✓ {filepath}")
    return True

# Pages to process
pages = {
    'app/dashboard/health/page.tsx': "import { mockInspections, mockFacilities } from '@/lib/mock-data';",
    'app/dashboard/quality/page.tsx': "import { mockQualityMeasures } from '@/lib/mock-data';",
    'app/dashboard/alerts/page.tsx': "import { mockAlerts } from '@/lib/mock-data';",
    'app/dashboard/cms/page.tsx': "import { API_URL } from '@/lib/api-config';",
    'app/dashboard/staffing/page.tsx': "import { mockStaffing } from '@/lib/mock-data';",
}

for filepath, import_line in pages.items():
    add_sidebar_to_page(filepath, import_line)

print("\nDone!")
