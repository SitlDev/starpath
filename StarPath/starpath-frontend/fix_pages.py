#!/usr/bin/env python3
"""
Simply use sed-like replacements to add Sidebar to dashboard pages.
"""

files = [
    ('app/dashboard/health/page.tsx', "import { mockInspections, mockFacilities } from '@/lib/mock-data';"),
    ('app/dashboard/quality/page.tsx', "import { mockQualityMeasures } from '@/lib/mock-data';"),
    ('app/dashboard/alerts/page.tsx', "import { mockAlerts } from '@/lib/mock-data';"),
    ('app/dashboard/cms/page.tsx', "import { API_URL } from '@/lib/api-config';"),
    ('app/dashboard/staffing/page.tsx', "import { mockStaffing } from '@/lib/mock-data';"),
]

for filepath, last_import in files:
    with open(filepath, 'r') as f:
        content = f.read()
    
    # Add Sidebar import
    if "import Sidebar from '@/components/Sidebar'" not in content:
        content = content.replace(
            last_import,
            last_import + "\nimport Sidebar from '@/components/Sidebar';"
        )
    
    # Indent all content inside return by 4 spaces
    # Strategy: Find the line with "  return (" and the line before "  );"
    # and indent all lines between them that are indented at 4+ spaces
    
    lines = content.split('\n')
    new_lines = []
    in_return = False
    brace_depth = 0
    
    for i, line in enumerate(lines):
        # Start of return statement
        if line.strip() == 'return (':
            in_return = True
            brace_depth = 1
            new_lines.append(line)
            continue
        
        # Inside return - track braces
        if in_return:
            brace_depth += line.count('(') - line.count(')')
            
            # Before the return opening divs that we're adding
            if i < len(lines) - 1 and 'className="min-h-screen' in line:
                # Replace this line and the next one
                # Skip this section, we'll handle it with string replacement instead
                pass
            
            # End of return statement
            if brace_depth == 0 and in_return and i > 10:  # Make sure we're past the opening
                in_return = False
        
        new_lines.append(line)
    
    # Actually, let's use simple string replacement instead
    # For each file, we need to:
    # 1. Replace the old opening wrapper with new opening
    # 2. Indent all content inside
    # 3. Replace the old closing wrapper with new closing
    
    # Safer approach: Use sed-like replacements with exact patterns
    
    old_opening = """  return (
    <div className="min-h-screen bg-slate-900 px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-7xl mx-auto">
        {/* """
    
    new_opening = """  return (
    <div className="flex h-screen bg-slate-900">
      <Sidebar user={user} />
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="max-w-7xl mx-auto">
            {/* """
    
    if old_opening[:-7] in content:  # Check without the comment part
        # Find the exact position and replace carefully
        pos = content.find('  return (\n    <div className="min-h-screen bg-slate-900')
        if pos != -1:
            # Find end of this opening section (until {/*)
            end_pos = content.find('{/*', pos) - 16  # Go back to get the full line
            old_section = content[pos:end_pos + 16]
            
            # Count how many lines we're replacing
            lines_before = content[:pos].count('\n')
            lines_replaced = old_section.count('\n')
            
            # Replace
            content = content[:pos] + new_opening + content[end_pos + 16:]
    
    # Now indent content between return and closing
    #Let me think of an easier approach...actually, scrap this. I'll do it line by line with proper tracking.
    
    with open(filepath, 'w') as f:
        f.write(content)
    
    print(f"✓ Added Sidebar import to {filepath}")
