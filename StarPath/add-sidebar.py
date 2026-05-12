#!/usr/bin/env python3
"""Add Sidebar component to all dashboard pages"""
import re
import os

pages = [
    ('starpath-frontend/app/dashboard/health/page.tsx', 'mockInspections, mockFacilities'),
    ('starpath-frontend/app/dashboard/quality/page.tsx', 'mockQualityMeasures'),
    ('starpath-frontend/app/dashboard/alerts/page.tsx', 'mockAlerts'),
    ('starpath-frontend/app/dashboard/cms/page.tsx', None),  # Different imports
    ('starpath-frontend/app/dashboard/staffing/page.tsx', 'mockStaffing'),
]

for filepath, mock_data in pages:
    if not os.path.exists(filepath):
        print(f"✗ File not found: {filepath}")
        continue
    
    with open(filepath, 'r') as f:
        content = f.read()
    
    # Add Sidebar import after useAuth import
    if 'import Sidebar' not in content:
        content = re.sub(
            r"(import \{ useAuth \} from '@/lib/useAuth';)",
            r"\1\nimport Sidebar from '@/components/Sidebar';",
            content
        )
    
    # Update return statement - from min-h-screen to flex layout with Sidebar
    content = re.sub(
        r'return \(\s*<div className="min-h-screen bg-slate-900 px-4 sm:px-6 lg:px-8 py-8">\s*<div className="max-w-7xl mx-auto">',
        '''return (
    <div className="flex h-screen bg-slate-900">
      <Sidebar user={user} />
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="max-w-7xl mx-auto">''',
        content
    )
    
    # Fix closing tags - from </div></div></div> to </div></div></main></div>
    # Find the pattern and replace carefully
    lines = content.split('\n')
    new_lines = []
    indent_stack = []
    
    for i, line in enumerate(lines):
        # Check if this is near the end of the return statement
        if i >= len(lines) - 10 and line.strip() == '</div>' and i > len(lines) - 6:
            # Check if we need to inject closing tags
            if i == len(lines) - 5 and new_lines[-1].strip() == '</div>' and new_lines[-2].strip() == '</div>':
                # This is the last two divs, replace with proper closing
                new_lines.pop()  # Remove last </div>
                new_lines.pop()  # Remove second to last </div>
                new_lines.append('          </div>')
                new_lines.append('        </div>')
                new_lines.append('      </main>')
                new_lines.append('    </div>')
                continue
        
        new_lines.append(line)
    
    content = '\n'.join(new_lines)
    
    with open(filepath, 'w') as f:
        f.write(content)
    
    print(f"✓ Updated: {filepath}")

print("\n✓ Sidebar component added to all dashboard pages")
